import nodemailer, { SendMailOptions } from "nodemailer";
import AppError from "@/lib/utils/error";
import getEnvVariable from "@/lib/utils/envVariable";
import log, { ELogLevel } from './logger';
import { IEmail } from '@/lib/types/index.types';


let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: getEnvVariable("SMTP_HOST", true),
            port: Number(getEnvVariable("SMTP_PORT", true)),
            secure: true,
            auth: {
                user: getEnvVariable("SMTP_USERNAME", true),
                pass: getEnvVariable("SMTP_PASSWORD", true),
            },
        } as SendMailOptions);
    }
    return transporter;
};


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
