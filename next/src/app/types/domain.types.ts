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

export interface IUser {
    _id: string;
    name: string;
    email: string;
    profileImgMediaKey: string | null;
    phoneNumber: string | null;
    links: {
        text: string;
        url: string;
    }[];
    team: {
        _id: string;
        name: string;
    };
    roles: EUserRole[];
    designation: EUserDesignation;
    createdAt: string;
    updatedAt: string;
}

export interface IBlog {
    _id: string;
    title: string;
    slug: string;
    tags: string[];
    content: string;
    author: {
        _id: string;
        name: string;
    };
    collaborators: {
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
    createdAt: string;
    updatedAt: string;
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

export type ITeamExportable = {
    _id: string;
    name: string;
    description: string;
    members: {
        _id: string;
        name: string;
        links: {
            text: string;
            url: string;
        }[];
        profileImgMediaKey: string | null;
        designation: string;
    }[];
    coverImageMediaKey: string | null;
    createdAt: string;
    updatedAt: string;
}

export enum EFeaturedType {
    BLOG = "BLOG",
    GAME = "GAME",
    GRAPHICS = "GRAPHICS",
    RND = "RND"
}

export type IFeaturedContentAsList = {
    _id: string;
    contentType: "BLOG" | "GAME" | "GRAPHICS" | "RND";
    contentTitle: string;
    isHighlight: string;
}

export type IContentAsList = Omit<IFeaturedContentAsList, "isHighlight">;

export type ITeamsAsList = {
    _id: string;
    name: string;
}

export type IPaginatedUsers = {
    users: {
        _id: string;
        name: string;
        email: string;
        roles: EUserRole[];
        designation: EUserDesignation;
        teamId: string | null;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
