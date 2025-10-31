/* eslint-disable @typescript-eslint/no-namespace */

import { Types } from "mongoose";
import {
    EFeaturedType,
    EProjectPortfolio,
    EUserDesignation,
    EUserRole,
} from "./domain.types";
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

    MEDIA_NOT_FOUND,
    MEDIA_PUBLIC_ID_ALREADY_EXISTS,
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

        export type EditMembers = {
            _id: Types.ObjectId,
            action: APIControl.Team.EditMembers.Target,
            memberIds: Types.ObjectId[],
        };

        export type RemoveMembers = {
            _id: Types.ObjectId,
            memberIds: Types.ObjectId[],
        }

        export type Remove = {
            _id: Types.ObjectId,
        }
    }

    export namespace Project {
        export type Get = {
            target: APIControl.Project.Get.Target,
            portfolio: APIControl.Project.Get.Portfolio,
        };

        export type GetAsList = EmptyObject;

        export type Create = {
            portfolio: EProjectPortfolio;
            title: string;
            description: string;
            tags: string[];
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
            tags?: string[];
            collaborators?: Types.ObjectId[];
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
                target:
                | APIControl.Blog.Get.Target.ALL
                | APIControl.Blog.Get.Target.MY
                | APIControl.Blog.Get.Target.ALL_AS_LIST
            })
            | ({
                target: APIControl.Blog.Get.Target.BY_SLUG,
                slug: string;
            });

        export type GetAsList = EmptyObject;

        export type Create = {
            title: string;
            slug: string;
            content: string;
            tags: string[];
        };

        export type Update = {
            _id: Types.ObjectId;
            title?: string;
            slug?: string;
            content?: string;
            tags?: string[];
            collaborators?: Types.ObjectId[];
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

        export type GetHighlight = EmptyObject;
        export type GetAsList = EmptyObject;

        export type Create = {
            contentType: EFeaturedType;
            contentId: Types.ObjectId;
            isHighlight: boolean;
        }

        export type Update = {
            _id: Types.ObjectId;
            isHighlight: boolean;
        }

        export type Remove = {
            _id: Types.ObjectId,
        };
    }

    export namespace Media {
        export type Get = EmptyObject;

        export type Sign = {
            publicId: string;
        }

        export type Create = {
            publicId: string;
            url: string;
        }

        export type Remove = {
            _id: Types.ObjectId;
        }
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
            phoneNumber?: string,
            links?: {
                label: string,
                url: string,
            }[],
        };

        export type UpdateAssignment = {
            _id: Types.ObjectId,
            roles?: EUserRole[],
            designation?: EUserDesignation;
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
            team: {
                _id: string | null;
                name: string;
            };
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

        export type GetAll = GetOne[];

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type EditMembers = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Project {
        export type Get = {
            _id: string;
            portfolio: string;
            title: string;
            description: string;
            tags: string[];
            author: {
                _id: string;
                name: string;
            };
            collaborators: {
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
        }[] | GetAsList;

        export type GetAsList = {
            _id: string;
            portfolio: string;
            title: string;
        }[];

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Blog {
        export type Get = GetList | GetBySlug | GetAsList;

        export type GetList = {
            _id: string;
            title: string;
            slug: string;
            tags: string[];
            author: {
                _id: string;
                name: string;
            };
            collaborators: {
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
            author: {
                _id: string;
                name: string;
            };
            collaborators: {
                _id: string;
                name: string;
            }[];
            coverImgMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        };

        export type GetAsList = {
            _id: string;
            title: string;
        }[];

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Featured {
        export type Get = (GetBlog[0] | GetProject[0] | GetHighlight[0] | GetAsList[0])[];

        export type GetBlog = {
            _id: string;
            title: string;
            slug: string;
            tags: string[];
            author: {
                _id: string;
                name: string;
            };
            collaborators: {
                _id: string;
                name: string;
            }[];
            coverImgMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];

        export type GetProject = {
            _id: string;
            portfolio: string;
            title: string;
            description: string;
            tags: string[];
            author: {
                _id: string;
                name: string;
            };
            collaborators: {
                _id: string;
                name: string;
            }[];
            links: {
                text: string;
                url: string;
            }[];
            coverImgMediaKey: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];

        export type GetHighlight = ({
            _id: string;
            type: "BLOG" | "GAME" | "GRAPHICS" | "RND",
            title: string;
            coverImgMediaKey: string | null;
            tags: string[];
        } & ({
            type: "BLOG",
            readUrl: string;
        } | {
            type: "GAME" | "GRAPHICS" | "RND",
            liveDemoLink: string | null;
            githubLink: string | null;
        }))[];

        export type GetAsList = {
            _id: string;
            contentType: string;
            contentTitle: string;
            isHighlight: string;
        }[];

        export type Create = EmptyObject;
        export type Update = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace Media {
        export type Get = {
            _id: string;
            key: string;
            url: string;
        }[];

        export type Sign = {
            signature: string;
            timestamp: string;
            folder: string;
            cloudName: string;
            apiKey: string;
        }

        export type Create = EmptyObject;
        export type Remove = EmptyObject;
    }

    export namespace User {
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
        export type UpdateAssignment = EmptyObject;
        export type Remove = EmptyObject;
    }
}

/* eslint-enable @typescript-eslint/no-namespace */
