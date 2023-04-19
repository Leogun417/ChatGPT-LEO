import {NextRequest, NextResponse} from "next/server";
import {getServerSideConfig} from "./app/config/server";
import md5 from "spark-md5";
import * as jose from "node-jose";

export const config = {
    matcher: ["/api/openai", "/api/chat-stream"],
};

const serverConfig = getServerSideConfig();

async function verifyJwtToken(jwtToken: string): Promise<jose.JWS.VerificationResult> {
    // 获取公钥
    const key = await jose.JWK.asKey({
        kty: 'RSA',
        n: serverConfig.n,
        e: serverConfig.e
    });

    // 校验JWT Token
    return await jose.JWS.createVerify(key)
        .verify(jwtToken);
}


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

    let validToken = true;
    try {
        verifyJwtToken(accessCode);
    } catch (err) {
        validToken = false;
    }

    if (serverConfig.needCode
        && !serverConfig.codes.has(hashedCode)
        && !validToken && !token) {
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
