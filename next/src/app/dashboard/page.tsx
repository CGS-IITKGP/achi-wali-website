"use client";

import { useState } from "react";
import { Righteous, Roboto } from "next/font/google";
import api from "../axiosApi";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
});

type ActiveSection = "blog" | "projects" | "profile" | "assets" | "settings";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "Unity",
  });
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
    technology: "Unity",
    type: "Game",
    repository: "",
    status: "Planning",
  });

  const menuItems = [
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

  const handleNewPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New post data:", newPostData);
    // Here you would typically send the data to your API
    setShowNewPostModal(false);
    setNewPostData({ title: "", content: "", tags: "", category: "Unity" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New project data:", newProjectData);
    // Here you would typically send the data to your API
    setShowNewProjectModal(false);
    setNewProjectData({
      name: "",
      description: "",
      technology: "Unity",
      type: "Game",
      repository: "",
      status: "Planning",
    });
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
      router.push("/auth/sign-in");
    }
  };

  const handleProjectInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-2xl text-white ${heading_font.className}`}>
                  {user?.name ?? "Loading..."}
                </h2>
                <p className={`text-gray-400 ${paragraph_font.className}`}>
                  Game Developer
                </p>
                <p
                  className={`text-gray-500 text-sm ${paragraph_font.className}`}
                >
                  Member since {user?.createdAt.getFullYear() ?? "Loading..."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h3
                  className={`text-lg text-white mb-4 ${heading_font.className}`}
                >
                  Personal Information
                </h3>
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
                      12
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
                      8
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
                      45
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
              {[1, 2, 3].map((post) => (
                <div
                  key={post}
                  className="glass rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3
                        className={`text-lg text-white mb-2 group-hover:text-pink-400 transition-colors ${heading_font.className}`}
                      >
                        Understanding Game Physics in Unity {post}
                      </h3>
                      <p
                        className={`text-gray-400 mb-3 ${paragraph_font.className}`}
                      >
                        A comprehensive guide to implementing realistic physics
                        in your Unity games...
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Published: Oct {post}, 2025</span>
                        <span>Views: {200 * post}</span>
                        <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded">
                          Unity
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
              {[1, 2, 3, 4, 5, 6].map((project) => (
                <div
                  key={project}
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
                  <h3
                    className={`text-lg text-white mb-2 group-hover:text-pink-400 transition-colors ${heading_font.className}`}
                  >
                    Project Alpha {project}
                  </h3>
                  <p
                    className={`text-gray-400 text-sm mb-3 ${paragraph_font.className}`}
                  >
                    A cutting-edge game built with Unity and modern graphics
                    techniques.
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded ${paragraph_font.className}`}
                    >
                      Active
                    </span>
                    <span
                      className={`text-gray-500 text-sm ${paragraph_font.className}`}
                    >
                      {project * 2} days ago
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
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform duration-200">
                Upload Asset
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((asset) => (
                <div
                  key={asset}
                  className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="w-full h-20 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg mb-3 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400 group-hover:text-pink-400 transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <p
                    className={`text-white text-sm text-center truncate ${paragraph_font.className}`}
                  >
                    asset_{asset}.png
                  </p>
                  <p
                    className={`text-gray-500 text-xs text-center ${paragraph_font.className}`}
                  >
                    {Math.floor(Math.random() * 500 + 100)}KB
                  </p>
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
                      className={`block text-gray-400 text-sm mb-2 ${paragraph_font.className}`}
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-pink-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-gray-400 text-sm mb-2 ${paragraph_font.className}`}
                    >
                      Bio
                    </label>
                    <textarea
                      defaultValue="Game developer passionate about creating immersive experiences."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-pink-400 focus:outline-none transition-colors h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
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
              </div>

              <div className="glass rounded-xl p-6">
                <h3
                  className={`text-lg text-white mb-4 ${heading_font.className}`}
                >
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
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
                  JD
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

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-colors"
              />
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
          {/* Top Bar */}
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
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-400 hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                </button>
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>

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

              {/* Category Field */}
              <div>
                <label
                  className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={newPostData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                >
                  <option value="Unity">Unity</option>
                  <option value="Unreal Engine">Unreal Engine</option>
                  <option value="Game Design">Game Design</option>
                  <option value="Programming">Programming</option>
                  <option value="Art & Animation">Art & Animation</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="News">News</option>
                </select>
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
                  type="button"
                  className="px-6 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  Save Draft
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

              {/* Project Type and Technology Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Type Field */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Project Type
                  </label>
                  <select
                    name="type"
                    value={newProjectData.type}
                    onChange={handleProjectInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  >
                    <option value="Game">Game</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Tool/Utility">Tool/Utility</option>
                    <option value="Library/Framework">Library/Framework</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Technology Field */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Primary Technology
                  </label>
                  <select
                    name="technology"
                    value={newProjectData.technology}
                    onChange={handleProjectInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  >
                    <option value="Unity">Unity</option>
                    <option value="Unreal Engine">Unreal Engine</option>
                    <option value="React">React</option>
                    <option value="Next.js">Next.js</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="C#">C#</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Godot">Godot</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Status and Repository Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Field */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={newProjectData.status}
                    onChange={handleProjectInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Development">In Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Repository Field */}
                <div>
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Repository URL{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="repository"
                    value={newProjectData.repository}
                    onChange={handleProjectInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300"
                    placeholder="https://github.com/username/project-name"
                  />
                </div>
              </div>

              {/* Description Field */}
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
                  type="button"
                  className="px-6 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  Save Draft
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
    </div>
  );
}
