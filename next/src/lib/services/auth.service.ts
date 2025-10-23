import { Types } from "mongoose";
import userRepository from "@/lib/database/repos/user.repo";
import signUpRequestRepository from "@/lib/database/repos/signUpRequest.repo";
import {
    generateJWToken,
    validateJWToken,
} from "@/lib/services/core/jwt.core.service";
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
} from "@/lib/types/index.types";
import { SESSION_COOKIE_NAME } from "@/lib/config/constants";
import AppError from "../utils/error";
import teamRepository from "../database/repos/team.repo";


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

    await userRepository.insert({
        name: request.name,
        email: request.email,
        passwordHash: request.passwordHash,
        roles: [
            EUserRole.GUEST,
            // TODO: REMOVE THIS.
            // NOTE: Until we have an admin panel,
            // let all users be a member.
            EUserRole.MEMBER
        ],
    });

    await signUpRequestRepository.removeById(request._id);

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

    const isCurrentPasswordValid = await verifyStringAndHash(
        data.password,
        user.passwordHash
    );

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
    signOut,
    signUp,
    changePassword,
    extractSession,
};

export default authServices;
