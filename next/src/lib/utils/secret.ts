import getEnvVariable from "./envVariable";

let cachedJWTSecret: Uint8Array | null = null;
let cachedGameSecret: Uint8Array | null = null;

const getJWTSecretKey = (): Uint8Array => {
    if (cachedJWTSecret) {
        return cachedJWTSecret;
    }

    cachedJWTSecret =
        new TextEncoder().encode(getEnvVariable("JWT_SECRET_KEY", true));

    return cachedJWTSecret;
};

const getGameSecretKey = (): Uint8Array => {
    if (cachedGameSecret) {
        return cachedGameSecret;
    }

    const secret = process.env.GAME_SECRET ?? getEnvVariable("GAME_SECRET", true);

    cachedGameSecret = new TextEncoder().encode(secret);

    return cachedGameSecret;
};

export { getJWTSecretKey, getGameSecretKey };

