import systemLogger, { ELogLevel } from "@/lib/utils/logger";

type GetEnvVariable = {
    (envVarName: string, fatalIfNotFound: true): string;
    (envVarName: string, fatalIfNotFound: false): string | undefined;
};

const getEnvVariable: GetEnvVariable = ((envVarName, fatalIfNotFound) => {
    envVarName = "BACKEND_" + envVarName.trim().toUpperCase();

    const envVarValue = process.env[envVarName];

    if (!envVarValue && fatalIfNotFound) {
        systemLogger(
            ELogLevel.FATAL,
            `FATAL ERROR: Environment variable "${envVarName}" is not set!`
        );
        systemLogger(ELogLevel.FATAL, `*** EXIT PROCESS IMMEDIATELY ***`);
    }

    return envVarValue;
}) as GetEnvVariable;

export default getEnvVariable;
