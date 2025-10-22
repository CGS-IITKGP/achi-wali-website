/* eslint-disable @typescript-eslint/no-namespace */

import { Types } from "mongoose";
import { EFeaturedType, EProjectPortfolio, EUserRole } from "./domain.types";
import { APIControl, EmptyObject } from "./index.types";

export enum ESECs {
    USER_NOT_FOUND,
    SIGNUP_REQUEST_NOT_FOUND,
    EMAIL_TAKEN,

    INVALID_CREDENTIALS,
    INVALID_JWT,
    INVALID_OTP,
    UNAUTHORIZED,

    TOO_MANY_REQUESTS,
    FORBIDDEN,

    TEAM_NOT_FOUND,
    TEAM_NAME_TAKEN,
    NOT_TEAM_MEMBER,

    PROJECT_NOT_FOUND,

    BLOG_NOT_FOUND,
    SLUG_ALREADY_IN_USE,
    SLUG_NOT_FOUND,

    FEATURED_NOT_FOUND,
    ALREADY_FEATURED,
}

export namespace SDIn {
    export namespace Auth {
        export type Me = EmptyObject;

        export type SignIn = {
            email: string,
            password: string,
        }

        export type SignOut = EmptyObject;

        export type SignUp =
            | ({
                target: APIControl.Auth.SignUp.Target.REQUEST;
            } & SignUpRequest)
            | ({
                target: APIControl.Auth.SignUp.Target.RESEND_OTP;
            } & SignUpRequestResendOTP)
            | ({
                target: APIControl.Auth.SignUp.Target.VERIFY;
            } & SignUpVerify);

        export type SignUpRequest = {
            name: string;
            email: string;
            password: string;
        }

        export type SignUpRequestResendOTP = {
            email: string;
        }

        export type SignUpVerify = {
            email: string;
            otp: string;
        }

        export type ChangePassword = {
            password: string,
            newPassword: string,
        };
    }

    export namespace Team {
        export type Get =
            ({
                target: APIControl.Team.Get.Target.ONE,
                _id: Types.ObjectId
            }) | ({
                target: APIControl.Team.Get.Target.ALL
            });

        export type Create = {
            name: string,
            description: string,
        };

        export type Update = {
            _id: Types.ObjectId,
            name?: string,
            description?: string,
            coverImageMediaKey?: string,
        }

        export type AddMembers = {
            _id: Types.ObjectId,
            memberIds: Types.ObjectId[],
        };

        export type Remove = {
            _id: Types.ObjectId,
        }
    }

    export namespace Project {
        export type Get = {
            target: APIControl.Project.Get.Target,
            portfolio?: APIControl.Project.Get.Portfolio,
        };

        export type Create = {
            portfolio: EProjectPortfolio;
            title: string;
            description: string;
            tags: string[];
            // TODO: Add the ability to have multiple authors.
            // authors: Types.ObjectId[];
            links: {
                text: string;
                url: string;
            }[];
        };

        export type Update = {
            _id: Types.ObjectId;
            portfolio: EProjectPortfolio;
            title?: string;
            description?: string;
            tags?: {
                tag: string;
            }[];
            // TODO: Add the ability to have multiple authors.
            // authors: Types.ObjectId[];
            links?: {
                text: string;
                url: string;
            }[];
            coverImgMediaKey?: string | null;
            media?: Types.ObjectId[];
        };

        export type Remove = {
            _id: Types.ObjectId,
        };
    }

    export namespace Blog {
        export type Get =
            | ({
                target: APIControl.Blog.Get.Target.ALL | APIControl.Blog.Get.Target.MY
            })
            | ({
                target: APIControl.Blog.Get.Target.BY_SLUG,
                slug: string;
            });

        export type Create = {
            title: string;
            slug: string;
            content: string;
            tags: string[];
            // TODO: Add the ability to have multiple authors.
            // authors: Types.ObjectId[];
        };

        export type Update = {
            _id: Types.ObjectId;
            title?: string;
            slug?: string;
            content?: string;
            tags?: string[];
            // TODO: Add the ability to have multiple authors.
            // authors: Types.ObjectId[];
            coverImgMediaKey?: string | null;
        };

        export type Remove = {
            _id: Types.ObjectId,
        };
    }

    export namespace Featured {
        export type Get = {
            target: APIControl.Featured.Get.Target
        }

        export type GetGames = EmptyObject;
        export type GetProjects = EmptyObject;

        export type Create = {
            contentType: EFeaturedType;
            contentId: Types.ObjectId;
        }

        export type Remove = {
            _id: Types.ObjectId,
        };
    }

    export namespace User {
        export type Get =
            | ({
                target: APIControl.User.Get.Target.RESTRICTED
            } & GetRestricted)
            | ({
                target: APIControl.User.Get.Target.UNRESTRICTED
            } & GetUnrestricted)
            | ({
                target: APIControl.User.Get.Target.ALL
            } & GetAll);

        export type GetRestricted = {
            _id: Types.ObjectId,
        }

        export type GetUnrestricted = GetRestricted;
        export type GetAll = EmptyObject;

        export type Update = {
            name?: string,
            profileImgMediaKey?: string | null,
            phoneNumber?: string,
            links?: {
                label: string,
                url: string,
            }[],
        };
        export type UpdateRoles = {
            _id: Types.ObjectId,
            roles: EUserRole[],
        };

        export type Remove = {
            _id: Types.ObjectId,
        };
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
        }

        export type SignIn = {
            token: string;
        }

        export type SignOut = {
            token: string;
        }

        export type SignUp = EmptyObject;
        export type SignUpRequest = EmptyObject;
        export type SignUpRequestResendOTP = EmptyObject;
        export type SignUpVerify = EmptyObject;
        export type ChangePassword = EmptyObject;

        export type ExtractSession = {
            userId: Types.ObjectId;
            userEmail: string;
            userRoles: EUserRole[];
        }
    }

    export namespace Team {
        export type Get = GetOne | GetAll;

        export type GetOne = {
            _id: string;
            name: string;
            description: string;
            members: {
                _id: string;
                name: string;
                links: {
                    label: string;
                    url: string;
                }[];
                profileImgMediaKey: string | null;
            }[];
            coverImageMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        }

        export type GetAll = {
            _id: string;
            name: string;
            description: string;
            coverImageMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type AddMembers = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Project {
        export type Get = {
            _id: string;
            portfolio: string;
            title: string;
            description: string;
            tags: string[];
            authors: {
                _id: string;
                name: string;
            }[];
            links: {
                text: string;
                url: string;
            }[];
            coverImgMediaKey: string | null;
            media: string[];
            createdAt: Date;
            updatedAt: Date;
        }[];

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Blog {
        export type Get = GetList | GetBySlug;

        export type GetList = {
            _id: string;
            title: string;
            slug: string;
            tags: string[];
            authors: {
                _id: string;
                name: string;
            }[];
            coverImgMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];

        export type GetMy = GetList;

        export type GetBySlug = {
            _id: string;
            title: string;
            content: string;
            slug: string;
            tags: string[];
            authors: {
                _id: string;
                name: string;
            }[];
            coverImgMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        };

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Featured {
        export type Get = {
            _id: string;
            title: string;
            tags: string[];
            links: {
                text: string;
                url: string;
            }[];
            coverImgMediaKey: string | null;
        }[];

        export type Create = EmptyObject;
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
        }

        export type GetUnrestricted = GetRestricted & {
            phoneNumber: string | null;
            updatedAt: Date;
        }

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

    export namespace Auth {
        export type Me = never;

        export type SignIn =
            | ESECs.USER_NOT_FOUND
            | ESECs.INVALID_CREDENTIALS;

        export type SignOut = never;

        export type SignUpRequest =
            | ESECs.EMAIL_TAKEN;

        export type SignUpRequestResendOTP =
            | ESECs.SIGNUP_REQUEST_NOT_FOUND
            | ESECs.TOO_MANY_REQUESTS;

        export type SignUpVerify =
            | ESECs.SIGNUP_REQUEST_NOT_FOUND
            | ESECs.INVALID_OTP;

        export type ChangePassword =
            | ESECs.INVALID_CREDENTIALS;

        export type ExtractSession =
            | ESECs.INVALID_JWT;
    }

    export namespace Team {
        export type Get =
            | ESECs.TEAM_NOT_FOUND;

        export type GetAll = never;

        export type Create =
            | ESECs.TEAM_NAME_TAKEN
            | ESECs.FORBIDDEN;

        export type Update =
            | ESECs.TEAM_NOT_FOUND
            | ESECs.TEAM_NAME_TAKEN
            | ESECs.FORBIDDEN;

        export type AddMembers =
            | ESECs.TEAM_NOT_FOUND
            | ESECs.USER_NOT_FOUND
            | ESECs.FORBIDDEN;

        export type Remove =
            | ESECs.TEAM_NOT_FOUND
            | ESECs.FORBIDDEN;
    }

    export namespace User {
        export type Get =
            | ESECs.USER_NOT_FOUND
            | ESECs.FORBIDDEN;

        export type GetUnrestricted =
            | ESECs.USER_NOT_FOUND
            | ESECs.FORBIDDEN;

        export type GetAll =
            | ESECs.FORBIDDEN;

        export type Update =
            | ESECs.USER_NOT_FOUND
            | ESECs.FORBIDDEN;

        export type UpdateRoles =
            | ESECs.USER_NOT_FOUND
            | ESECs.FORBIDDEN;

        export type Remove =
            | ESECs.USER_NOT_FOUND
            | ESECs.FORBIDDEN;
    }

}

/* eslint-enable @typescript-eslint/no-namespace */
