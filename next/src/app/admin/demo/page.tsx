"use client";

import React, { useState } from "react";
import {
  Search,
  Users,
  Star,
  Activity,
  Database,
  LogOut,
  Check,
  X,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";

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

interface Team {
  id: string;
  name: string;
}

interface FeaturedContent {
  id: string;
  name: string;
  type: string;
  isHighlight: boolean;
}

interface Resource {
  id: string;
  name: string;
  type: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: EUserRole[];
  designation: EUserDesignation;
  teamId: string;
}

const MOCK_TEAMS: Team[] = [
  { id: "t1", name: "Engineering" },
  { id: "t2", name: "Design" },
  { id: "t3", name: "Marketing" },
];

const MOCK_RESOURCES: Resource[] = [
  { id: "r1", name: "Getting Started Guide", type: "blog" },
  { id: "r2", name: "Advanced React Patterns", type: "blog" },
  { id: "r3", name: "Introduction to TypeScript", type: "video" },
  { id: "r4", name: "Building REST APIs", type: "video" },
  { id: "r5", name: "Space Shooter Pro", type: "game" },
  { id: "r6", name: "Puzzle Master", type: "game" },
];

const MOCK_FEATURED_CONTENT: FeaturedContent[] = [
  { id: "f1", name: "Getting Started Guide", type: "blog", isHighlight: true },
  {
    id: "f2",
    name: "Introduction to TypeScript",
    type: "video",
    isHighlight: false,
  },
  { id: "f3", name: "Space Shooter Pro", type: "game", isHighlight: true },
];

const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "John Smith",
    email: "john.smith@example.com",
    roles: [EUserRole.MEMBER],
    designation: EUserDesignation.SENIOR,
    teamId: "t1",
  },
  {
    id: "u2",
    name: "Sarah Cronnor",
    email: "sarah.connor@example.com",
    roles: [EUserRole.GUEST, EUserRole.MEMBER],
    designation: EUserDesignation.EXECUTIVE,
    teamId: "t2",
  },
];

const MOCK_CURRENT_USER: User = {
  id: "u0",
  name: "Admin User",
  email: "admin@example.com",
  roles: [EUserRole.ADMIN],
  designation: EUserDesignation.HEAD,
  teamId: "t1",
};

const MOCK_SERVER_HEALTH = {
  status: "healthy",
  dbConnection: "connected",
  apiLatency: "45ms",
};

type Section = "account" | "users" | "featured" | "health" | "cache";

interface StatusMessageProps {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  message,
  onClose,
}) => {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  const Icon = type === "success" ? Check : AlertCircle;

  return (
    <div
      className={`${styles[type]} backdrop-blur-sm border rounded-2xl p-4 mb-6 flex items-start justify-between shadow-lg transition-all duration-300 animate-in slide-in-from-top-2`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<Section>("account");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userFormData, setUserFormData] = useState({
    roles: [] as EUserRole[],
    designation: EUserDesignation.NONE,
    teamId: "",
  });

  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>(
    MOCK_FEATURED_CONTENT
  );
  const [newFeatureForm, setNewFeatureForm] = useState({
    type: "",
    resourceId: "",
    isHighlight: false,
  });

  const showStatusMessage = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (user) {
        setSearchedUser(user);
        setUserFormData({
          roles: user.roles.filter(
            (r) => r === EUserRole.GUEST || r === EUserRole.MEMBER
          ),
          designation: user.designation,
          teamId: user.teamId,
        });
        showStatusMessage("success", "User found successfully");
      } else {
        setSearchedUser(null);
        showStatusMessage("error", "User not found");
      }
      setIsSearching(false);
    }, 800);
  };

  const handleUpdateUser = () => {
    setTimeout(() => {
      showStatusMessage("success", "User updated successfully");
    }, 800);
  };

  const handleCancelSearch = () => {
    setSearchQuery("");
    setSearchedUser(null);
    setUserFormData({
      roles: [],
      designation: EUserDesignation.NONE,
      teamId: "",
    });
  };

  const handleToggleHighlight = (id: string) => {
    setTimeout(() => {
      setFeaturedContent((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isHighlight: !item.isHighlight } : item
        )
      );
      showStatusMessage("success", "Feature highlight toggled");
    }, 800);
  };

  const handleDeleteFeature = (id: string) => {
    setTimeout(() => {
      setFeaturedContent((prev) => prev.filter((item) => item.id !== id));
      showStatusMessage("success", "Featured content deleted");
    }, 800);
  };

  const handleAddFeature = () => {
    if (!newFeatureForm.type || !newFeatureForm.resourceId) {
      showStatusMessage("error", "Please select both type and resource");
      return;
    }

    setTimeout(() => {
      const resource = MOCK_RESOURCES.find(
        (r) => r.id === newFeatureForm.resourceId
      );
      if (resource) {
        const newFeature: FeaturedContent = {
          id: `f${Date.now()}`,
          name: resource.name,
          type: resource.type,
          isHighlight: newFeatureForm.isHighlight,
        };
        setFeaturedContent((prev) => [...prev, newFeature]);
        setNewFeatureForm({ type: "", resourceId: "", isHighlight: false });
        showStatusMessage("success", "Featured content added");
      }
    }, 800);
  };

  const handleRoleToggle = (role: EUserRole) => {
    setUserFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const filteredResources = MOCK_RESOURCES.filter(
    (r) => r.type === newFeatureForm.type
  );

  const navItems = [
    { id: "account" as Section, label: "My Account", icon: Users },
    { id: "users" as Section, label: "User Management", icon: Search },
    { id: "featured" as Section, label: "Featured Content", icon: Star },
    { id: "health" as Section, label: "Server Health", icon: Activity },
    { id: "cache" as Section, label: "Cache Management", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100">
      <div className="flex">
        <aside className="w-72 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">Management Console</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                      : "hover:bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all duration-200 group">
              <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8 lg:p-12">
            {statusMessage && (
              <StatusMessage
                type={statusMessage.type}
                message={statusMessage.message}
                onClose={() => setStatusMessage(null)}
              />
            )}

            {activeSection === "account" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    My Account
                  </h2>
                  <p className="text-slate-400">
                    Manage your personal information and preferences
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/30">
                      {MOCK_CURRENT_USER.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {MOCK_CURRENT_USER.name}
                      </h3>
                      <p className="text-slate-400">
                        {MOCK_CURRENT_USER.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Role
                      </label>
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/10">
                        {MOCK_CURRENT_USER.roles[0]}
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Designation
                      </label>
                      <p className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {MOCK_CURRENT_USER.designation}
                      </p>
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Team
                      </label>
                      <p className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {
                          MOCK_TEAMS.find(
                            (t) => t.id === MOCK_CURRENT_USER.teamId
                          )?.name
                        }
                      </p>
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        User ID
                      </label>
                      <p className="text-sm font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {MOCK_CURRENT_USER.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "users" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    User Management
                  </h2>
                  <p className="text-slate-400">
                    Search and manage user accounts
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl mb-6">
                  <label className="block text-sm font-semibold text-slate-400 mb-3">
                    Search Users
                  </label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Enter name or email"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-cyan-500/25 transform hover:scale-105 active:scale-100"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>

                {searchedUser && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <Users className="w-6 h-6 mr-3 text-cyan-400" />
                        User Information
                      </h3>

                      <div className="flex items-start space-x-6 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                          {searchedUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-1">
                            {searchedUser.name}
                          </h4>
                          <p className="text-slate-400">{searchedUser.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Current Roles
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {searchedUser.roles.map((role) => (
                              <span
                                key={role}
                                className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold rounded-lg"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Designation
                          </label>
                          <p className="text-lg font-semibold text-white">
                            {searchedUser.designation}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Team
                          </label>
                          <p className="text-lg font-semibold text-white">
                            {
                              MOCK_TEAMS.find(
                                (t) => t.id === searchedUser.teamId
                              )?.name
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
                      <h3 className="text-2xl font-bold text-white mb-6">
                        Update User
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-400 mb-3">
                            Roles
                          </label>
                          <div className="space-y-3">
                            {[EUserRole.GUEST, EUserRole.MEMBER].map((role) => (
                              <label
                                key={role}
                                className="flex items-center space-x-3 cursor-pointer group"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={userFormData.roles.includes(role)}
                                    onChange={() => handleRoleToggle(role)}
                                    className="peer w-5 h-5 rounded-lg bg-slate-950/50 border-2 border-white/10 appearance-none checked:bg-gradient-to-br checked:from-cyan-500 checked:to-blue-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                                  />
                                  <Check className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
                                  {role}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-400 mb-3">
                            Designation
                          </label>
                          <select
                            value={userFormData.designation}
                            onChange={(e) =>
                              setUserFormData({
                                ...userFormData,
                                designation: e.target.value as EUserDesignation,
                              })
                            }
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          >
                            {Object.values(EUserDesignation).map((des) => (
                              <option
                                key={des}
                                value={des}
                                className="bg-slate-900"
                              >
                                {des}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-400 mb-3">
                            Team
                          </label>
                          <select
                            value={userFormData.teamId}
                            onChange={(e) =>
                              setUserFormData({
                                ...userFormData,
                                teamId: e.target.value,
                              })
                            }
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          >
                            <option value="" className="bg-slate-900">
                              Select a team
                            </option>
                            {MOCK_TEAMS.map((team) => (
                              <option
                                key={team.id}
                                value={team.id}
                                className="bg-slate-900"
                              >
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={handleUpdateUser}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:scale-105 active:scale-100"
                          >
                            Update User
                          </button>
                          <button
                            onClick={handleCancelSearch}
                            className="flex-1 px-6 py-4 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-2xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-100"
                          >
                            Cancel Search
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "featured" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Featured Content
                  </h2>
                  <p className="text-slate-400">
                    Manage highlighted content across the platform
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-yellow-400" />
                    Add Featured Content
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-3">
                        Content Type
                      </label>
                      <select
                        value={newFeatureForm.type}
                        onChange={(e) =>
                          setNewFeatureForm({
                            ...newFeatureForm,
                            type: e.target.value,
                            resourceId: "",
                          })
                        }
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      >
                        <option value="" className="bg-slate-900">
                          Select content type
                        </option>
                        <option value="blog" className="bg-slate-900">
                          Blog
                        </option>
                        <option value="video" className="bg-slate-900">
                          Video
                        </option>
                        <option value="game" className="bg-slate-900">
                          Game
                        </option>
                      </select>
                    </div>

                    {newFeatureForm.type && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-semibold text-slate-400 mb-3">
                          Select Resource
                        </label>
                        <select
                          value={newFeatureForm.resourceId}
                          onChange={(e) =>
                            setNewFeatureForm({
                              ...newFeatureForm,
                              resourceId: e.target.value,
                            })
                          }
                          className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        >
                          <option value="" className="bg-slate-900">
                            Select resource
                          </option>
                          {filteredResources.map((resource) => (
                            <option
                              key={resource.id}
                              value={resource.id}
                              className="bg-slate-900"
                            >
                              {resource.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={newFeatureForm.isHighlight}
                            onChange={(e) =>
                              setNewFeatureForm({
                                ...newFeatureForm,
                                isHighlight: e.target.checked,
                              })
                            }
                            className="peer w-5 h-5 rounded-lg bg-slate-950/50 border-2 border-white/10 appearance-none checked:bg-gradient-to-br checked:from-yellow-500 checked:to-orange-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-pointer"
                          />
                          <Check className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
                          Mark as Highlight
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={handleAddFeature}
                      className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-100"
                    >
                      Add to Featured
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Current Featured Content
                  </h3>
                  {featuredContent.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl hover:border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-xl font-bold text-white">
                              {item.name}
                            </h4>
                            {item.isHighlight && (
                              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-yellow-500/30">
                                <Sparkles className="w-3 h-3 mr-1" />
                                HIGHLIGHT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
                              {item.type}
                            </span>
                            <span className="font-mono text-xs">{item.id}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleHighlight(item.id)}
                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                          >
                            Toggle Highlight
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(item.id)}
                            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "health" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Server Health
                  </h2>
                  <p className="text-slate-400">
                    Monitor system performance and status
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-emerald-500/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Activity className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"></div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      System Status
                    </h3>
                    <p className="text-4xl font-bold text-emerald-400 capitalize">
                      {MOCK_SERVER_HEALTH.status}
                    </p>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-blue-500/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Database className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50 animate-pulse"></div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Database
                    </h3>
                    <p className="text-4xl font-bold text-blue-400 capitalize">
                      {MOCK_SERVER_HEALTH.dbConnection}
                    </p>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-cyan-500/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Activity className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      API Latency
                    </h3>
                    <p className="text-4xl font-bold text-cyan-400">
                      {MOCK_SERVER_HEALTH.apiLatency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "cache" && (
              <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-16 shadow-2xl text-center max-w-lg">
                  <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                    <Database className="w-10 h-10 text-slate-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Cache Management
                  </h2>
                  <p className="text-slate-400 text-lg">
                    This feature is not yet implemented.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
