"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Righteous, Roboto } from "next/font/google";
import api from "../axiosApi";
import toast from "react-hot-toast";
import CGSLogo from "../assets/logo.png";
import { LucideCalendar, LucideClock, Pencil, UserStar } from "lucide-react";
import { uploadToCloudinary } from "../utils/cloudinary";
import { X, Trash2, Copy, Edit2 } from "lucide-react";
import { DashboardProvider, useDashboard } from "../context/dashboardContext";
import { EUserRole, Links } from "../types/domain.types";
import { Listbox } from "@headlessui/react";
import {
  MAX_ASSET_UPLOAD_FILE_SIZE,
  MAX_ASSET_PREVIEW_SIZE,
} from "../utils/config";
import { count } from "console";

type AllSections = "BLOGS" | "PROJECTS" | "PROFILE" | "ASSETS";

const headingFont = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraphFont = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export const fonts = {
  heading: headingFont,
  paragraph: paragraphFont,
} as const;

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<AllSections>("PROFILE");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "PROFILE":
        return <ProfileSection />;
      case "BLOGS":
        return <BlogsSection />;
      case "PROJECTS":
        return <ProjectsSection />;
      case "ASSETS":
        return <AssetsSection />;
      default:
        return null;
    }
  };

  return (
    <>
      <DashboardProvider>
        <div className="min-h-screen bg-gradient-to-tr from-neutral-900 via-gray-950 to-black">
          <div className="flex h-screen">
            <SideBar
              activeSection={activeSection}
              onSectionChange={(section) => {
                setActiveSection(section);
              }}
              isMobileSidebarOpen={isMobileSidebarOpen}
              onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col">
              <TopBar
                activeSection={activeSection}
                isMobileSidebarOpen={isMobileSidebarOpen}
                onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              />
              <div className="flex-1 overflow-y-auto">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </DashboardProvider>
    </>
  );
};

export default Dashboard;

interface TopBarProps {
  activeSection: AllSections;
  isMobileSidebarOpen: boolean;
  onOpenMobileSidebar: () => void;
}

const TopBar = (props: TopBarProps) => {
  const sectionInfo: Record<AllSections, { title: string; message: string }> = {
    PROFILE: {
      title: "Profile",
      message: "Welcome back! Here's a quick look at your account",
    },
    PROJECTS: {
      title: "Projects",
      message: "Manage your active and completed projects",
    },
    BLOGS: {
      title: "Blogs",
      message: "Write, edit, and publish your posts",
    },
    ASSETS: {
      title: "Assets",
      message: "Organize your images, videos, and media",
    },
  };

  return (
    <>
      <div className="h-20 glass-without-border border-b border-gray-500 px-4 lg:px-4 flex items-center space-x-4">
        <button
          onClick={props.onOpenMobileSidebar}
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
            className={`text-lg lg:text-xl text-white ${fonts.heading.className}`}
          >
            {sectionInfo[props.activeSection].title}
          </h1>
          <p
            className={`text-gray-400 text-sm lg:text-base ${fonts.paragraph.className} hidden sm:block`}
          >
            {sectionInfo[props.activeSection].message}
          </p>
        </div>
      </div>
    </>
  );
};

interface SidebarProps {
  activeSection: AllSections;
  onSectionChange: (section: AllSections) => void;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
}

const SideBar = (props: SidebarProps) => {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const menuItems: {
    id: AllSections;
    label: string;
    icon: JSX.Element;
  }[] = [
    {
      id: "PROFILE",
      label: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      id: "BLOGS",
      label: "Blog",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      ),
    },
    {
      id: "PROJECTS",
      label: "Projects",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      ),
    },
    {
      id: "ASSETS",
      label: "Assets",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
        </svg>
      ),
    },
  ];

  const signOutIconSVG = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z" />
    </svg>
  );

  const handleSignOut = async () => {
    const apiResponse = await api("POST", "/auth/sign-out");

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.message);
    } else {
      toast.success("Signed out");
      refreshUser();
      router.push("/");
    }
  };

  return (
    <>
      {props.isMobileSidebarOpen ? (
        <div>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={props.onCloseMobileSidebar}
          />
        </div>
      ) : null}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 
          glass-without-border border-r border-gray-500 flex flex-col 
          transform transition-transform duration-300 ease-in-out
          ${props.isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static
        `}
      >
        <div className="h-20 px-4 border-b border-gray-500 flex items-center space-x-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/5">
            <Image src={CGSLogo} alt="CGS Logo" className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <h1
              className={`text-white text-md tracking-widest font-medium ${fonts.heading.className}`}
            >
              CGS
            </h1>
            <span
              className={`text-sm text-gray-400 ${fonts.paragraph.className}`}
            >
              Dashboard
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className={fonts.paragraph.className}>Home</span>
          </Link>

          {user?.roles.includes(EUserRole.ADMIN) && (
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <UserStar className="w-5 h-5" />
              <span className={fonts.paragraph.className}>Admin Panel</span>
            </Link>
          )}

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => props.onSectionChange(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 border border-transparent focus:outline-none
                ${
                  props.activeSection === item.id
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                }
              `}
            >
              {item.icon}
              <span className={fonts.paragraph.className}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-500">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center cursor-pointer space-x-3 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            {signOutIconSVG}
            <span className={fonts.paragraph.className}>SignOut</span>
          </button>
        </div>
      </div>
    </>
  );
};

const ProfileSection = () => {
  const [hovering, setHovering] = useState(false);
  const [uploadingNewProfileImg, setUploadingNewProfileImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, refreshUser } = useAuth();
  const { directAssetUpload } = useCloudinaryUpload();
  const { state: dashboardState } = useDashboard();

  const correctCount = (count: number) => {
    return count === -1 ? "Loading..." : count;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploadingNewProfileImg(true);

    try {
      const url = await directAssetUpload(file);
      if (!url) toast.error("Uploading failed");

      const apiResponse = await api("PATCH", "/user", {
        body: {
          profileImgUrl: url,
        },
      });

      if (apiResponse.action === null) {
        toast.error("Server Error");
      } else if (apiResponse.action === false) {
        toast.error(apiResponse.statusCode + ": " + apiResponse.message);
      } else {
        refreshUser();
        toast.success("Profile photo updated.");
      }
    } finally {
      setUploadingNewProfileImg(false);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1000px] p-4 md:p-6 flex flex-col gap-5">
          <div className="w-full mt-2 px-6 h-28 rounded-lg flex flex-row gap-6 items-center border border-slate-900">
            <div
              className="relative w-16 h-16"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <Image
                src={user?.profileImgUrl || "/default-fallback-image.png"}
                alt="Profile Image"
                className="w-16 h-16 object-cover rounded-full border-2 border-pink-500/20"
                width={64}
                height={64}
              />

              {hovering && (
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Edit2 size={20} className="text-white" />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {uploadingNewProfileImg && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40">
                  <div className="w-6 h-6 border-2 border-transparent border-t-pink-500 border-r-purple-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <h2 className={`text-md text-white ${fonts.heading.className}`}>
                {user?.name ?? "Loading..."}
              </h2>

              <div className="flex justify-between flex-col gap-0.5 sm:flex-row">
                <div className="flex gap-3 items-center">
                  <p
                    className={`text-sm text-gray-500 ${fonts.paragraph.className}`}
                  >
                    {user?.team.name}
                  </p>
                  <p
                    className={`text-xs p-1 rounded-md bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30 ${fonts.paragraph.className}`}
                  >
                    {user?.designation}
                  </p>
                </div>
                <p
                  className={`bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-sm ${fonts.paragraph.className}`}
                >
                  Member since {user?.createdAt.getFullYear() ?? "Loading..."}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row justify-between gap-3">
            <div className="flex-1 h-24 px-4 flex flex-col justify-around rounded-xl border border-slate-900">
              <p
                className={`text-md text-gray-400  ${fonts.paragraph.className}`}
              >
                Blogs
              </p>
              <p className={`text-2xl text-white ${fonts.paragraph.className}`}>
                {correctCount(dashboardState.statistics.countBlogs)}
              </p>
            </div>
            <div className="flex-1 h-24 px-4 flex flex-col justify-around rounded-xl border border-slate-900">
              <p
                className={`text-md text-gray-400  ${fonts.paragraph.className}`}
              >
                Projects
              </p>
              <p className={`text-2xl text-white ${fonts.paragraph.className}`}>
                {correctCount(dashboardState.statistics.countProjects)}
              </p>
            </div>
            <div className="flex-1 h-24 px-4 flex flex-col justify-around rounded-xl border border-slate-900">
              <p
                className={`text-md text-gray-400  ${fonts.paragraph.className}`}
              >
                Assets
              </p>
              <p className={`text-2xl text-white ${fonts.paragraph.className}`}>
                {correctCount(dashboardState.statistics.countAssets)}
              </p>
            </div>
          </div>

          <PersonalInfoAndLinksSubSection />
        </div>
      </div>
    </>
  );
};

const PersonalInfoAndLinksSubSection = () => {
  const { user, refreshUser } = useAuth();

  const [personalEdit, setPersonalEdit] = useState(false);
  const [linksEdit, setLinksEdit] = useState(false);

  const [personal, setPersonal] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [links, setLinks] = useState({
    github: "",
    linkedin: "",
    mail: "",
  });

  const [initialPersonal, setInitialPersonal] = useState(personal);
  const [initialLinks, setInitialLinks] = useState(links);

  useEffect(() => {
    resetPersonal();
    resetLinks();
  }, [user]);

  const resetPersonal = () => {
    if (!user) {
      const value = {
        name: "",
        phone: "",
        email: "",
      };

      setPersonal(value);
      setInitialPersonal(value);
      setPersonalEdit(false);
      return;
    }

    const value = {
      name: user.name ?? "",
      phone: user.phoneNumber ?? "",
      email: user.email ?? "",
    };

    setPersonal(value);
    setInitialPersonal(value);
    setPersonalEdit(false);
  };

  const resetLinks = () => {
    let value;

    if (!user) {
      value = {
        github: "",
        linkedin: "",
        mail: "",
      };
    } else {
      const map = Object.fromEntries(
        (user.links ?? []).map((link) => [link.text, link.url]),
      );

      value = {
        github: map.github ?? "",
        linkedin: map.linkedin ?? "",
        mail: map.mail ?? "",
      };
    }

    setLinks(value);
    setInitialLinks(value);

    setLinksEdit(false);
  };

  const handlePersonalSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = personal.name.trim();
    const phone = personal.phone.trim();

    if (name === "") {
      toast.error("Name cannot be empty.");
      return;
    }

    const apiResponse = await api("PATCH", "/user", {
      body: {
        name,
        phoneNumber: phone === "" ? "N/A" : phone,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      refreshUser();
      setInitialPersonal(personal);
      setPersonalEdit(false);
      toast.success("Your personal information has been updated.");
    }
  };

  const handleLinksSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = [
      { text: "github", url: links.github },
      { text: "linkedin", url: links.linkedin },
      { text: "mail", url: links.mail },
    ].filter((link) => link.url.trim() !== "");

    const apiResponse = await api("PATCH", "/user", {
      body: {
        links: payload,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      refreshUser();
      setInitialLinks(links);
      setLinksEdit(false);
      toast.success("Your links have been updated.");
    }
  };

  const cancelPersonal = () => {
    setPersonal(initialPersonal);
    setPersonalEdit(false);
  };

  const cancelLinks = () => {
    setLinks(initialLinks);
    setLinksEdit(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-5">
      <form
        onSubmit={handlePersonalSave}
        className="flex-1 relative rounded-xl border border-slate-900 p-5 flex flex-col gap-4"
      >
        <button
          type="button"
          onClick={() => setPersonalEdit(true)}
          className="absolute top-5 right-5 hover:cursor-pointer text-gray-500 hover:text-white"
        >
          <Pencil size={16} />
        </button>

        <div>
          <h3 className={`text-white text-md ${fonts.heading.className}`}>
            Personal Information
          </h3>
          <p className={`text-xs text-gray-500 ${fonts.paragraph.className}`}>
            Update your personal details
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            className={`text-xs text-gray-400 ${fonts.paragraph.className}`}
          >
            Name
          </label>
          <input
            type="text"
            disabled={!personalEdit}
            value={user ? personal.name : ""}
            placeholder={!user ? "Loading..." : ""}
            onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
            className="w-full bg-transparent border border-slate-800 rounded-md px-3 py-2 text-sm text-white disabled:text-gray-400 outline-none focus:border-pink-500/40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className={`text-xs text-gray-400 ${fonts.paragraph.className}`}
          >
            Phone Number
          </label>
          <input
            type="text"
            disabled={!personalEdit}
            value={user ? personal.phone : ""}
            placeholder={!user ? "Loading..." : ""}
            onChange={(e) =>
              setPersonal({ ...personal, phone: e.target.value })
            }
            className="w-full bg-transparent border border-slate-800 rounded-md px-3 py-2 text-sm text-white disabled:text-gray-400 outline-none focus:border-pink-500/40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            className={`text-xs text-gray-400 ${fonts.paragraph.className}`}
          >
            Email
          </label>
          <input
            disabled
            value={user ? personal.email : ""}
            placeholder={!user ? "Loading..." : ""}
            className="w-full bg-slate-900/40 border border-slate-800 rounded-md px-3 py-2 text-sm text-gray-500"
          />
        </div>

        <div className="h-10 flex gap-3 items-center">
          {personalEdit && (
            <>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white hover:cursor-pointer rounded-md bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30"
              >
                Save
              </button>

              <button
                type="button"
                onClick={cancelPersonal}
                className="px-4 py-2 text-sm text-gray-400  hover:cursor-pointer border border-slate-800 rounded-md"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>

      <form
        onSubmit={handleLinksSave}
        className="flex-1 relative rounded-xl border border-slate-900 p-5 flex flex-col gap-4"
      >
        <button
          type="button"
          onClick={() => setLinksEdit(true)}
          className="absolute top-5 right-5 hover:cursor-pointer text-gray-500 hover:text-white"
        >
          <Pencil size={16} />
        </button>

        <div>
          <h3 className={`text-white text-md ${fonts.heading.className}`}>
            Social Links
          </h3>
          <p className={`text-xs text-gray-500 ${fonts.paragraph.className}`}>
            Add links for your profile
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Github</label>
          <input
            type="url"
            disabled={!linksEdit}
            value={links.github}
            placeholder={!user ? "Loading..." : ""}
            onChange={(e) => setLinks({ ...links, github: e.target.value })}
            className="w-full bg-transparent border border-slate-800 rounded-md px-3 py-2 text-sm text-white disabled:text-gray-400 outline-none focus:border-pink-500/40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">LinkedIn</label>
          <input
            type="url"
            disabled={!linksEdit}
            value={links.linkedin}
            placeholder={!user ? "Loading..." : ""}
            onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
            className="w-full bg-transparent border border-slate-800 rounded-md px-3 py-2 text-sm text-white disabled:text-gray-400 outline-none focus:border-pink-500/40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Mail</label>
          <input
            type="url"
            disabled={!linksEdit}
            value={links.mail}
            placeholder={!user ? "Loading..." : ""}
            onChange={(e) => setLinks({ ...links, mail: e.target.value })}
            className="w-full bg-transparent border border-slate-800 rounded-md px-3 py-2 text-sm text-white disabled:text-gray-400 outline-none focus:border-pink-500/40"
          />
        </div>

        <div className="h-10 flex gap-3 items-center">
          {linksEdit && (
            <>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white  hover:cursor-pointer rounded-md bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30"
              >
                Save
              </button>

              <button
                type="button"
                onClick={cancelLinks}
                className="px-4 py-2 text-sm text-gray-400  hover:cursor-pointer border border-slate-800 rounded-md"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

const BlogsSection = () => {
  const [showBlogUploadModal, setShowBlogUploadModal] = useState(false);
  const [showBlogUpdateModal, setShowBlogUpdateModal] = useState(false);
  const [updateBlogId, setUpdateBlogId] = useState<string | null>(null);

  const { state, resetBlogs } = useDashboard();
  const { directAssetUpload } = useCloudinaryUpload();

  const handleNewBlogSubmit = async (data: {
    title: string;
    slug: string;
    tags: string[];
    coverImgUrl: string;
    content: string;
  }) => {
    const apiResponse = await api("POST", "/blog", {
      body: data,
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetBlogs();
      toast.success("Added a new blog.");
    }
  };

  const handleBlogUpdate = async (data: {
    _id: string;
    title: string;
    slug: string;
    tags: string[];
    coverImgUrl: string;
    content?: string;
  }) => {
    const apiResponse = await api("PATCH", `/blog/${data._id}`, {
      body: data,
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetBlogs();
      toast.success("Updated Blog.");
    }
  };

  const handleBlogDelete = async (_id: string) => {
    const apiResponse = await api("DELETE", `/blog/${_id}`);

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetBlogs();
      toast.success("Removed blog.");
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1100px] p-4 md:p-6 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white">Blogs</h1>
              <p className="text-gray-400 text-sm">
                Create and manage your blogs
              </p>
            </div>

            <button
              onClick={() => setShowBlogUploadModal(true)}
              className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/30 transition"
            >
              New Blog
            </button>
          </div>

          {state.blogs.length === 0 ? (
            <p className="text-gray-400 mt-6">No blogs yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="relative rounded-xl border border-white/10 bg-[#0f0f12] p-5 flex flex-col gap-4 transition hover:border-pink-400/50"
                >
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => {
                        setUpdateBlogId(blog._id);
                        setShowBlogUpdateModal(true);
                      }}
                      className="flex hover:cursor-pointer items-center justify-center bg-black/60 backdrop-blur-sm rounded-md p-1.5 border border-transparent hover:border-amber-400 transition"
                    >
                      <Pencil size={15} className="text-amber-400" />
                    </button>

                    <button
                      onClick={() => handleBlogDelete(blog._id)}
                      className="flex hover:cursor-pointer items-center justify-center bg-black/60 backdrop-blur-sm rounded-md p-1.5 border border-transparent hover:border-red-500 transition"
                    >
                      <Trash2 size={15} className="text-red-400" />
                    </button>
                  </div>

                  <h3 className="text-white font-semibold text-md line-clamp-1 pr-14">
                    {blog.title}
                  </h3>

                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    Slug: {blog.slug}
                  </p>

                  <div className="border-t border-white/10"></div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 w-fit">
                        <LucideCalendar className="w-3 h-3" /> Created{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 w-fit">
                        <LucideClock className="w-3 h-3" /> Updated{" "}
                        {new Date(blog.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBlogUploadModal && (
        <NewBlogModal
          open={showBlogUploadModal}
          onClose={() => {
            setShowBlogUploadModal(false);
            setUpdateBlogId(null);
          }}
          onCreate={handleNewBlogSubmit}
          onDirectCoverImgUpload={directAssetUpload}
        />
      )}

      {showBlogUpdateModal && updateBlogId && (
        <UpdateBlogModal
          key={updateBlogId}
          open={showBlogUpdateModal}
          blogId={updateBlogId}
          onClose={() => {
            setShowBlogUpdateModal(false);
            setUpdateBlogId(null);
          }}
          onDirectCoverImgUpload={directAssetUpload}
          onUpdate={handleBlogUpdate}
        />
      )}
    </>
  );
};

const ProjectsSection = () => {
  const [showProjectUploadModal, setShowProjectUploadModal] = useState(false);
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
  const [updateProjectId, setUpdateProjectId] = useState<string | null>(null);

  const { state, resetProjects } = useDashboard();
  const { directAssetUpload } = useCloudinaryUpload();

  const handleNewProjectSubmit = async (data: {
    title: string;
    portfolio: "GAME" | "GRAPHICS" | "RND";
    description: string;
    tags: string[];
    coverImgUrl: string;
    links: Links[];
  }) => {
    const apiResponse = await api("POST", "/project", {
      body: {
        title: data.title,
        portfolio: data.portfolio,
        description: data.description,
        tags: data.tags,
        coverImgUrl: data.coverImgUrl,
        links: data.links,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetProjects();
      toast.success("Added a new project.");
    }
  };

  const handleProjectUpdate = async (data: {
    _id: string;
    title: string;
    portfolio: "GAME" | "GRAPHICS" | "RND";
    description: string;
    tags: string[];
    coverImgUrl: string;
    links: Links[];
  }) => {
    const apiResponse = await api("PATCH", `/project/${data._id}`, {
      body: {
        title: data.title,
        portfolio: data.portfolio,
        description: data.description,
        tags: data.tags,
        coverImgUrl: data.coverImgUrl,
        links: data.links,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetProjects();
      toast.success("Updated Project.");
    }
  };

  const handleProjectDelete = async (_id: string) => {
    const apiResponse = await api("DELETE", `/project/${_id}`);

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetProjects();
      toast.success("Removed project.");
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1100px] p-4 md:p-6 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white">Projects</h1>
              <p className="text-gray-400 text-sm">
                Create and manage your projects
              </p>
            </div>

            <button
              onClick={() => setShowProjectUploadModal(true)}
              className="px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/30 transition"
            >
              New Project
            </button>
          </div>

          {state.projects.length === 0 ? (
            <p className="text-gray-400 mt-6">No projects yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.projects.map((project) => (
                <div
                  key={project._id}
                  className="relative rounded-xl border border-white/10 bg-[#0f0f12] p-5 flex flex-col gap-4 transition hover:border-pink-400/50"
                >
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => {
                        setUpdateProjectId(project._id);
                        setShowProjectUpdateModal(true);
                      }}
                      className="flex hover:cursor-pointer items-center justify-center bg-black/60 backdrop-blur-sm rounded-md p-1.5 border border-transparent hover:border-amber-400 transition"
                    >
                      <Pencil size={15} className="text-amber-400" />
                    </button>

                    <button
                      onClick={() => handleProjectDelete(project._id)}
                      className="flex hover:cursor-pointer items-center justify-center bg-black/60 backdrop-blur-sm rounded-md p-1.5 border border-transparent hover:border-red-500 transition"
                    >
                      <Trash2 size={15} className="text-red-400" />
                    </button>
                  </div>

                  <h3 className="text-white font-semibold text-md line-clamp-1 pr-14">
                    {project.title}
                  </h3>

                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>

                  <div className="border-t border-white/10"></div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 w-fit">
                        <LucideCalendar className="w-3 h-3" /> Created{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 w-fit">
                        <LucideClock className="w-3 h-3" /> Updated{" "}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="px-3 py-1 text-[10px] font-semibold rounded-md border border-pink-400/40 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 tracking-wide">
                      {project.portfolio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showProjectUploadModal && (
        <NewProjectModal
          open={showProjectUploadModal}
          onClose={() => {
            setShowProjectUploadModal(false);
            setUpdateProjectId(null);
          }}
          onCreate={handleNewProjectSubmit}
          onDirectCoverImgUpload={directAssetUpload}
        />
      )}

      {showProjectUpdateModal && updateProjectId && (
        <UpdateProjectModal
          key={updateProjectId}
          open={showProjectUpdateModal}
          projectId={updateProjectId}
          onClose={() => {
            setShowProjectUpdateModal(false);
            setUpdateProjectId(null);
          }}
          onDirectCoverImgUpload={directAssetUpload}
          onUpdate={handleProjectUpdate}
        />
      )}
    </>
  );
};

const AssetsSection = () => {
  const [showAssetUploadModal, setShowAssetUploadModal] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<string | null>(null);

  const droppedFileRef = useRef<File | null>(null);

  const { state, resetAssets } = useDashboard();
  const { upload } = useCloudinaryUpload();

  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      droppedFileRef.current = droppedFile;
      setShowAssetUploadModal(true);
    }
  };

  const handleNewAssetSubmit = async (
    file: File,
  ): Promise<string | undefined> => {
    try {
      const { publicId, url } = await upload(file);

      const response = await api("POST", "/media", {
        body: { publicId, url },
      });

      if (response.action === null) {
        toast.error("Server Error while adding new asset");
        return;
      } else if (response.action === false) {
        toast.error(response.statusCode + ": " + response.message);
        return;
      }

      resetAssets();
      toast.success("Asset uploaded successfully!");

      return url;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Upload failed");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const apiResponse = await api("DELETE", `/media/${id}`);

    if (apiResponse.action === null) {
      toast.error("Server Error while deleting asset");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      resetAssets();
      toast.success("Removed asset.");
    }
  };

  const copyMediaUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied media URL", { position: "bottom-right" });
    } catch (err) {
      console.error("Failed to copy asset URL:", err);
      toast.error("Failed to copy. Check browser permissions.");
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1000px] p-4 md:p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white">My Assets</h1>
              <p className="text-gray-400 text-sm">
                Upload and manage your media assets
              </p>
            </div>

            <button
              onClick={() => setShowAssetUploadModal(true)}
              className="px-3 py-1.5 text-sm hover:cursor-pointer rounded-md bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/30 transition"
            >
              Upload Asset
            </button>
          </div>

          <div
            className="w-full border border-dashed border-white/15 rounded-xl h-36 flex flex-col items-center justify-center text-gray-400 hover:border-pink-500/50 hover:bg-white/[0.02] transition cursor-pointer"
            onDrop={handleMediaDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p className="text-sm">Drag and drop files here</p>
          </div>

          {state.assets.length === 0 ? (
            <p className="text-gray-400 text-sm mt-6">
              No assets uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {state.assets.map((asset) => {
                const sizeBytes =
                  typeof asset.sizeBytes === "number" ? asset.sizeBytes : -1;

                const canPreview =
                  sizeBytes !== -1 && sizeBytes <= MAX_ASSET_PREVIEW_SIZE;
                return (
                  <div
                    key={asset._id}
                    className="relative rounded-xl border border-white/10 bg-[#0f0f12] p-2 transition hover:border-pink-400/50"
                  >
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                      <button
                        onClick={() => copyMediaUrl(asset.url)}
                        className="flex hover:cursor-pointer items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-300 border border-transparent hover:border-lime-300 hover:text-lime-300 transition"
                        aria-label="Copy URL"
                        type="button"
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(asset._id)}
                        className="flex hover:cursor-pointer items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-300 border border-transparent hover:border-red-500 hover:text-red-400 transition"
                        aria-label="Delete Asset"
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {canPreview ? (
                      <Image
                        src={asset.url}
                        alt={asset.key}
                        width={112}
                        height={112}
                        onClick={() => setPreviewAsset(asset.url)}
                        loading="lazy"
                        className="w-full h-28 sm:h-32 md:h-36 lg:h-40 object-cover rounded-lg cursor-pointer transition duration-300 hover:scale-[1.05] hover:shadow-[0_0_18px_rgba(217,70,239,0.35)]"
                      />
                    ) : (
                      <div className="w-full h-28 sm:h-32 md:h-36 lg:h-40 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 text-xs text-center p-2 cursor-default">
                        {sizeBytes === -1
                          ? "Size unknown, preview disabled"
                          : `File too large (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) to preview`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewAsset && (
        <div
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <img
            src={previewAsset}
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
            alt="Preview"
          />
        </div>
      )}

      <AssetUploadModal
        open={showAssetUploadModal}
        onClose={() => setShowAssetUploadModal(false)}
        onUpload={handleNewAssetSubmit}
        defaultFile={droppedFileRef.current}
      />
    </>
  );
};

const useCloudinaryUpload = () => {
  const [loading, setLoading] = useState(false);

  const { resetAssets } = useDashboard();

  const upload = async (file: File) => {
    if (file.size >= MAX_ASSET_UPLOAD_FILE_SIZE) {
      throw new Error("File size too big. Max allowed size is 10MB.");
    }

    setLoading(true);

    try {
      const result = await uploadToCloudinary(file);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const directAssetUpload = async (file: File): Promise<string | undefined> => {
    try {
      const { publicId, url } = await upload(file);

      const response = await api("POST", "/media", {
        body: { publicId, url },
      });

      if (response.action === null) {
        toast.error("Server Error while adding new asset");
        return;
      } else if (response.action === false) {
        toast.error(response.statusCode + ": " + response.message);
        return;
      }

      resetAssets();
      toast.success("Asset uploaded successfully!");

      return url;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Upload failed");
      }
    }
  };

  return { upload, directAssetUpload, loading };
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const Modal = (props: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!props.open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      props.onClose();
    }
  };

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-[#000000] border border-white/10 rounded-xl shadow-xl"
      >
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">{props.title}</h2>

            {props.subtitle && (
              <p className="text-sm text-gray-400 mt-1">{props.subtitle}</p>
            )}
          </div>

          <button
            onClick={props.onClose}
            className="p-2 rounded-md hover:bg-white/10 transition hover:cursor-pointer"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {props.children}
        </div>
      </div>
    </div>
  );
};

interface AssetUploadProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<string | void>;
  defaultFile?: File | null;
}

const AssetUploadModal = (props: AssetUploadProps) => {
  const [file, setFile] = useState<File | null>(props.defaultFile || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.open) {
      setFile(null);
      setLoading(false);
    }
  }, [props.open]);

  useEffect(() => {
    if (props.defaultFile) {
      setFile(props.defaultFile);
    }
  }, [props.defaultFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;

    try {
      setLoading(true);
      await props.onUpload(file);
      setFile(null);
      props.onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Upload Asset"
      subtitle="Add a new image to the media library."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Image File</label>

          {!props.defaultFile ? (
            <input
              type="file"
              accept="image/*"
              required={!file}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm
            file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20 transition-all duration-300s"
            />
          ) : null}

          {file && (
            <p
              className={`${props.defaultFile ? "text-md text-gray-300" : "text-xs text-gray-500"}  mt-2`}
            >
              Selected: {file.name}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={props.onClose}
            className="px-5 py-2 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md
              border border-white/10 transition-all duration-200 hover:cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:scale-105
              hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 relative
              overflow-hidden group hover:cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full
              group-hover:translate-x-full transition-transform duration-700"
            ></div>
            <span className="relative z-10">
              {loading ? "Uploading..." : "Upload Asset"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onDirectCoverImgUpload: (file: File) => Promise<string | void>;
  onCreate: (data: {
    title: string;
    portfolio: "GAME" | "GRAPHICS" | "RND";
    description: string;
    tags: string[];
    coverImgUrl: string;
    links: Links[];
  }) => Promise<void>;
}

const NewProjectModal = (props: NewProjectModalProps) => {
  const [title, setTitle] = useState("");
  const [portfolio, setPortfolio] = useState<"GAME" | "GRAPHICS" | "RND">(
    "GAME",
  );
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [coverImgUrl, setCoverImgUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState<Links[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.open) {
      cleanModalData();
    }
  }, [props.open]);

  const cleanModalData = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setCoverImgUrl("");

    setGithubUrl("");
    setLiveUrl("");
    setExtraLinks([]);

    setPortfolio("GAME");
  };

  const addExtraLink = () => {
    setExtraLinks([...extraLinks, { text: "", url: "" }]);
  };

  const removeExtraLink = (index: number) => {
    setExtraLinks(extraLinks.filter((_, i) => i !== index));
  };

  const updateExtraLink = (index: number, key: keyof Links, value: string) => {
    const updated = [...extraLinks];
    updated[index][key] = value;
    setExtraLinks(updated);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingImg(true);

    if (!file) return;

    try {
      const url = await props.onDirectCoverImgUpload(file);

      if (!url) {
        toast.error("Uploading failed");
      } else {
        setCoverImgUrl(url);
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const links: Links[] = [];

    if (githubUrl.trim()) {
      links.push({ text: "github", url: githubUrl });
    }
    if (liveUrl.trim()) {
      links.push({ text: "live-link", url: liveUrl });
    }
    extraLinks.forEach((l) => {
      if (l.text && l.url) {
        links.push(l);
      }
    });

    await props.onCreate({
      title: title,
      portfolio,
      description,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImgUrl,
      links,
    });

    setLoading(false);
    props.onClose();
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Create Project"
      subtitle="Add a new project to your portfolio."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Project Title
          </label>
          <input
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Portfolio Type
          </label>

          <Listbox value={portfolio} onChange={setPortfolio}>
            <div className="relative">
              <Listbox.Button className="form-input text-left">
                {portfolio}
              </Listbox.Button>

              <Listbox.Options className="absolute mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-10">
                <Listbox.Option
                  value="GAME"
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-pink-600/40 text-white" : "text-white"
                    }`
                  }
                >
                  Game
                </Listbox.Option>

                <Listbox.Option
                  value="GRAPHICS"
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-pink-600/40 text-white" : "text-white"
                    }`
                  }
                >
                  Graphics
                </Listbox.Option>

                <Listbox.Option
                  value="RND"
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-pink-600/40 text-white" : "text-white"
                    }`
                  }
                >
                  R&D
                </Listbox.Option>
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="three.js, multiplayer, shaders"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Cover Image URL or upload directly
          </label>

          <div className="flex flex-col gap-1">
            <input
              value={coverImgUrl}
              onChange={(e) => setCoverImgUrl(e.target.value)}
              className="form-input"
            />

            <label className="block text-xs text-gray-500 m-0.5">
              Or upload directly
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleCoverUpload(e.target.files[0]);
                }
              }}
              className="block hover:cursor-pointer w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm
            file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20 transition-all duration-300s"
            />

            {uploadingImg && (
              <div className="w-full h-1 bg-white/10 rounded mt-2 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-purple-500 animate-[uploadbar_1s_linear_infinite]" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-3">Links</label>{" "}
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                value="github"
                disabled
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400"
              />
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="form-input flex-1"
              />
              <div className="w-6"></div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                value="live-link"
                disabled
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400"
              />
              <input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com/..."
                className="form-input flex-1"
              />
              <div className="w-6"></div>
            </div>

            {extraLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={link.text}
                  onChange={(e) =>
                    updateExtraLink(index, "text", e.target.value)
                  }
                  placeholder="type"
                  className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
                <input
                  value={link.url}
                  onChange={(e) =>
                    updateExtraLink(index, "url", e.target.value)
                  }
                  placeholder="https://..."
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeExtraLink(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addExtraLink}
            className="mt-3 text-sm text-pink-400 hover:text-pink-300"
          >
            + Add Link
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={props.onClose}
            className="px-5 py-2 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingImg}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface UpdateProjectModalProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onDirectCoverImgUpload: (file: File) => Promise<string | void>;
  onUpdate: (data: {
    _id: string;
    title: string;
    portfolio: "GAME" | "GRAPHICS" | "RND";
    description: string;
    tags: string[];
    coverImgUrl: string;
    links: Links[];
  }) => Promise<void>;
}

const UpdateProjectModal = (props: UpdateProjectModalProps) => {
  const [title, setTitle] = useState("");
  const [portfolio, setPortfolio] = useState<"GAME" | "GRAPHICS" | "RND">(
    "GAME",
  );
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [coverImgUrl, setCoverImgUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState<Links[]>([]);

  const [loading, setLoading] = useState(false);

  const { state } = useDashboard();
  const project = state.projects.find((p) => p._id === props.projectId);

  useEffect(() => {
    if (project) {
      resetModalData();
    }
  }, [project]);

  const resetModalData = () => {
    if (!project) return;

    setTitle(project.title);
    setPortfolio(project.portfolio);
    setDescription(project.description);
    setTags(project.tags.join(", "));
    setCoverImgUrl(project.coverImgUrl || "");

    const github = project.links.find((link) => link.text === "github");
    const live = project.links.find((link) => link.text === "live-link");

    setGithubUrl(github?.url || "");
    setLiveUrl(live?.url || "");

    setExtraLinks(
      project.links.filter(
        (link) => link.text !== "github" && link.text !== "live-link",
      ),
    );
  };

  const addExtraLink = () => {
    setExtraLinks([...extraLinks, { text: "", url: "" }]);
  };

  const removeExtraLink = (index: number) => {
    setExtraLinks(extraLinks.filter((_, i) => i !== index));
  };

  const updateExtraLink = (index: number, key: keyof Links, value: string) => {
    const updated = [...extraLinks];
    updated[index][key] = value;
    setExtraLinks(updated);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingImg(true);

    if (!file) return;

    try {
      const url = await props.onDirectCoverImgUpload(file);

      if (!url) {
        toast.error("Uploading failed");
      } else {
        setCoverImgUrl(url);
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const links: Links[] = [];

    if (githubUrl.trim()) {
      links.push({ text: "github", url: githubUrl });
    }
    if (liveUrl.trim()) {
      links.push({ text: "live-link", url: liveUrl });
    }
    extraLinks.forEach((l) => {
      if (l.text && l.url) {
        links.push(l);
      }
    });

    await props.onUpdate({
      _id: props.projectId,
      title,
      portfolio,
      description,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImgUrl,
      links,
    });

    setLoading(false);
    props.onClose();
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Update Project"
      subtitle="Update your project information."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Project Title
          </label>
          <input
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Portfolio Type
          </label>

          <Listbox value={portfolio} onChange={setPortfolio}>
            <div className="relative">
              <Listbox.Button className="form-input text-left">
                {portfolio}
              </Listbox.Button>

              <Listbox.Options className="absolute mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-10">
                <Listbox.Option
                  value="GAME"
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-pink-600/40 text-white" : "text-white"
                    }`
                  }
                >
                  Game
                </Listbox.Option>

                <Listbox.Option
                  value="GRAPHICS"
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-pink-600/40 text-white" : "text-white"
                    }`
                  }
                >
                  Graphics
                </Listbox.Option>

                <Listbox.Option
                  value="RND"
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-pink-600/40 text-white" : "text-white"
                    }`
                  }
                >
                  R&D
                </Listbox.Option>
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="three.js, multiplayer, shaders"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Cover Image URL or upload directly
          </label>

          <div className="flex flex-col gap-1">
            <input
              value={coverImgUrl}
              onChange={(e) => setCoverImgUrl(e.target.value)}
              className="form-input"
            />

            <label className="block text-xs text-gray-500 m-0.5">
              Or upload directly
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleCoverUpload(e.target.files[0]);
                }
              }}
              className="block hover:cursor-pointer w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm
            file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20 transition-all duration-300s"
            />

            {uploadingImg && (
              <div className="w-full h-1 bg-white/10 rounded mt-2 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-purple-500 animate-[uploadbar_1s_linear_infinite]" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-3">Links</label>{" "}
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                value="github"
                disabled
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400"
              />
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="form-input flex-1"
              />
              <div className="w-6"></div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                value="live-link"
                disabled
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400"
              />
              <input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com/..."
                className="form-input flex-1"
              />
              <div className="w-6"></div>
            </div>

            {extraLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={link.text}
                  onChange={(e) =>
                    updateExtraLink(index, "text", e.target.value)
                  }
                  placeholder="type"
                  className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
                <input
                  value={link.url}
                  onChange={(e) =>
                    updateExtraLink(index, "url", e.target.value)
                  }
                  placeholder="https://..."
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeExtraLink(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addExtraLink}
            className="mt-3 text-sm text-pink-400 hover:text-pink-300"
          >
            + Add Link
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={props.onClose}
            className="px-5 py-2 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingImg}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium"
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface NewBlogModalProps {
  open: boolean;
  onClose: () => void;
  onDirectCoverImgUpload: (file: File) => Promise<string | void>;
  onCreate: (data: {
    title: string;
    slug: string;
    tags: string[];
    coverImgUrl: string;
    content: string;
  }) => Promise<void>;
}

const NewBlogModal = (props: NewBlogModalProps) => {
  const [title, setTitle] = useState("");
  const [titlecount, setTitlecount]=useState(0);
  const maxlen =150;
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [coverImgUrl, setCoverImgUrl] = useState("");
  const [content, setContent] = useState("");

  const [uploadingImg, setUploadingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.open) {
      resetModal();
    }
  }, [props.open]);

  const resetModal = () => {
    setTitle("");
    setSlug("");
    setTags("");
    setCoverImgUrl("");
    setContent("");
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingImg(true);

    try {
      const url = await props.onDirectCoverImgUpload(file);

      if (!url) {
        toast.error("Uploading failed");
      } else {
        setCoverImgUrl(url);
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    await props.onCreate({
      title,
      slug,
      coverImgUrl,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    props.onClose();
    setLoading(false);
  };

  const generateSlugFromTitle = (title?: string) => {
    return title
      ? title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      : "please-make-slug-manually";
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Create Blog"
      subtitle="Write a new blog post."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Title</label>
          <label className="block text-xs text-gray-300 mb-2">{titlecount}/{maxlen}</label>
          <input
            value={title}
            required
            maxLength={maxlen}
            onChange={(e) => {
              setTitlecount(e.target.value.length)
              setTitle(e.target.value);
              setSlug(generateSlugFromTitle(e.target.value));
            }}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Slug</label>
          <input
            value={slug}
            required
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-safe-identifier-for-your-blog"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="game-dev, rendering, multiplayer"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Cover Image URL or upload
          </label>

          <div className="flex flex-col gap-1">
            <input
              value={coverImgUrl}
              onChange={(e) => setCoverImgUrl(e.target.value)}
              className="form-input"
            />

            <label className="text-xs text-gray-500 m-0.5">
              Or upload directly
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleCoverUpload(e.target.files[0]);
                }
              }}
              className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm
              file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20 transition-all duration-300 hover:cursor-pointer"
            />

            {uploadingImg && (
              <div className="w-full h-1 bg-white/10 rounded mt-2 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-purple-500 animate-[uploadbar_1s_linear_infinite]" />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Blog Content (Markdown)
          </label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-input font-mono"
            placeholder="Write your blog in markdown..."
          />
        </div>

        <div className="flex justify-end gap-4 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={props.onClose}
            className="px-5 py-2 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingImg}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium"
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface UpdateBlogModalProps {
  blogId: string;
  open: boolean;
  onClose: () => void;
  onDirectCoverImgUpload: (file: File) => Promise<string | void>;
  onUpdate: (data: {
    _id: string;
    title: string;
    slug: string;
    tags: string[];
    coverImgUrl: string;
    content?: string;
  }) => Promise<void>;
}

const UpdateBlogModal = (props: UpdateBlogModalProps) => {
  const { state } = useDashboard();
  const blog = state.blogs.find((b) => b._id === props.blogId);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [coverImgUrl, setCoverImgUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug);
      setTags(blog.tags.join(", "));
      setCoverImgUrl(blog.coverImgUrl || "");
      setContent("");
      setEditContent(false);
    }
  }, [blog]);

  const handleCoverUpload = async (file: File) => {
    setUploadingImg(true);
    try {
      const url = await props.onDirectCoverImgUpload(file);
      if (!url) toast.error("Uploading failed");
      else setCoverImgUrl(url);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await props.onUpdate({
      _id: props.blogId,
      title,
      slug,
      coverImgUrl,
      ...(editContent ? { content } : {}),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setLoading(false);
    props.onClose();
  };

  const generateSlugFromTitle = (title?: string) => {
    return title
      ? title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      : "please-make-slug-manually";
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Update Blog"
      subtitle="Update your blog information. Content update is optional."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Title</label>
          <input
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Slug</label>
          <input
            value={slug}
            required
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(generateSlugFromTitle(e.target.value));
            }}
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tech, javascript, react"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Cover Image URL or upload directly
          </label>

          <div className="flex flex-col gap-1">
            <input
              value={coverImgUrl}
              onChange={(e) => setCoverImgUrl(e.target.value)}
              className="form-input"
            />

            <label className="block text-xs text-gray-500 m-0.5">
              Or upload directly
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleCoverUpload(e.target.files[0]);
                }
              }}
              className="block hover:cursor-pointer w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm
            file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20 transition-all duration-300s"
            />

            {uploadingImg && (
              <div className="w-full h-1 bg-white/10 rounded mt-2 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-purple-500 animate-[uploadbar_1s_linear_infinite]" />
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setEditContent(!editContent)}
            className="text-sm text-pink-400 hover:text-pink-300"
          >
            {editContent ? "Cancel" : "Edit Content"}
          </button>

          {editContent && (
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste new markdown content here..."
              className="form-input mt-2 font-mono"
            />
          )}
        </div>

        <div className="flex justify-end gap-4 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={props.onClose}
            className="px-5 py-2 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingImg}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium"
          >
            {loading ? "Updating..." : "Update Blog"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
