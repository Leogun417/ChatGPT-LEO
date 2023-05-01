import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";
import * as CryptoJS from "crypto-js";

const serverConfig = getServerSideConfig();

function generateKey(expirationHours: number, secret: string): string {
  const dt = new Date();
  const expirationTime = new Date(
    dt.getTime() + expirationHours * 60 * 60 * 1000,
  ).getTime();
  const randomSize = 16;
  const keyBytes = CryptoJS.lib.WordArray.random(randomSize);
  const key = CryptoJS.enc.Hex.stringify(keyBytes);

  // 对密钥进行加密
  const encryptedKey = CryptoJS.AES.encrypt(
    `${key}:${dt.getTime()}:${expirationTime}`,
    secret,
  ).toString();

  return encryptedKey;
}

export async function POST(req: NextRequest) {
  const { hours } = await req.json();
  return NextResponse.json({
    token: generateKey(hours, serverConfig.secret || ""),
  });
}
