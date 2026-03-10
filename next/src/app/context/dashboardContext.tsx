import React, { createContext, useReducer, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import { IDashboardContext } from "../types/core.types";
import { IMedia, IProject, IBlogOfList } from "../types/domain.types";
import api from "../axiosApi";

type Action =
  | { type: "SET_ASSETS"; payload: IMedia[] }
  | { type: "ADD_ASSET"; payload: IMedia }
  | { type: "DELETE_ASSET"; payload: string }
  | { type: "SET_PROJECTS"; payload: IProject[] }
  | { type: "ADD_PROJECT"; payload: IProject }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_BLOGS"; payload: IBlogOfList[] }
  | { type: "ADD_BLOG"; payload: IBlogOfList }
  | { type: "DELETE_BLOG"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: IDashboardContext = {
  assets: [],
  projects: [],
  blogs: [],
  statistics: {
    countAssets: -1,
    countProjects: -1,
    countBlogs: -1,
  },
  loading: true,
};

const reducer = (
  state: IDashboardContext,
  action: Action,
): IDashboardContext => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ASSETS":
      return {
        ...state,
        assets: action.payload,
        statistics: { ...state.statistics, countAssets: action.payload.length },
      };
    case "ADD_ASSET":
      return {
        ...state,
        assets: [...state.assets, action.payload],
        statistics: {
          ...state.statistics,
          countAssets: state.assets.length + 1,
        },
      };
    case "DELETE_ASSET":
      const filteredAssets = state.assets.filter(
        (asset) => asset._id !== action.payload,
      );
      return {
        ...state,
        assets: filteredAssets,
        statistics: { ...state.statistics, countAssets: filteredAssets.length },
      };
    case "SET_PROJECTS":
      return {
        ...state,
        projects: action.payload,
        statistics: {
          ...state.statistics,
          countProjects: action.payload.length,
        },
      };
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.payload],
        statistics: {
          ...state.statistics,
          countProjects: state.projects.length + 1,
        },
      };
    case "DELETE_PROJECT":
      const filteredProjects = state.projects.filter(
        (project) => project._id !== action.payload,
      );
      return {
        ...state,
        projects: filteredProjects,
        statistics: {
          ...state.statistics,
          countProjects: filteredProjects.length,
        },
      };
    case "SET_BLOGS":
      return {
        ...state,
        blogs: action.payload,
        statistics: { ...state.statistics, countBlogs: action.payload.length },
      };
    case "ADD_BLOG":
      return {
        ...state,
        blogs: [...state.blogs, action.payload],
        statistics: { ...state.statistics, countBlogs: state.blogs.length + 1 },
      };
    case "DELETE_BLOG":
      const filteredBlogs = state.blogs.filter(
        (blog) => blog._id !== action.payload,
      );
      return {
        ...state,
        blogs: filteredBlogs,
        statistics: { ...state.statistics, countBlogs: filteredBlogs.length },
      };
    default:
      return state;
  }
};

const DashboardContext = createContext<
  | {
      state: IDashboardContext;
      dispatch: React.Dispatch<Action>;
      resetAssets: () => void;
      resetProjects: () => void;
      resetBlogs: () => void;
    }
  | undefined
>(undefined);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchBlogs = async (): Promise<IBlogOfList[]> => {
    const apiResponse = await api("GET", "/blog", {
      query: {
        target: "my",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      return [];
    } else {
      return (apiResponse.data as IBlogOfList[]) ?? [];
    }
    return [];
  };

  const fetchProjects = async (): Promise<IProject[]> => {
    const apiResponse = await api("GET", "/project", {
      query: {
        target: "my",
        portfolio: "any",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      return [];
    } else {
      return (apiResponse.data as IProject[]) ?? [];
    }
    return [];
  };

  const fetchAssets = async (): Promise<IMedia[]> => {
    const apiResponse = await api("GET", "/media");

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      return [];
    } else {
      return (apiResponse.data as IMedia[]) ?? [];
    }
    return [];
  };

  const resetAssets = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const assets = await fetchAssets();

      dispatch({
        type: "SET_ASSETS",
        payload: assets,
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const resetProjects = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const projects = await fetchProjects();

      dispatch({
        type: "SET_PROJECTS",
        payload: projects,
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const resetBlogs = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const blogs = await fetchBlogs();

      dispatch({
        type: "SET_BLOGS",
        payload: blogs,
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setAllData = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const assets = await fetchAssets();
      const blogs = await fetchBlogs();
      const projects = await fetchProjects();

      dispatch({
        type: "SET_ASSETS",
        payload: assets,
      });
      dispatch({
        type: "SET_BLOGS",
        payload: blogs,
      });
      dispatch({
        type: "SET_PROJECTS",
        payload: projects,
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    setAllData();
  }, []);

  return (
    <DashboardContext.Provider
      value={{ state, dispatch, resetAssets, resetBlogs, resetProjects }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
};
