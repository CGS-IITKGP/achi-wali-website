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

export interface Links {
  text: string;
  url: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  profileImgUrl: string | null;
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
  createdAt: Date;
  updatedAt: Date;
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
    profileImgUrl: string | null;
  };
  collaborators: {
    _id: string;
    name: string;
    profileImgUrl: string | null;
  }[];
  coverImgUrl: string | null;
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
    profileImgUrl: string | null;
  };
  collaborators: {
    _id: string;
    name: string;
    profileImgUrl: string | null;
  }[];
  links: {
    text: string;
    url: string;
  }[];
  coverImgUrl: string | null;
  media: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type IRecentFeaturedContent = {
  _id: string;
  type: "BLOG" | "GAME" | "GRAPHICS" | "RND";
  title: string;
  coverImgUrl: string | null;
  tags: string[];
} & (
    | {
      type: "BLOG";
      readUrl: string | null;
    }
    | {
      type: "GAME" | "GRAPHICS" | "RND";
      liveDemoLink: string | null;
      githubLink: string | null;
    }
  );

export type IMedia = {
  _id: string;
  key: string;
  url: string;
  sizeBytes: number;
  format: string;
  resourceType: string;
};

export type IMediaSignedToken = {
  signature: string;
  timestamp: string;
  folder: string;
  publicId: string;
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
    profileImgUrl: string | null;
    designation: string;
  }[];
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export enum EFeaturedType {
  BLOG = "BLOG",
  GAME = "GAME",
  GRAPHICS = "GRAPHICS",
  RND = "RND",
}

export type IFeaturedContentAsList = {
  _id: string;
  contentType: "BLOG" | "GAME" | "GRAPHICS" | "RND";
  contentTitle: string;
  isHighlight: string;
};

export type IContentAsList = Omit<IFeaturedContentAsList, "isHighlight">;

export type ITeamsAsList = {
  _id: string;
  name: string;
};

export type IPaginatedUsers = {
  users: {
    _id: string;
    name: string;
    email: string;
    profileImgUrl: string | null;
    roles: EUserRole[];
    designation: EUserDesignation;
    teamId: string | null;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
