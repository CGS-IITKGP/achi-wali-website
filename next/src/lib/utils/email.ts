import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import AppError from "@/lib/utils/error";
import getEnvVariable from "@/lib/utils/envVariable";
import log, { ELogLevel } from './logger';
import { IEmail } from '@/lib/types/index.types';


// Lazily create the transporter so env vars are only read at runtime,
// not at build time when Next.js evaluates module-level code.
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
    if (!_transporter) {
        _transporter = nodemailer.createTransport({
            host: getEnvVariable("SMTP_HOST", true),
            port: Number(getEnvVariable("SMTP_PORT", true)),
            secure: true,
            auth: {
                user: getEnvVariable("SMTP_USERNAME", true),
                pass: getEnvVariable("SMTP_PASSWORD", true),
            },
        } as SendMailOptions);
    }
    return _transporter;
}


const sendEmail = async (data: IEmail): Promise<true> => {
    try {
        const mailOptions = {
            from: getEnvVariable("SMTP_FROM", true),
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html
        };

        await getTransporter().sendMail(mailOptions);
    } catch (error) {
        throw new AppError("Failed to send email.", {
            data,
            error,
        });
    }

    return true;
}

const verifySMTPConnection = async (): Promise<boolean> => {
    try {
        await getTransporter().verify();
    } catch (error) {
        log(ELogLevel.FATAL, "SMTP: Couldn't connect to SMTP server.", {
            error
        });
        return false;
    }

    return true;
}


export default sendEmail;
export {
    verifySMTPConnection
};
