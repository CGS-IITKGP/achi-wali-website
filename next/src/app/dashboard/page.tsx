"use client";

import { useEffect, useState, Fragment } from "react"; // Added Fragment
import { Righteous, Roboto } from "next/font/google";
import api from "../axiosApi";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import {
  IBlogOfList,
  IMedia,
  IMediaSignedToken,
  IProject,
} from "../types/domain.types";
import {
  prettyDate,
  prettyDescription,
  prettySafeImage,
} from "../utils/pretty";
import { Listbox, Menu, Transition } from "@headlessui/react"; // Added Menu, Transition

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
  // Note: Roboto font needs weight specified. Assuming 400.
  // If you get a warning, add: weight: "400"
  weight: "400",
});

type ActiveSection =
  | "blog"
  | "projects"
  | "profile"
  | "assets"
  | "settings"
  | "home";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showBlogUpdateModal, setShowBlogUpdateModal] = useState<{
    show: boolean;
    id: string | null;
  }>({
    show: false,
    id: null,
  });
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState<{
    show: boolean;
    id: string | null;
  }>({
    show: false,
    id: null,
  });
  const [showNewAssetModal, setShowNewAssetModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    slug: "",
    coverImgMediaKey: "",
    content: "",
    tags: "",
  });
  const [blogUpdate, setBlogUpdate] = useState<{
    coverImgMediaKey: string;
  }>({
    coverImgMediaKey: "",
  });
  const [newProjectData, setNewProjectData] = useState<{
    name: string;
    portfolio: "GAME" | "GRAPHICS" | "RND";
    tags: string;
    coverImgMediaKey: string;
    description: string;
    links: {
      text: string;
      url: string;
    }[];
  }>({
    name: "",
    portfolio: "GAME",
    tags: "",
    coverImgMediaKey: "",
    description: "",
    links: [{ text: "", url: "" }],
  });
  const [projectUpdate, setProjectUpdate] = useState<{
    coverImgMediaKey: string;
  }>({
    coverImgMediaKey: "",
  });
  const [newAssetData, setNewAssetData] = useState<{
    name: string;
    file: File | null;
  }>({
    name: "",
    file: null,
  });
  const [userLinks, setUserLinks] = useState<{ text: string; url: string }[]>(
    []
  );

  const [blogs, setBlogs] = useState<IBlogOfList[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [assets, setAssets] = useState<IMedia[]>([]);
  const [statistics, setStatistics] = useState<{
    countBlogs: number;
    countProjects: number;
    countAssets: number;
  }>({
    countBlogs: -1,
    countProjects: -1,
    countAssets: -1,
  });

  const menuItems = [
    {
      id: "home" as ActiveSection,
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "profile" as ActiveSection,
      label: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      id: "blog" as ActiveSection,
      label: "Blog",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      ),
    },
    {
      id: "projects" as ActiveSection,
      label: "Projects",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      ),
    },
    {
      id: "assets" as ActiveSection,
      label: "Assets",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
        </svg>
      ),
    },
    {
      id: "settings" as ActiveSection,
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" />
        </svg>
      ),
    },
  ];

  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const fetchBlogs = async () => {
    const apiResponse = await api("GET", "/blog", {
      query: {
        target: "my",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      setBlogs([]);
      setStatistics((prev) => {
        return {
          ...prev,
          countProjects: -1,
        };
      });
    } else {
      setBlogs((apiResponse.data as IBlogOfList[]) ?? []);
      setStatistics((prev) => {
        return {
          ...prev,
          countBlogs: (apiResponse.data as IBlogOfList[])?.length ?? 0,
        };
      });
    }
  };

  const fetchProjects = async () => {
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
      setProjects([]);
      setStatistics((prev) => {
        return {
          ...prev,
          countProjects: -1,
        };
      });
    } else {
      setProjects((apiResponse.data as IProject[]) ?? []);
      setStatistics((prev) => {
        return {
          ...prev,
          countProjects: (apiResponse.data as IProject[])?.length ?? 0,
        };
      });
    }
  };

  const fetchAssets = async () => {
    const apiResponse = await api("GET", "/media");

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      setAssets([]);
      setStatistics((prev) => {
        return {
          ...prev,
          countProjects: -1,
        };
      });
    } else {
      setAssets((apiResponse.data as IMedia[]) ?? []);
      setStatistics((prev) => {
        return {
          ...prev,
          countAssets: (apiResponse.data as IMedia[])?.length ?? 0,
        };
      });
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchProjects();
    fetchAssets();
  }, []);

  useEffect(() => {
    if (user?.links) {
      setUserLinks(user.links);
    }
  }, [user]);

  useEffect(() => {
    if (activeSection === "home") {
      router.push("/");
    }
  }, [activeSection, router]);

  if (activeSection === "home") {
    return null;
  }

  const handleNewPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPostData.slug.includes(" ")) {
      toast.error("Slug must be url friendly.");
      return;
    }

    if (newPostData.coverImgMediaKey.trim().split("/").length !== 3) {
      toast.error("Invalid media key");
      return;
    }

    const apiResponse = await api("POST", "/blog", {
      body: {
        title: newPostData.title,
        slug: newPostData.slug,
        coverImgMediaKey: newPostData.coverImgMediaKey.trim(),
        content: newPostData.content,
        tags: newPostData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchBlogs();
      setShowNewPostModal(false);
      setNewPostData({
        title: "",
        slug: "",
        coverImgMediaKey: "",
        content: "",
        tags: "",
      });
      toast.success("Added a new blog.");
    }
  };

  const handleBlogUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showBlogUpdateModal.id === null) return;

    if (blogUpdate.coverImgMediaKey.split("/").length !== 3) {
      toast.error("Invalid media key");
      return;
    }

    const apiResponse = await api("PATCH", `/blog/${showBlogUpdateModal.id}`, {
      body: {
        coverImgMediaKey: blogUpdate.coverImgMediaKey,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchBlogs();
      setShowBlogUpdateModal({
        show: false,
        id: null,
      });
      setBlogUpdate({ coverImgMediaKey: "" });
      toast.success("Updated cover image.");
    }
  };

  const handlePostDelete = async (id: string) => {
    const apiResponse = await api("DELETE", `/blog/${id}`);

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchBlogs();
      setShowNewPostModal(false);
      setNewPostData({
        title: "",
        slug: "",
        coverImgMediaKey: "",
        content: "",
        tags: "",
      });
      toast.success("Removed blog.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlogUpdateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setBlogUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newProjectData.coverImgMediaKey.trim().split("/").length !== 3) {
      toast.error("Invalid media key");
      return;
    }

    const apiResponse = await api("POST", "/project", {
      body: {
        title: newProjectData.name,
        portfolio: newProjectData.portfolio,
        description: newProjectData.description,
        tags: newProjectData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        coverImgMediaKey: newProjectData.coverImgMediaKey.trim(),
        links: newProjectData.links.filter(
          (link) => link.text.trim() !== "" && link.url.trim() !== ""
        ),
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchProjects();
      setShowNewProjectModal(false);
      setNewProjectData({
        name: "",
        portfolio: "GAME",
        tags: "",
        coverImgMediaKey: "",
        description: "",
        links: [{ text: "", url: "" }],
      });
      toast.success("Added a new project.");
    }
  };

  const handleProjectUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showProjectUpdateModal.id === null) return;

    if (projectUpdate.coverImgMediaKey.split("/").length !== 3) {
      toast.error("Invalid media key");
      return;
    }

    const apiResponse = await api(
      "PATCH",
      `/project/${showProjectUpdateModal.id}`,
      {
        body: {
          coverImgMediaKey: projectUpdate.coverImgMediaKey,
        },
      }
    );

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchProjects();
      setShowProjectUpdateModal({
        show: false,
        id: null,
      });
      setProjectUpdate({ coverImgMediaKey: "" });
      toast.success("Updated project cover image.");
    }
  };

  const handleProjectUpdateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setProjectUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectDelete = async (id: string) => {
    const apiResponse = await api("DELETE", `/project/${id}`);

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchProjects();
      setShowNewPostModal(false);
      setNewProjectData({
        name: "",
        portfolio: "GAME",
        tags: "",
        coverImgMediaKey: "",
        description: "",
        links: [{ text: "", url: "" }],
      });
      toast.success("Removed project.");
    }
  };

  const handleSignOut = async () => {
    const apiResponse = await api("POST", "/auth/sign-out");

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.message);
      console.log(apiResponse);
    } else {
      toast.success("Signed out");
      refreshUser();
      router.push("/");
    }
  };

  const handleProjectInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLinkChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newLinks = newProjectData.links.map((link, i) => {
      if (i === index) {
        return { ...link, [name]: value };
      }
      return link;
    });
    setNewProjectData((prev) => ({ ...prev, links: newLinks }));
  };

  const addLinkField = () => {
    setNewProjectData((prev) => ({
      ...prev,
      links: [...prev.links, { text: "", url: "" }],
    }));
  };

  const removeLinkField = (index: number) => {
    setNewProjectData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleUserLinkChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newLinks = userLinks.map((link, i) => {
      if (i === index) {
        return { ...link, [name]: value };
      }
      return link;
    });
    setUserLinks(newLinks);
  };

  const addUserLinkField = () => {
    setUserLinks((prev) => [...prev, { text: "", url: "" }]);
  };

  const removeUserLinkField = (index: number) => {
    setUserLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChanges = async () => {
    const apiResponse = await api("PATCH", "/user", {
      body: {
        links: userLinks.filter(
          (link) => link.text.trim() !== "" && link.url.trim() !== ""
        ),
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      refreshUser();
      toast.success("Your links have been updated.");
    }
    setIsEditingLinks(false);
  };

  const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    setNewAssetData((prev) => ({
      ...prev,
      file: file,
    }));
  };

  const handleAssetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAssetData.file) {
      toast.error("Please select an image file.");
      return;
    }

    if (!new RegExp("^[A-Za-z0-9-._~]*$").test(newAssetData.name)) {
      toast.error("Name of the asset must be url safe.");
      return;
    }

    const apiResponse = await api("POST", "/media/sign", {
      body: {
        publicId: newAssetData.name,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error while signing.");
      return;
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      console.log(apiResponse.statusCode + ": " + apiResponse.message);
      return;
    }

    const signedToken = apiResponse.data as IMediaSignedToken;

    const formData = new FormData();
    formData.append("file", newAssetData.file);
    formData.append("api_key", signedToken.apiKey);
    formData.append("folder", signedToken.folder);
    formData.append("public_id", newAssetData.name);
    formData.append("timestamp", signedToken.timestamp);
    formData.append("signature", signedToken.signature);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signedToken.cloudName}/image/upload`;

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    const cloudinaryData = await cloudinaryResponse.json();

    if (cloudinaryData.error) {
      toast.error(cloudinaryData.error.message || "Cloudinary upload failed.");
      console.log(cloudinaryData.error.message || "Cloudinary upload failed.");
      return;
    }

    const apiResponse2 = await api("POST", "/media", {
      body: {
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
      },
    });

    if (apiResponse2.action === null) {
      toast.error("Server Error while adding new asset");
    } else if (apiResponse2.action === false) {
      toast.error(apiResponse2.statusCode + ": " + apiResponse2.message);
      console.log(apiResponse2.statusCode + ": " + apiResponse2.message);
    } else {
      fetchAssets();
      setShowNewAssetModal(false);
      setNewAssetData({
        name: "",
        file: null,
      });
      toast.success("Added new asset.");
    }
  };

  const handleAssetDelete = async (id: string) => {
    const apiResponse = await api("DELETE", `/media/${id}`);

    console.log(apiResponse);

    if (apiResponse.action === null) {
      toast.error("Server Error while deleting asset");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      fetchAssets();
      toast.success("Removed asset.");
    }
  };

  const copyAssetKey = async (assetKey: string) => {
    try {
      await navigator.clipboard.writeText(assetKey);

      toast.success("Copied media key", { position: "bottom-right" });
    } catch (err) {
      console.error("Failed to copy asset key:", err);
      toast.error("Failed to copy key. Please check browser permissions.");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                {/* <svg
                  className="w-10 h-10 text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg> */}
                <img
                  src={prettySafeImage(user?.profileImgMediaKey ?? null)}
                  alt=""
                  className="relative z-10 w-full h-full rounded-full border-4 border-pink-500/20 group-hover:border-pink-500/70 transition-all duration-700 object-cover group-hover:scale-110"
                />
              </div>
              <div>
                <h2 className={`text-2xl text-white ${heading_font.className}`}>
                  {user?.name ?? "Loading..."}
                </h2>
                <p className={`text-gray-400 ${paragraph_font.className}`}>
                  {user?.team.name}
                </p>
                <p
                  className={`text-gray-500 text-sm ${paragraph_font.className}`}
                >
                  Member since {user?.createdAt.getFullYear() ?? "Loading..."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg text-white ${heading_font.className}`}
                  >
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setActiveSection("settings")}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      className={`text-gray-400 text-sm ${paragraph_font.className}`}
                    >
                      Email
                    </label>
                    <p className={`text-white ${paragraph_font.className}`}>
                      {user?.email ?? "Loading..."}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`text-gray-400 text-sm ${paragraph_font.className}`}
                    >
                      Phone
                    </label>
                    <p className={`text-white ${paragraph_font.className}`}>
                      {user ? user.phoneNumber ?? "N/A" : "Loading..."}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`text-gray-400 text-sm ${paragraph_font.className}`}
                    >
                      Location
                    </label>
                    <p className={`text-white ${paragraph_font.className}`}>
                      San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3
                  className={`text-lg text-white mb-4 ${heading_font.className}`}
                >
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span
                      className={`text-gray-400 ${paragraph_font.className}`}
                    >
                      Projects
                    </span>
                    <span
                      className={`text-pink-400 font-semibold ${paragraph_font.className}`}
                    >
                      {statistics.countProjects === -1
                        ? "Loading"
                        : statistics.countProjects}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-gray-400 ${paragraph_font.className}`}
                    >
                      Blog Posts
                    </span>
                    <span
                      className={`text-pink-400 font-semibold ${paragraph_font.className}`}
                    >
                      {statistics.countBlogs === -1
                        ? "Loading"
                        : statistics.countBlogs}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={`text-gray-400 ${paragraph_font.className}`}
                    >
                      Assets
                    </span>
                    <span
                      className={`text-pink-400 font-semibold ${paragraph_font.className}`}
                    >
                      {statistics.countAssets === -1
                        ? "Loading"
                        : statistics.countAssets}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "blog":
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2
                className={`text-xl lg:text-2xl text-white ${heading_font.className}`}
              >
                Blog Posts
              </h2>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform duration-200"
              >
                New Post
              </button>
            </div>

            <div className="grid gap-4">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="glass rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3
                        className={`text-lg text-white mb-2 group-hover:text-pink-400 transition-colors ${heading_font.className}`}
                      >
                        {blog.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Published:{" "}
                          {new Date(blog.createdAt)
                            .toDateString()
                            .split(" ")
                            .slice(1)
                            .join(" ")}
                        </span>
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded"
                          >
                            {tag.toLocaleLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => {
                          setShowBlogUpdateModal({
                            id: blog._id,
                            show: true,
                          });
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => handlePostDelete(blog._id)}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-red-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl text-white ${heading_font.className}`}>
                Projects
              </h2>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform duration-200"
              >
                New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="glass rounded-xl p-6 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="w-full h-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-pink-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={`text-lg text-white group-hover:text-pink-400 transition-colors ${heading_font.className}`}
                    >
                      {project.title}
                    </h3>

                    <div className="flex space-x-2 shrink-0 ml-4">
                      <button
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => {
                          setShowProjectUpdateModal({
                            id: project._id,
                            show: true,
                          });
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>

                      <button
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => handleProjectDelete(project._id)}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-red-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p
                    className={`text-gray-400 text-sm mb-3 ${paragraph_font.className}`}
                  >
                    {prettyDescription(project.description)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-gray-500 text-sm ${paragraph_font.className}`}
                    >
                      {prettyDate(project.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "assets":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl text-white ${heading_font.className}`}>
                Assets
              </h2>
              <button
                onClick={() => setShowNewAssetModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform duration-200"
              >
                Upload Asset
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300 group flex flex-col items-center justify-between relative" // Added relative for absolute positioning of button
                >
                  <button
                    className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-lg transition-colors z-10" // z-10 ensures it's clickable over the image div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssetDelete(asset._id);
                    }}
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 hover:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {/* Using a different delete icon (trash can) */}
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>

                  <div
                    onClick={() => copyAssetKey(asset.key)}
                    className="flex flex-col items-center w-full cursor-pointer"
                  >
                    <div className="w-40 h-40 rounded-lg mb-3 flex items-center justify-center overflow-hidden bg-white/5">
                      <img
                        src={asset.url}
                        alt={asset.key.substring(
                          asset.key.lastIndexOf("/") + 1
                        )}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p
                      className={`text-white text-sm text-center truncate w-full ${paragraph_font.className}`}
                    >
                      {asset.key.substring(asset.key.lastIndexOf("/") + 1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl text-white ${heading_font.className}`}>
              Account Settings
            </h2>

            <div className="grid gap-6">
              <div className="glass rounded-xl p-6">
                <h3
                  className={`text-lg text-white mb-4 ${heading_font.className}`}
                >
                  Profile Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.name ?? ""}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 placeholder-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email ?? ""}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 placeholder-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg text-white ${heading_font.className}`}
                  >
                    Personal Links
                  </h3>
                  <div>
                    {isEditingLinks ? (
                      <button
                        onClick={addUserLinkField}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">Add Link</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingLinks(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path
                            fillRule="evenodd"
                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {userLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
                    >
                      <input
                        type="text"
                        name="text"
                        value={link.text}
                        onChange={(e) => handleUserLinkChange(index, e)}
                        placeholder="Link Text (e.g. GitHub)"
                        disabled={!isEditingLinks}
                        className={
                          isEditingLinks
                            ? "w-full sm:flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-400"
                            : "w-full sm:flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-gray-500 focus:outline-none focus:border-pink-400 text-gray-500 cursor-not-allowed"
                        }
                      />
                      <input
                        type="url"
                        name="url"
                        value={link.url}
                        onChange={(e) => handleUserLinkChange(index, e)}
                        placeholder="URL"
                        disabled={!isEditingLinks}
                        className={
                          isEditingLinks
                            ? "w-full sm:flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-400"
                            : "w-full sm:flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-lg placeholder-gray-500 focus:outline-none focus:border-pink-400 text-gray-500 cursor-not-allowed"
                        }
                      />
                      {isEditingLinks && (
                        <button
                          onClick={() => removeUserLinkField(index)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingLinks && (
                  <div className="flex justify-end space-x-4 pt-4 mt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingLinks(false);
                        // Optionally reset changes
                        if (user?.links) setUserLinks(user.links);
                      }}
                      className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={updateChanges}
                      className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-200"
                    >
                      Update Changes
                    </button>
                  </div>
                )}
              </div>

              {/* <div className="glass rounded-xl p-6">
                <h3
                  className={`text-lg text-white mb-4 ${heading_font.className}`}
                >
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-white ${paragraph_font.className}`}>
                      Email Notifications
                    </span>
                    <button className="w-12 h-6 bg-pink-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-white ${paragraph_font.className}`}>
                      Dark Mode
                    </span>
                    <button className="w-12 h-6 bg-pink-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-white ${paragraph_font.className}`}>
                      Public Profile
                    </span>
                    <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
                    </button>
                  </div>
                </div>
              </div> */}

              <div className="glass rounded-xl p-6">
                <h3
                  className={`text-lg text-white mb-4 ${heading_font.className}`}
                >
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors hover:cursor-not-allowed">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-neutral-900 via-gray-950 to-black">
      <div className="flex h-screen">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div
          className={`
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 
          glass border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out
        `}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span
                  className={`text-white font-bold ${paragraph_font.className}`}
                >
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("") ?? "LD"}
                </span>
              </div>
              <div>
                <h1 className={`text-white text-lg ${heading_font.className}`}>
                  Dashboard
                </h1>
                <p
                  className={`text-gray-400 text-sm ${paragraph_font.className}`}
                >
                  Welcome back!
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  <span className={paragraph_font.className}>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center cursor-pointer space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z" />
              </svg>
              <span className={paragraph_font.className}>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Top Bar -- THIS IS THE MODIFIED SECTION */}
          <div className="glass border-b border-white/10 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <div>
                  <h1
                    className={`text-2xl lg:text-3xl text-white ${heading_font.className} capitalize`}
                  >
                    {activeSection}
                  </h1>
                  <p
                    className={`text-gray-400 text-sm lg:text-base ${paragraph_font.className} hidden sm:block`}
                  >
                    Manage your {activeSection} settings and content
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Notification Bell REMOVED */}

                {/* START: Profile Dropdown */}
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-pink-500">
                      <span className="sr-only">Open user menu</span>
                      {user?.profileImgMediaKey ? (
                        <img
                          className="h-9 w-9 rounded-full object-cover"
                          src={prettySafeImage(user.profileImgMediaKey)}
                          alt="Profile"
                        />
                      ) : (
                        <span
                          className={`text-white font-medium ${paragraph_font.className}`}
                        >
                          {user?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("") ?? "U"}
                        </span>
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 bg-gray-950/80 backdrop-blur-md rounded-xl shadow-lg py-1 border border-white/10 focus:outline-none z-50">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setActiveSection("profile")}
                            className={`${
                              active
                                ? "bg-white/10 text-white"
                                : "text-gray-300"
                            } group flex items-center w-full px-4 py-2 text-sm ${
                              paragraph_font.className
                            } transition-colors`}
                          >
                            Your Profile
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setActiveSection("settings")}
                            className={`${
                              active
                                ? "bg-white/10 text-white"
                                : "text-gray-300"
                            } group flex items-center w-full px-4 py-2 text-sm ${
                              paragraph_font.className
                            } transition-colors`}
                          >
                            Settings
                          </button>
                        )}
                      </Menu.Item>
                      <div className="py-1">
                        <div className="h-[1px] bg-white/10 mx-2"></div>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSignOut}
                            className={`${
                              active
                                ? "bg-red-500/20 text-red-400"
                                : "text-gray-300"
                            } group flex items-center w-full px-4 py-2 text-sm ${
                              paragraph_font.className
                            } hover:bg-red-500/10 hover:text-red-400 transition-colors`}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                {/* END: Profile Dropdown */}
              </div>
            </div>
          </div>
          {/* END Top Bar -- THIS IS THE MODIFIED SECTION */}

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className={`text-2xl text-white ${heading_font.className}`}>
                Create New Post
              </h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleNewPostSubmit} className="p-6 space-y-6">
              {/* Title Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Post Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newPostData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter your post title..."
                  required
                />
              </div>

              {/* Slug Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={newPostData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter your post slug...."
                  required
                />
              </div>

              {/* Cover Image Media Key */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Cover Image Media Key
                </label>
                <input
                  type="text"
                  name="coverImgMediaKey"
                  value={newPostData.coverImgMediaKey}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter cover image media key..."
                  required
                />
              </div>

              {/* Tags Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={newPostData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter tags separated by commas (e.g., unity, physics, tutorial)"
                />
              </div>

              {/* Content Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Content
                </label>
                <textarea
                  name="content"
                  value={newPostData.content}
                  onChange={handleInputChange}
                  rows={12}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-none"
                  placeholder="Write your blog post content here..."
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <p
                    className={`text-gray-500 text-sm ${paragraph_font.className}`}
                  >
                    Supports Markdown formatting
                  </p>
                  <p
                    className={`text-gray-500 text-sm ${paragraph_font.className}`}
                  >
                    {newPostData.content.length} characters
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Publish Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Update Modal */}
      {showBlogUpdateModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleBlogUpdateSubmit}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className={`text-xl text-white ${heading_font.className}`}>
                  Update Cover Image Key
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setShowBlogUpdateModal((prev) => {
                      return {
                        show: false,
                        id: prev.id,
                      };
                    })
                  }
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Single Field */}
              <div className="p-6 space-y-6">
                {/* Cover Image Media Key Field */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Cover Image Media Key (e.g., user-assets/user-id/asset-name)
                  </label>
                  <input
                    type="text"
                    name="coverImgMediaKey"
                    value={blogUpdate.coverImgMediaKey}
                    onChange={handleBlogUpdateInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    placeholder="Paste the asset key here..."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 p-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    setShowBlogUpdateModal(() => {
                      return {
                        show: false,
                        id: null,
                      };
                    })
                  }
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Save Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className={`text-2xl text-white ${heading_font.className}`}>
                Create New Project
              </h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleNewProjectSubmit} className="p-6 space-y-6">
              {/* Project Name Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newProjectData.name}
                  onChange={handleProjectInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter your project name..."
                  required
                />
              </div>

              {/* Portfolio & Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portfolio Field (Replaced Project Type/Technology) */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Portfolio Type
                  </label>
                  <Listbox
                    value={newProjectData.portfolio}
                    onChange={(value) =>
                      setNewProjectData((prev) => ({
                        ...prev,
                        portfolio: value,
                      }))
                    }
                  >
                    <div className="relative">
                      {/* Button showing selected value */}
                      <Listbox.Button
                        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300`}
                      >
                        {newProjectData.portfolio || "Select a portfolio..."}
                      </Listbox.Button>

                      {/* Dropdown menu */}
                      <Listbox.Options className="absolute mt-2 w-full rounded-xl bg-[#1a1a1a] border border-white/10 shadow-lg overflow-hidden z-20">
                        {["GAME", "GRAPHICS", "RND"].map((item) => (
                          <Listbox.Option
                            key={item}
                            value={item}
                            className={({ active }) =>
                              `px-4 py-2 cursor-pointer transition text-white ${
                                active ? "bg-pink-600/40" : "bg-[#1a1a1a]"
                              }`
                            }
                          >
                            {item}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={newProjectData.tags}
                    onChange={handleProjectInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    placeholder="e.g., Unreal Engine, C++, Multiplayer (one line)"
                    required
                  />
                </div>
              </div>

              {/* Cover Image Media Key */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Cover Image Media Key
                </label>
                <input
                  type="text"
                  name="coverImgMediaKey"
                  value={newProjectData.coverImgMediaKey}
                  onChange={handleProjectInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter cover image media key..."
                  required
                />
              </div>

              {/* Description Field (Unchanged) */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={newProjectData.description}
                  onChange={handleProjectInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-none"
                  placeholder="Describe your project, its goals, features, and any other relevant details..."
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <p
                    className={`text-gray-500 text-sm ${paragraph_font.className}`}
                  >
                    Be descriptive about your project&apos;s purpose and scope
                  </p>
                  <p
                    className={`text-gray-500 text-sm ${paragraph_font.className}`}
                  >
                    {newProjectData.description.length} characters
                  </p>
                </div>
              </div>

              {/* Dynamic Links Section (NEW) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <label
                    className={`block text-gray-300 text-sm font-medium ${paragraph_font.className}`}
                  >
                    Project Links{" "}
                    <span className="text-neutral-500">
                      (use live-demo and github for advanced cards. Mind the
                      spellings.)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={addLinkField}
                    className="text-pink-400 hover:text-pink-300 text-sm flex items-center transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Link
                  </button>
                </div>

                <div className="space-y-4">
                  {newProjectData.links.map((link, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <input
                        type="text"
                        name="text"
                        value={link.text}
                        onChange={(e) => handleLinkChange(index, e)}
                        className="w-1/3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                        placeholder="Link Text (e.g., Live Demo)"
                        required
                      />
                      <input
                        type="url"
                        name="url"
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, e)}
                        className="w-2/3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                        placeholder="Link URL (https://...)"
                        required
                      />
                      {newProjectData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLinkField(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Update Modal */}
      {showProjectUpdateModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleProjectUpdateSubmit}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className={`text-xl text-white ${heading_font.className}`}>
                  Update Project Cover Image Key
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setShowProjectUpdateModal((prev) => {
                      return {
                        show: false,
                        id: prev.id,
                      };
                    })
                  }
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Single Field */}
              <div className="p-6 space-y-6">
                {/* Cover Image Media Key Field */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Cover Image Media Key (e.g., user-assets/user-id/asset-name)
                  </label>
                  <input
                    type="text"
                    name="coverImgMediaKey"
                    value={projectUpdate.coverImgMediaKey}
                    onChange={handleProjectUpdateInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    placeholder="Paste the asset key here..."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 p-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    setShowProjectUpdateModal(() => {
                      return {
                        show: false,
                        id: null,
                      };
                    })
                  }
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Save Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Asset Modal */}
      {showNewAssetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className={`text-2xl text-white ${heading_font.className}`}>
                Upload New Asset
              </h2>
              <button
                onClick={() => setShowNewAssetModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleNewAssetSubmit} className="p-6 space-y-6">
              {/* Asset Name Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  htmlFor="asset-name"
                >
                  Asset Name
                </label>
                <input
                  id="asset-name"
                  type="text"
                  name="name"
                  value={newAssetData.name} // Assumes newAssetData.name state
                  onChange={handleAssetInputChange} // Assumes handler for text inputs
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  placeholder="Enter a name for your asset..."
                  required
                />
              </div>

              {/* File Upload Field (Image Only) */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  htmlFor="asset-file"
                >
                  Image File
                </label>
                <input
                  id="asset-file"
                  type="file"
                  name="file"
                  accept="image/*" // Restricts to image types
                  onChange={handleAssetFileChange} // Assumes handler for file input
                  className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-pink-500/10 file:text-pink-400
                  hover:file:bg-pink-500/20
                  transition-all duration-300"
                  required
                />
                {newAssetData.file && (
                  <p
                    className={`mt-2 text-xs text-gray-400 ${paragraph_font.className}`}
                  >
                    Selected: {newAssetData.file.name}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewAssetModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Upload Asset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}