import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import { getJWTSecretKey } from "@/lib/utils/secret";
import AppError from "@/lib/utils/error";
import { JWTPayload } from "@/lib/types/index.types";


const generateJWToken = async (
    payload: JWTPayload,
    customSecretKey?: Uint8Array
): Promise<string> => {
    try {
        const secretKey = customSecretKey ?? getJWTSecretKey();

        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            //.setExpirationTime(Math.floor(Date.now() / 1000) + dataPolicyRules.security.jwt.expiresInSecs)
            .setExpirationTime(Math.floor(Date.now() / 1000) + 5000)
            .setIssuedAt()
            .sign(secretKey);

        return token;
    } catch (error) {
        throw new AppError("CoreService/JWT: Failed to generate JWT token.", {
            payload,
            error,
        });
    }
};


const validateJWToken = async (
    token: string,
    customSecretKey?: Uint8Array
): Promise<JWTPayload | null> => {
    try {
        const secretKey = customSecretKey ?? getJWTSecretKey();

        const { payload } = await jwtVerify(token, secretKey);

        return payload as JWTPayload;

    } catch (error) {
        if (
            error instanceof joseErrors.JWTExpired ||
            error instanceof joseErrors.JOSEError
        ) {
            return null;
        } else {
            throw new AppError("CoreService/JWT: Failed to verify JWT token.", {
                token,
                error,
            });
        }
    }
};

export { generateJWToken, validateJWToken };
