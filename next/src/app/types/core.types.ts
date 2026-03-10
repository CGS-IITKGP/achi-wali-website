import { IBlogOfList, IMedia, IProject, IUser } from "./domain.types";

export interface IAuthContext {
  isLoading: boolean;
  user: IUser | null;
  refreshUser: () => void;
}

export interface IDashboardContext {
  assets: IMedia[];
  projects: IProject[];
  blogs: IBlogOfList[];
  statistics: {
    countAssets: number;
    countProjects: number;
    countBlogs: number;
  };
  loading: boolean;
}
