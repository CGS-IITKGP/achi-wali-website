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
    team: {
        _id: string;
        name: string;
    };
    roles: EUserRole[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IBlog {
    _id: string;
    title: string;
    slug: string;
    tags: string[];
    content: string;
    authors: {
        _id: string;
        name: string;
    }[];
    coverImgMediaKey: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IBlogOfList extends Omit<IBlog, "content"> {
    useEslint: never;
}

export enum EProjectPortfolio {
    GAME = "GAME",
    GRAPHICS = "GRAPHICS",
    RND = "RND",
}

export interface IProject {
    _id: string;
    portfolio: EProjectPortfolio;
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
}


export type IRecentFeaturedContent = {
    _id: string;
    type: "BLOG" | "GAME" | "GRAPHICS" | "RND",
    title: string;
    coverImgMediaKey: string | null;
    tags: string[];
} & ({
    type: "BLOG",
    readUrl: string | null;
} | {
    type: "GAME" | "GRAPHICS" | "RND",
    liveDemoLink: string | null;
    githubLink: string | null;
});

export type IMedia = {
    _id: string;
    key: string;
    url: string;
}

export type IMediaSignedToken = {
    signature: string;
    timestamp: string;
    folder: string;
    cloudName: string;
    apiKey: string;
};

