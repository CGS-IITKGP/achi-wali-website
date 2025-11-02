import { IUser } from "./domain.types";

export interface IAuthContext {
    isLoading: boolean;
    user: IUser | null;
    refreshUser: () => void;
}
