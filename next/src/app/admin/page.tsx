"use client";

import { Activity, ChevronRight, Edit2, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EFeaturedType,
  EProjectPortfolio,
  EUserDesignation,
  EUserRole,
  IContentAsList,
  IFeaturedContentAsList,
  IPaginatedUsers,
  ITeamsAsList,
} from "../types/domain.types";
import api from "../axiosApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import { prettyHighestRole } from "../utils/pretty";
import { designationStyles, roleStyles } from "../utils/styes";

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

  const [isUpdateUserFormOpen, setIsUpdateUserFormOpen] =
    useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<
    IPaginatedUsers["users"][number] | null
  >(null);
  const [updateUserForm, setUpdateUserForm] = useState<{
    roles: EUserRole[];
    designation: EUserDesignation;
    teamId: string | null;
  }>({
    roles: [],
    designation: EUserDesignation.NONE,
    teamId: null,
  });

  const [allContent, setAllContent] = useState<IContentAsList[]>([]);
  const [filteredAllContent, setFilteredAllContent] = useState<
    IContentAsList[]
  >([]);
  const [featuredContent, setFeaturedContent] = useState<
    IFeaturedContentAsList[]
  >([]);

  const [allTeams, setAllTeams] = useState<ITeamsAsList[]>([]);

  const [pagination, setPagination] = useState<{
    page: number;
    limit: 10;
  }>({
    page: 1,
    limit: 10,
  });
  const [paginatedUsers, setPaginatedUsers] = useState<IPaginatedUsers>({
    users: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const { refreshUser } = useAuth();
  const router = useRouter();

  const openUpdateUserModal = (user: IPaginatedUsers["users"][number]) => {
    setEditingUser(user);
    setUpdateUserForm({
      teamId: user.teamId,
      designation: user.designation,
      roles: user.roles,
    });
    setIsUpdateUserFormOpen(true);
  };

  const closeUpdateUserModal = () => {
    setIsUpdateUserFormOpen(false);
    setEditingUser(null);
  };

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

  const handleUserUpdate = async () => {
    if (!editingUser) {
      toast.error("Error: No user selected for update.");
      return;
    }

    let teamUpdateRequired = false;
    let assignmentUpdateRequired = false;

    const originalRoles = editingUser.roles;
    const currentRoles = updateUserForm.roles;

    if (updateUserForm.teamId !== editingUser.teamId) {
      teamUpdateRequired = true;
    }

    const rolesChanged =
      currentRoles.length !== originalRoles.length ||
      currentRoles.some((role) => !originalRoles.includes(role)) ||
      originalRoles.some((role) => !currentRoles.includes(role));

    if (
      updateUserForm.designation !== editingUser.designation ||
      rolesChanged
    ) {
      assignmentUpdateRequired = true;
    }

    if (!teamUpdateRequired && !assignmentUpdateRequired) {
      toast.success("No changes detected. Nothing to save.");
      closeUpdateUserModal();
      return;
    }

    let overallSuccess = true;

    if (teamUpdateRequired) {
      const teamResponse = await api("PATCH", "/user/team", {
        body: {
          _id: editingUser._id,
          teamId: updateUserForm.teamId,
        },
      });

      if (teamResponse.action === null) {
        toast.error("Server Error: Team Update Failed");
        overallSuccess = false;
      } else if (teamResponse.action === false) {
        toast.error(`${teamResponse.statusCode}: ${teamResponse.message}`);
        overallSuccess = false;
      }
    }

    if (!overallSuccess) return;

    if (assignmentUpdateRequired) {
      const assignmentUpdates: {
        roles?: EUserRole[];
        designation?: EUserDesignation;
      } = {};

      if (rolesChanged) {
        assignmentUpdates.roles = currentRoles;
      }

      if (updateUserForm.designation !== editingUser.designation) {
        assignmentUpdates.designation = updateUserForm.designation;
      }

      const assignResponse = await api("PATCH", "/user/assign", {
        body: {
          _id: editingUser._id,
          ...assignmentUpdates,
        },
      });

      if (assignResponse.action === null) {
        toast.error("Server Error: Assignment Update Failed");
        overallSuccess = false;
      } else if (assignResponse.action === false) {
        toast.error(`${assignResponse.statusCode}: ${assignResponse.message}`);
        overallSuccess = false;
      }
    }

    if (overallSuccess) {
      toast.success("User updated successfully!");
      closeUpdateUserModal();
      setUsers();
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

  const fetchAllTeams = async (): Promise<ITeamsAsList[]> => {
    const apiResponse = await api("GET", `/team`, {
      query: {
        target: "all_as_list",
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      return apiResponse.data as ITeamsAsList[];
    }

    return [];
  };

  const fetchPaginatedUsers = async (): Promise<IPaginatedUsers> => {
    const apiResponse = await api("GET", `/user`, {
      query: {
        target: "all",
        page: pagination.page,
        limit: pagination.limit,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      return apiResponse.data as IPaginatedUsers;
    }

    return {
      users: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
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

  const setTeam = async () => {
    const teams = await fetchAllTeams();
    setAllTeams(teams);
  };

  const setUsers = async () => {
    const paginatedUsers = await fetchPaginatedUsers();
    setPaginatedUsers(paginatedUsers);
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId || allTeams.length === 0) {
      return "None";
    }

    return allTeams.find((t) => t._id === teamId)?.name ?? "Loading...";
  };

  useEffect(() => {
    if (newFeatureForm.contentType) {
      setFilteredAllContent(
        allContent.filter(
          (content) => content.contentType === newFeatureForm.contentType
        )
      );
    }
  }, [newFeatureForm.contentType, allContent]);

  useEffect(() => {
    setUsers();
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    setTeam();
    setFeatured();
    setContent();
    setUsers();
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
                value={newFeatureForm.contentId}
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
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">User Management</h1>
          <p className="text-slate-400">Manage all users from one place.</p>
        </div>
        {paginatedUsers.users.length > 0 ? (
          <div className="mt-8">
            <div className="space-y-4">
              {paginatedUsers.users.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl overflow-hidden hover:border-white/20"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-full text-left">
                    <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4">
                            <span className="text-slate-500 font-semibold w-8">
                              {(paginatedUsers.page - 1) *
                                paginatedUsers.limit +
                                paginatedUsers.users.indexOf(user) +
                                1}
                              .
                            </span>
                            <div className="flex-1">
                              <div className="flex gap-4 items-center">
                                <p className="text-lg font-semibold text-white truncate">
                                  {user.name}
                                </p>
                                <p className="px-2 py-0.5 text-sm font-medium text-cyan-600 border border-cyan-600 rounded-md">
                                  {getTeamName(user.teamId)}
                                </p>
                              </div>
                              <p className="text-sm text-slate-400 truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="flex gap-3 items-center">
                              <p
                                className={`text-sm font-semibold ${
                                  designationStyles[user.designation]
                                }`}
                              >
                                {!user.roles.includes(EUserRole.ROOT) &&
                                !user.roles.includes(EUserRole.ADMIN) &&
                                user.roles.includes(EUserRole.MEMBER)
                                  ? user.designation
                                  : null}
                              </p>
                              <p
                                className={`px-3 py-1 text-xs font-semibold rounded-md border ${
                                  roleStyles[prettyHighestRole(user.roles)]
                                }`}
                              >
                                {prettyHighestRole(user.roles)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        className="ml-4 p-2 text-slate-400 hover:text-white hover:cursor-pointer"
                        onClick={() => openUpdateUserModal(user)}
                      >
                        <Edit2 className="w-3 h-3 text-slate-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center">
              <div className="flex gap-3">
                <button
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                {Array.from(
                  { length: paginatedUsers.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      pagination.page === page
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={pagination.page === paginatedUsers.totalPages}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="text-center text-sm text-slate-500 mt-6">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                paginatedUsers.total
              )}{" "}
              of {paginatedUsers.total} users
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-slate-400">No user{"(s)"} found.</p>
          </div>
        )}
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
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100">
        <div className="flex h-full">
          <div className="w-72 h-full bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
            <div className="p-8 border-b border-white/5 flex gap-2">
              <img src="/logo.png" className="w-12 h-12" />
              <div>
                <p className="text-xl font-bold">Admin Panel</p>
                <p className="text-slate-400 text-xs">
                  Integrated Management Console
                </p>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-5 overflow-y-auto">
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

      {isUpdateUserFormOpen && editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserUpdate();
              }}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  Edit User: {editingUser.name}
                </h2>
                <button
                  type="button"
                  onClick={closeUpdateUserModal}
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

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm text-slate-400 font-medium mb-2">
                    Team
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 transition-all duration-300"
                    value={updateUserForm.teamId || ""}
                    onChange={(e) =>
                      setUpdateUserForm((prev) => ({
                        ...prev,
                        teamId: e.target.value || null,
                      }))
                    }
                  >
                    <option value="">No team</option>
                    {allTeams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 font-medium mb-2">
                    Designation
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-400 transition-all duration-300"
                    value={updateUserForm.designation}
                    onChange={(e) =>
                      setUpdateUserForm((prev) => ({
                        ...prev,
                        designation: e.target.value as EUserDesignation,
                      }))
                    }
                  >
                    {Object.values(EUserDesignation).map((des) => (
                      <option key={des} value={des}>
                        {des}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 font-medium mb-2">
                    Roles
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {Array.from(
                      new Set([...editingUser.roles, EUserRole.MEMBER])
                    ).map((role) => {
                      const isEditable = role === EUserRole.MEMBER;
                      const isSelected = isEditable
                        ? updateUserForm.roles.includes(role)
                        : editingUser.roles.includes(role);

                      const handleClick = () => {
                        if (!isEditable) return;

                        const roles = isSelected
                          ? updateUserForm.roles.filter((r) => r !== role)
                          : [...updateUserForm.roles, role];

                        setUpdateUserForm((prev) => ({
                          ...prev,
                          roles: Array.from(new Set(roles)),
                        }));
                      };

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={handleClick}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            isSelected
                              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 text-white"
                              : "bg-white/20 text-white"
                          } ${
                            !isEditable
                              ? "opacity-50 cursor-default"
                              : "hover:cursor-pointer"
                          }`}
                          disabled={!isEditable}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 p-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeUpdateUserModal}
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r  from-pink-500 via-purple-500 to-purple-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
