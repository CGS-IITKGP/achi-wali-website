export enum EUserRole {
    GUEST = "GUEST",
    MEMBER = "MEMBER",
    EXECUTIVE = "EXECUTIVE",
    HEAD = "HEAD",
    ADMIN = "ADMIN",
    ROOT = "ROOT",
}

export interface IUser {
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
