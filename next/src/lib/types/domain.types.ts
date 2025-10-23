import { Types } from "mongoose";

export enum EUserRole {
    GUEST = "GUEST",
    MEMBER = "MEMBER",
    EXECUTIVE = "EXECUTIVE",
    HEAD = "HEAD",
    ADMIN = "ADMIN",
    ROOT = "ROOT",
}

export interface ISignUpRequest {
    _id: Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    otpHash: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    profileImgMediaKey: string | null;
    phoneNumber: string | null;
    links: {
        label: string;
        url: string;
    }[];
    teamId: Types.ObjectId | null;
    roles: EUserRole[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITeam {
    _id: Types.ObjectId;
    name: string;
    description: string;
    members: Types.ObjectId[];
    coverImageMediaKey: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITeamExportable extends Omit<ITeam, "members"> {
    members: {
        _id: Types.ObjectId;
        name: string;
        links: {
            label: string;
            url: string;
        }[];
        profileImgMediaKey: string | null;
    }[];
}

export interface ITeamOfListExportable extends Omit<ITeam, "member"> {
    useEslint: never;
}

export enum EProjectPortfolio {
    GAME = "GAME",
    GRAPHICS = "GRAPHICS",
    RND = "RND",
}

export interface IProject {
    _id: Types.ObjectId;
    portfolio: EProjectPortfolio;
    title: string;
    description: string;
    tags: string[];
    authors: Types.ObjectId[];
    links: {
        text: string;
        url: string;
    }[];
    coverImgMediaKey: string | null;
    media: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IProjectExportable extends Omit<IProject, 'authors'> {
    authors: {
        _id: Types.ObjectId;
        name: string;
    }[];
}

export interface IBlog {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    tags: string[];
    authors: Types.ObjectId[];
    coverImgMediaKey: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBlogExportable extends Omit<IBlog, 'authors'> {
    authors: {
        _id: Types.ObjectId;
        name: string;
    }[];
}

export interface IBlogOfListExportable extends Omit<IBlogExportable, "content"> {
    useEslint: never;
}

export interface IMedia {
    _id: Types.ObjectId;
    key: string;
    url: string;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export enum EFeaturedType {
    BLOG = "BLOG",
    GAME = "GAME",
    GRAPHICS = "GRAPHICS",
    RND = "RND"
}

export interface IFeatured {
    _id: Types.ObjectId;
    contentType: EFeaturedType;
    contentId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type IRecentFeaturedContent = {
    _id: Types.ObjectId;
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
});
