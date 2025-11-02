import { Types } from "mongoose";

export enum EUserRole {
    GUEST = "GUEST",
    MEMBER = "MEMBER",
    ADMIN = "ADMIN",
    ROOT = "ROOT",
}

export enum EUserDesignation {
    NONE = "NONE",
    JUNIOR = "JUNIOR",
    SENIOR = "SENIOR",
    EXECUTIVE = "EXECUTIVE",
    HEAD = "HEAD",
    ADVISOR = "ADVISOR",
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
    passwordHash: string | null;
    profileImgMediaKey: string | null;
    phoneNumber: string | null;
    links: {
        text: string;
        url: string;
    }[];
    teamId: Types.ObjectId | null;
    designation: EUserDesignation;
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
            text: string;
            url: string;
        }[];
        profileImgMediaKey: string | null;
        designation: EUserDesignation;
    }[];
}

export interface ITeamOfListExportable extends Omit<ITeam, "members"> {
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
    author: Types.ObjectId;
    collaborators: Types.ObjectId[];
    links: {
        text: string;
        url: string;
    }[];
    coverImgMediaKey: string | null;
    media: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IProjectExportable extends Omit<IProject, 'author' | "collaborators"> {
    author: {
        _id: Types.ObjectId;
        name: string;
    };
    collaborators: {
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
    author: Types.ObjectId;
    collaborators: Types.ObjectId[];
    coverImgMediaKey: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBlogExportable extends Omit<IBlog, 'author' | "collaborators"> {
    author: {
        _id: Types.ObjectId;
        name: string;
    };
    collaborators: {
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

export interface IMediaExportable extends Omit<IMedia, "uploadedBy"> {
    uploadedBy: {
        _id: Types.ObjectId;
        name: string;
    };
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
    isHighlight: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type IFeaturedHighlightExportable = ({
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
}));

export type IFeaturedExportableAsList = {
    _id: Types.ObjectId;
    contentType: string;
    contentTitle: string;
    isHighlight: string;
}
