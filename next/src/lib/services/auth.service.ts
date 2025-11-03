import { Types } from "mongoose";
import userRepository from "@/lib/database/repos/user.repo";
import signUpRequestRepository from "@/lib/database/repos/signUpRequest.repo";
import {
    generateJWToken,
    validateJWToken,
} from "@/lib/services/core/jwt.core.service";
import { OAuth2Client } from "google-auth-library";
import {
    hashString,
    verifyStringAndHash,
} from "@/lib/services/core/hash.core.service";
import { generateOTP } from "@/lib/services/core/otp.core.service";
import { sendOTPEmail } from "@/lib/services/core/email.core.service";
import {
    ISession,
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    APIControl,
    EUserDesignation,
} from "@/lib/types/index.types";
import { SESSION_COOKIE_NAME } from "@/lib/config/constants";
import AppError from "../utils/error";
import teamRepository from "../database/repos/team.repo";
import getEnvVariable from "../utils/envVariable";
import axios from 'axios';


const me: ServiceSignature<
    SDIn.Auth.Me,
    SDOut.Auth.Me,
    true
> = async ({ }, session) => {
    const user = await userRepository.findById(session.userId);

    if (!user) {
        throw new AppError("Session exists, but user not found.", { session });
    }

    let teamName = "No Team";
    if (user.teamId) {
        const team = await teamRepository.findById(user.teamId);
        if (team) {
            teamName = team.name;
        }
    }

    return {
        success: true,
        data: {
            ...user,
            _id: user._id.toHexString(),
            passwordHash: undefined,
            teamId: undefined,
            team: {
                _id: user.teamId?.toHexString() ?? null,
                name: teamName,
            }
        },
    };
};

const signIn: ServiceSignature<
    SDIn.Auth.SignIn,
    SDOut.Auth.SignIn,
    false
> = async (data) => {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "No account found with this email.",
        };
    }

    if (user.passwordHash === null) {
        return {
            success: false,
            errorCode: ESECs.INVALID_CREDENTIALS,
            errorMessage: "The password you provided is incorrect.",
        };
    }

    const isValid = await verifyStringAndHash(data.password, user.passwordHash);

    if (!isValid) {
        return {
            success: false,
            errorCode: ESECs.INVALID_CREDENTIALS,
            errorMessage: "The password you provided is incorrect.",
        };
    }

    const token = await generateJWToken({
        _id: user._id.toString(),
        roles: user.roles,
    });

    return {
        success: true,
        data: {
            token,
        },
    };
};

const __googleOAuthClient = new OAuth2Client(
    getEnvVariable("GOOGLE_OAUTH_CLIENT_ID", true)
);

const googleOAuth: ServiceSignature<
    SDIn.Auth.GoogleOAuth,
    SDOut.Auth.GoogleOAuth,
    false
> = async (data) => {
    let userEmail: string = "";
    let userName: string | undefined = "";
    let userPicture: string | undefined = "";

    try {
        const apiResponse = await axios.post<{
            id_token: string;
        }>(
            "https://oauth2.googleapis.com/token",
            new URLSearchParams({
                code: data.code,
                client_id: getEnvVariable("GOOGLE_OAUTH_CLIENT_ID", true),
                client_secret: getEnvVariable("GOOGLE_OAUTH_CLIENT_SECRET", true),
                redirect_uri: getEnvVariable("GOOGLE_OAUTH_REDIRECT_URI", true),
                grant_type: "authorization_code",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (apiResponse.status !== 200) {
            return {
                success: false,
                errorCode: ESECs.GOOGLE_OAUTH_FAILED,
                errorMessage: "Unable to verify code from google."
            };
        }

        if (!apiResponse.data.id_token) {
            return {
                success: false,
                errorCode: ESECs.GOOGLE_OAUTH_FAILED,
                errorMessage: "Didn't receive user information from google."
            };
        }

        const ticket = await __googleOAuthClient.verifyIdToken({
            idToken: apiResponse.data.id_token,
            audience: getEnvVariable("GOOGLE_OAUTH_CLIENT_ID", true),
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return {
                success: false,
                errorCode: ESECs.GOOGLE_OAUTH_FAILED,
                errorMessage: "Missing user information from google."
            };
        }

        if (!payload?.email_verified) {
            return {
                success: false,
                errorCode: ESECs.GOOGLE_OAUTH_FAILED,
                errorMessage: "Google account email not verified. Rejecting request. ",
            };
        }

        userEmail = payload.email;
        userName = payload.name;
        userPicture = payload.picture;
    } catch (_error) {
        throw new AppError("Error while processing google oauth request");
    }

    let user = await userRepository.findByEmail(userEmail);

    if (!user) {
        user = await userRepository.insert({
            name: userName ?? "Unnamed User",
            email: userEmail,
            passwordHash: null,
            roles: [
                EUserRole.GUEST,
            ],
            designation: EUserDesignation.NONE
        });

        if (userPicture) {
            await userRepository.updateById(user._id, {
                profileImgMediaKey: userPicture
            });
        }
        else {
            await userRepository.updateById(user._id, {
                profileImgMediaKey: `user-assets/${user._id.toHexString()}/profileImage`
            });
        }
    }

    const token = await generateJWToken({
        _id: user._id.toString(),
        roles: user.roles,
    });

    return {
        success: true,
        data: {
            token,
        },
    };
};

const signOut: ServiceSignature<
    SDIn.Auth.SignOut,
    SDOut.Auth.SignOut,
    true
> = async ({ }, { }) => {
    return {
        success: true,
        data: {
            token: "INVALID_TOKEN",
        },
    };
};

const signUp: ServiceSignature<
    SDIn.Auth.SignUp,
    SDOut.Auth.SignUp,
    false
> = async (data) => {
    if (data.target === APIControl.Auth.SignUp.Target.REQUEST) {
        return signUpRequest(data, null);
    }

    if (data.target === APIControl.Auth.SignUp.Target.RESEND_OTP) {
        return signUpRequestResendOTP(data, null);
    }

    if (data.target === APIControl.Auth.SignUp.Target.VERIFY) {
        return signUpVerify(data, null);
    }

    throw new AppError(
        "APIControl.Auth.SignUp is something other than REQUEST, RESEND_OTP, and VERIFY",
        { data }
    );
}

const signUpRequest: ServiceSignature<
    SDIn.Auth.SignUpRequest,
    SDOut.Auth.SignUpRequest,
    false
> = async (data) => {
    const user = await userRepository.findByEmail(data.email);
    if (user) {
        return {
            success: false,
            errorCode: ESECs.EMAIL_TAKEN,
            errorMessage: "An account with this email already exists.",
        };
    }

    const otp = generateOTP();

    const passwordHash = await hashString(data.password);
    const otpHash = await hashString(otp);

    const signUpRequestDoc = {
        name: data.name,
        email: data.email,
        passwordHash,
        otpHash,
        expiresAt: new Date(Date.now() + 600 * 1000),
    };

    const prevAttempt = await signUpRequestRepository.findByEmail(data.email);
    if (prevAttempt) {
        await signUpRequestRepository.updateById(prevAttempt._id, signUpRequestDoc);
    } else {
        await signUpRequestRepository.insert(signUpRequestDoc);
    }

    sendOTPEmail(data.email, otp);

    return {
        success: true,
        data: {},
    };
};

const signUpRequestResendOTP: ServiceSignature<
    SDIn.Auth.SignUpRequestResendOTP,
    SDOut.Auth.SignUpRequestResendOTP,
    false
> = async (data) => {
    const prevRequest = await signUpRequestRepository.findByEmail(data.email);
    if (!prevRequest) {
        return {
            success: false,
            errorCode: ESECs.SIGNUP_REQUEST_NOT_FOUND,
            errorMessage: "No pending sign-up request found for this email.",
        };
    }

    const resendBlockedTill = prevRequest.updatedAt.getTime() + 60 * 1000;

    if (Date.now() < resendBlockedTill) {
        return {
            success: false,
            errorCode: ESECs.TOO_MANY_REQUESTS,
            errorMessage: "Please wait a moment before requesting a new code.",
        };
    }

    const otp = generateOTP();
    const otpHash = await hashString(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await signUpRequestRepository.updateById(prevRequest._id, {
        otpHash,
        expiresAt,
    });

    sendOTPEmail(data.email, otp);

    return {
        success: true,
        data: {},
    };
};

const signUpVerify: ServiceSignature<
    SDIn.Auth.SignUpVerify,
    SDOut.Auth.SignUpVerify,
    false
> = async (data) => {
    const request = await signUpRequestRepository.findByEmail(data.email);
    if (!request) {
        return {
            success: false,
            errorCode: ESECs.SIGNUP_REQUEST_NOT_FOUND,
            errorMessage: "No pending sign-up request found.",
        };
    }

    const isOTPExpired = request.expiresAt.getTime() < Date.now();
    const isOTPValid = await verifyStringAndHash(data.otp, request.otpHash);

    if (isOTPExpired || !isOTPValid) {
        return {
            success: false,
            errorCode: ESECs.INVALID_OTP,
            errorMessage: "Invalid or expired verification code.",
        };
    }

    const newUser = await userRepository.insert({
        name: request.name,
        email: request.email,
        passwordHash: request.passwordHash,
        roles: [
            EUserRole.GUEST,
        ],
        designation: EUserDesignation.NONE
    });

    await signUpRequestRepository.removeById(request._id);

    await userRepository.updateById(newUser._id, {
        profileImgMediaKey: `user-assets/${newUser._id.toHexString()}/profileImage`
    });

    return {
        success: true,
        data: {},
    };
};

const changePassword: ServiceSignature<
    SDIn.Auth.ChangePassword,
    SDOut.Auth.ChangePassword,
    true
> = async (data, session) => {
    const user = await userRepository.findById(session.userId);
    if (!user) {
        throw new AppError("Session exists, but user not found.", { session });
    }

    let isCurrentPasswordValid = true;

    if (user.passwordHash !== null) {
        isCurrentPasswordValid = await verifyStringAndHash(
            data.password,
            user.passwordHash
        );
    }

    if (!isCurrentPasswordValid) {
        return {
            success: false,
            errorCode: ESECs.INVALID_CREDENTIALS,
            errorMessage: "The password you provided is incorrect.",
        };
    }

    const newPasswordHash = await hashString(data.newPassword);

    await userRepository.updateById(session.userId, {
        passwordHash: newPasswordHash,
    });

    return {
        success: true,
        data: {},
    };
};

const extractSession = async (request: Request): Promise<ISession | null> => {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookieMap = Object.fromEntries(
        cookieHeader
            .split(";")
            .map((c) => c.trim().split("="))
            .filter(([k, v]) => k && v)
    );

    const token = cookieMap[SESSION_COOKIE_NAME];
    if (!token) {
        return null;
    }

    const payload = await validateJWToken(token);
    if (!payload) {
        return null;
    }

    if (typeof payload._id !== "string" || !Types.ObjectId.isValid(payload._id)) {
        return null;
    }

    const user = await userRepository.findById(new Types.ObjectId(payload._id));
    if (!user) {
        return null;
    }

    return {
        userId: user._id,
        userEmail: user.email,
        userRoles: user.roles,
    };
};

const authServices = {
    me,
    signIn,
    googleOAuth,
    signOut,
    signUp,
    changePassword,
    extractSession,
};

export default authServices;
