"use client";

import { Activity, ChevronRight, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EFeaturedType,
  EProjectPortfolio,
  IContentAsList,
  IFeaturedContentAsList,
} from "../types/domain.types";
import api from "../axiosApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

type ActiveSectionId = "user_management" | "featured_content" | "server_health";

const navBarItems: {
  id: ActiveSectionId;
  label: string;
  icon: typeof LogOut;
}[] = [
  {
    id: "server_health",
    label: "Server Health",
    icon: Activity,
  },
  {
    id: "featured_content",
    label: "Featured Content",
    icon: Star,
  },
  {
    id: "user_management",
    label: "User Management",
    icon: Activity,
  },
];

const AdminPanel = () => {
  const [activeSectionId, setActiveSectionId] =
    useState<ActiveSectionId>("server_health");

  const [newFeatureForm, setNewFeatureForm] = useState<{
    contentType: EFeaturedType | "";
    contentId: string;
    isHighlight: boolean;
  }>({
    contentType: "",
    contentId: "",
    isHighlight: false,
  });

  const [allContent, setAllContent] = useState<IContentAsList[]>([]);
  const [filteredAllContent, setFilteredAllContent] = useState<
    IContentAsList[]
  >([]);
  const [featuredContent, setFeaturedContent] = useState<
    IFeaturedContentAsList[]
  >([]);

  const { refreshUser } = useAuth();
  const router = useRouter();

  const handleAddFeature = async () => {
    const apiResponse = await api("POST", "/featured", {
      body: {
        contentType: newFeatureForm.contentType,
        contentId: newFeatureForm.contentId,
        isHighlight: newFeatureForm.isHighlight,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      toast.success("Added a new featured item.");
      setFeatured();
    }
  };

  const handleDeleteFeature = async (id: string) => {
    const apiResponse = await api("DELETE", `/featured/${id}`);

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      toast.success("Deleted the featured item.");
      setFeatured();
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
      router.push("/auth/sign-in");
    }
  };

  const fetchFeaturedContentsAsList = async () => {
    const apiResponse = await api("GET", `/featured`, {
      query: {
        target: "all_as_list",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      return apiResponse.data as IFeaturedContentAsList[];
    }

    return [];
  };

  const fetchAllBlogsAsList = async (): Promise<IContentAsList[]> => {
    const apiResponse = await api("GET", `/blog`, {
      query: {
        target: "all_as_list",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      return (apiResponse.data as { _id: string; title: string }[]).map(
        (content) => {
          return {
            _id: content._id,
            contentType: "BLOG",
            contentTitle: content.title,
          };
        }
      );
    }

    return [];
  };

  const fetchAllProjectsAsList = async (): Promise<IContentAsList[]> => {
    const apiResponse = await api("GET", `/project`, {
      query: {
        target: "all_as_list",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      return (
        apiResponse.data as {
          _id: string;
          portfolio: EProjectPortfolio;
          title: string;
        }[]
      ).map((content) => {
        return {
          _id: content._id,
          contentType: content.portfolio,
          contentTitle: content.title,
        };
      });
    }

    return [];
  };

  const setFeatured = async () => {
    const data = await fetchFeaturedContentsAsList();
    setFeaturedContent(data);
  };

  const setContent = async () => {
    const [projects, blogs] = await Promise.all([
      fetchAllProjectsAsList(),
      fetchAllBlogsAsList(),
    ]);

    setAllContent([...projects, ...blogs]);
  };

  useEffect(() => {
    if (newFeatureForm.contentType) {
      setFilteredAllContent(
        allContent.filter(
          (content) => content.contentType === newFeatureForm.contentType
        )
      );
    }
  }, [newFeatureForm.contentType]);

  useEffect(() => {
    setFeatured();
    setContent();
  }, []);

  const renderServerHealthSection = () => {
    return (
      <>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Server Health</h1>
          <p className="text-slate-400">
            Monitor system performance and status
          </p>
        </div>

        <div className="mt-8 w-75 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600">
          <div className="rounded-3xl bg-slate-900/90 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>

              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600"></div>
            </div>

            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Check system status
            </h3>
            <Link
              href={"/api/misc/health"}
              target="_blank"
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 bg-clip-text text-transparent font-medium"
            >
              Click Here
            </Link>
          </div>
        </div>
      </>
    );
  };

  const renderFeaturedContentSection = () => {
    return (
      <>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Featured Contents</h1>
          <p className="text-slate-400">Manage featured contents</p>
        </div>

        <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-6 space-y-6 mt-8">
          <h3 className="text-xl font-semibold text-white">
            Add Featured Content
          </h3>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Content Type
            </label>
            <select
              value={newFeatureForm.contentType}
              onChange={(e) =>
                setNewFeatureForm({
                  ...newFeatureForm,
                  contentType: e.target.value as EFeaturedType,
                  contentId: "",
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
            >
              <option value="">Select type</option>
              {Object.values(EFeaturedType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {newFeatureForm.contentType && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Select Resource
              </label>
              <select
                value={newFeatureForm.contentType}
                onChange={(e) =>
                  setNewFeatureForm({
                    ...newFeatureForm,
                    contentId: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                <option value="">Select resource</option>
                {filteredAllContent.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.contentTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newFeatureForm.isHighlight}
              onChange={(e) =>
                setNewFeatureForm({
                  ...newFeatureForm,
                  isHighlight: e.target.checked,
                })
              }
              className="w-4 h-4 accent-yellow-400 cursor-pointer"
            />
            <span className="text-slate-300">Mark as Highlight</span>
          </label>

          <button
            onClick={handleAddFeature}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white font-medium py-3 rounded-lg"
          >
            Add to Featured
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Current Featured Content
          </h3>

          <div className="space-y-3">
            {featuredContent.length === 0 ? (
              <p className="text-slate-500 text-sm">No featured content yet.</p>
            ) : (
              featuredContent.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-4"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="text-slate-400 text-sm">
                        {item.contentType}
                      </p>
                      {item.isHighlight && (
                        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-xs text-white px-2 py-1 rounded-md flex items-center">
                          Highlight
                        </span>
                      )}
                    </div>
                    <h4 className="text-white text-xl font-semibold">
                      {item.contentTitle}
                    </h4>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteFeature(item._id)}
                      className="text-rose-400 border border-rose-400/30 px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  const renderUserManagementSection = () => {
    return (
      <>
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-center mt-10">
            <span className="text-fuchsia-700">Will be available after</span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-pulse">
              1st November, 2025,
              <br />
              02:00 AM
            </span>
          </h1>
        </div>
      </>
    );
  };

  const renderSelectedSection = () => {
    switch (activeSectionId) {
      case "server_health":
        return renderServerHealthSection();
      case "featured_content":
        return renderFeaturedContentSection();
      case "user_management":
        return renderUserManagementSection();
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100">
        <div className="flex">
          <div className="w-72 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
            <div className="p-8 border-b border-white/5 flex gap-2">
              <img src="/logo.png" className="w-12 h-12" />
              <div>
                <p className="text-xl font-bold">Admin Panel</p>
                <p className="text-slate-400 text-xs">
                  Integrated Management Console
                </p>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-5">
              {navBarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSectionId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSectionId(item.id)}
                    className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-lg shadow-fuchsia-300/20"
                        : "hover:bg-white/5 text-slate-400 hover:text-white hover:cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-5 h-5 ${isActive ? "scale-110" : ""}`}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/5">
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-8 lg:p-12">
              {renderSelectedSection()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
