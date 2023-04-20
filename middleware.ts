import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "./app/config/server";
import md5 from "spark-md5";
import * as CryptoJS from 'crypto-js';

function verifyKey(key:string, secret:string)  {
  let keyObj;

  try {
    // 使用密钥解密并解析出密钥相关信息
    const decryptedKey = CryptoJS.AES.decrypt(key, secret).toString(CryptoJS.enc.Utf8);
    const keyArray = decryptedKey.split(':');
    keyObj = {
      key: keyArray[0],
      createdAt: parseInt(keyArray[1]),
      expiration: parseInt(keyArray[2])
    };
  } catch (e) {
    return false;
  }

  const now = new Date().getTime();

  if (now > keyObj.expiration) {
    return false; // 密钥已过期
  }


  // 计算验证值
  const expectedValue = CryptoJS.enc.Hex.parse(keyObj.key.toString())
      .toString();
  const actualValue = keyObj.key;
  if (expectedValue !== actualValue) {
    return false;
  }

  return true; // 密钥有效
};

export const config = {
  matcher: ["/api/openai", "/api/chat-stream"],
};

const serverConfig = getServerSideConfig();

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

export function middleware(req: NextRequest) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();

  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode) && verifyKey(accessCode, serverConfig.secret||'') && !token) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      },
    );
  }

  // inject api key
  if (!token) {
    const apiKey = serverConfig.apiKey;
    if (apiKey) {
      console.log("[Auth] set system token");
      req.headers.set("token", apiKey);
    } else {
      return NextResponse.json(
        {
          error: true,
          msg: "Empty Api Key",
        },
        {
          status: 401,
        },
      );
    }
  } else {
    console.log("[Auth] set user token");
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}
