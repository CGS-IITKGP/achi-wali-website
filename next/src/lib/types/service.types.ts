/* eslint-disable @typescript-eslint/no-namespace */

import { Types } from "mongoose";
import { EUserRole } from "./domain.types";
import { APIControl, EmptyObject } from "./index.types";

export enum ESECs {
  USER_NOT_FOUND,
  SIGNUP_REQUEST_NOT_FOUND,
  EMAIL_TAKEN,
  INVALID_CREDENTIALS,
  INVALID_JWT,
  INVALID_OTP,
  TOO_MANY_REQUESTS,
  FORBIDDEN,
  TEAM_NOT_FOUND,
  TEAM_NAME_TAKEN,
  NOT_TEAM_MEMBER,
}

export namespace SDIn {
  export namespace Auth {
    export type Me = EmptyObject;

    export type SignIn = {
      email: string;
      password: string;
    };

    export type SignOut = EmptyObject;

    export type SignUp =
      | ({
          target: APIControl.Auth.SignUp.REQUEST;
        } & SignUpRequest)
      | ({
          target: APIControl.Auth.SignUp.RESEND_OTP;
        } & SignUpRequestResendOTP)
      | ({
          target: APIControl.Auth.SignUp.VERIFY;
        } & SignUpVerify);

    export type SignUpRequest = {
      name: string;
      email: string;
      password: string;
    };

    export type SignUpRequestResendOTP = {
      email: string;
    };

    export type SignUpVerify = {
      email: string;
      otp: string;
    };

    export type ChangePassword = {
      password: string;
      newPassword: string;
    };
  }

  export namespace Team {
    export type Get = {
      _id: Types.ObjectId;
    };

    export type GetAll = EmptyObject;

    export type Create = {
      name: string;
      description: string;
    };

    export type Update = {
      _id: Types.ObjectId;
      name?: string;
      description?: string;
      coverImageMediaKey?: string;
    };

    export type AddMembers = {
      _id: Types.ObjectId;
      memberIds: Types.ObjectId[];
    };

    export type Remove = {
      _id: Types.ObjectId;
    };
  }

  export namespace User {
    export type Get =
      | ({
          target: APIControl.User.Get.RESTRICTED;
        } & GetRestricted)
      | ({
          target: APIControl.User.Get.UNRESTRICTED;
        } & GetUnrestricted)
      | ({
          target: APIControl.User.Get.ALL;
        } & GetAll);

    export type GetRestricted = {
      _id: Types.ObjectId;
    };

    export type GetUnrestricted = GetRestricted;
    export type GetAll = EmptyObject;

    export type Update = {
      name?: string;
      profileImgMediaKey?: string | null;
      phoneNumber?: string;
      links?: {
        label: string;
        url: string;
      }[];
    };
    export type UpdateRoles = {
      _id: Types.ObjectId;
      roles: EUserRole[];
    };

    export type Remove = Get;
  }
}

export namespace SDOut {
  export namespace Auth {
    export type Me = {
      _id: string;
      name: string;
      email: string;
      profileImgMediaKey: string | null;
      phoneNumber: string | null;
      links: {
        label: string;
        url: string;
      }[];
      teamId: string | null;
      roles: EUserRole[];
      createdAt: Date;
      updatedAt: Date;
    };

    export type SignIn = {
      token: string;
    };

    export type SignOut = {
      token: string;
    };

    export type SignUp = EmptyObject;
    export type SignUpRequest = EmptyObject;
    export type SignUpRequestResendOTP = EmptyObject;
    export type SignUpVerify = EmptyObject;
    export type ChangePassword = EmptyObject;

    export type ExtractSession = {
      userId: Types.ObjectId;
      userEmail: string;
      userRoles: EUserRole[];
    };
  }

  export namespace Team {
    export type Get = {
      _id: string;
      name: string;
      description: string;
      members: string[];
      coverImageMediaKey: string | null;
      createdAt: Date;
      updatedAt: Date;
    };

    export type GetAll = {
      _id: string;
      name: string;
      description: string;
      coverImageMediaKey: string | null;
    }[];

    export type Create = EmptyObject;
    export type Update = EmptyObject;
    export type AddMembers = EmptyObject;
    export type Remove = EmptyObject;
  }

  export namespace User {
    // Get encompasses GetRestricted, GetUnrestricted, and GetAll.
    export type Get = object;

    export type GetRestricted = {
      _id: string;
      name: string;
      email: string;
      profileImgMediaKey: string | null;
      roles: EUserRole[];
      teamId: string | null;
      links: {
        label: string;
        url: string;
      }[];
      createdAt: Date;
    };

    export type GetUnrestricted = GetRestricted & {
      phoneNumber: string | null;
      updatedAt: Date;
    };

    export type GetAll = {
      _id: string;
      name: string;
      email: string;
      profileImgMediaKey: string | null;
      roles: EUserRole[];
      teamId: string | null;
    }[];

    export type Update = EmptyObject;
    export type UpdateRoles = EmptyObject;
    export type Remove = EmptyObject;
  }
}

export namespace SECs {
  export namespace Misc {
    export type Health = never;
  }

  // Auth
  export type AuthMe = never;

  export type AuthSignIn = ESECs.USER_NOT_FOUND | ESECs.INVALID_CREDENTIALS;

  export type AuthSignOut = never;

  export type AuthSignUpRequest = ESECs.EMAIL_TAKEN;

  export type AuthSignUpRequestResendOTP =
    | ESECs.SIGNUP_REQUEST_NOT_FOUND
    | ESECs.TOO_MANY_REQUESTS;

  export type AuthSignUpVerify =
    | ESECs.SIGNUP_REQUEST_NOT_FOUND
    | ESECs.INVALID_OTP;

  export type AuthChangePassword = ESECs.INVALID_CREDENTIALS;

  export type AuthExtractSession = ESECs.INVALID_JWT;

  // Team
  export type TeamGet = ESECs.TEAM_NOT_FOUND;
  export type TeamGetAll = never;
  export type TeamCreate = ESECs.TEAM_NAME_TAKEN | ESECs.FORBIDDEN;
  export type TeamUpdate =
    | ESECs.TEAM_NOT_FOUND
    | ESECs.TEAM_NAME_TAKEN
    | ESECs.FORBIDDEN;
  export type TeamAddMembers =
    | ESECs.TEAM_NOT_FOUND
    | ESECs.USER_NOT_FOUND
    | ESECs.FORBIDDEN;
  export type TeamRemove = ESECs.TEAM_NOT_FOUND | ESECs.FORBIDDEN;

  export type GetAll = never;

  export type Create = ESECs.TEAM_NAME_TAKEN | ESECs.FORBIDDEN;

  export type Update =
    | ESECs.TEAM_NOT_FOUND
    | ESECs.TEAM_NAME_TAKEN
    | ESECs.FORBIDDEN;

  export type AddMembers =
    | ESECs.TEAM_NOT_FOUND
    | ESECs.USER_NOT_FOUND
    | ESECs.FORBIDDEN;

  export type Remove = ESECs.TEAM_NOT_FOUND | ESECs.FORBIDDEN;
}

export namespace User {
  export type Get = ESECs.USER_NOT_FOUND | ESECs.FORBIDDEN;

  export type GetUnrestricted = ESECs.USER_NOT_FOUND | ESECs.FORBIDDEN;

  export type GetAll = ESECs.FORBIDDEN;

  export type Update = ESECs.USER_NOT_FOUND | ESECs.FORBIDDEN;

  export type UpdateRoles = ESECs.USER_NOT_FOUND | ESECs.FORBIDDEN;

  export type Remove = ESECs.USER_NOT_FOUND | ESECs.FORBIDDEN;
}

/* eslint-enable @typescript-eslint/no-namespace */
