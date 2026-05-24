"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Mail,
    Calendar,
    Sparkles,
    ExternalLink,
    Code2,
    Rocket,
    Github,
    Linkedin,
    Globe,
    Instagram,
    Shield,
} from "lucide-react";
import Navbar from "../../components/navbar";
import Footer from "../../footer";
import api from "../../axiosApi";
import { APIControl } from "@/lib/types/api.types";
import { EUserRole } from "../../types/domain.types";
import { prettySafeImage } from "../../utils/pretty";
import Link from "next/link";

// Map link text to icons
const getIconForLink = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("github")) return Github;
    if (lower.includes("linkedin")) return Linkedin;
    if (lower.includes("instagram")) return Instagram;
    if (lower.includes("web") || lower.includes("portfolio")) return Globe;
    return ExternalLink;
};

// Consistent gradient palette based on name
const getAvatarGradient = (name: string) => {
    const gradients = [
        "from-pink-500 to-rose-600",
        "from-purple-500 to-violet-600",
        "from-indigo-500 to-blue-600",
        "from-cyan-500 to-teal-600",
        "from-emerald-500 to-green-600",
        "from-amber-500 to-orange-600",
        "from-pink-500 to-purple-600",
        "from-violet-500 to-indigo-600",
    ];
    const charCode = name.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
};

type PublicUser = {
    _id: string;
    name: string;
    email: string;
    profileImgMediaKey: string | null;
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
    designation: string;
    memberSince: string;
};

const UserProfile = () => {
    const params = useParams();
    const id = params.id as string;

    const [user, setUser] = useState<PublicUser | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [projects, setProjects] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    const avatarGradient = useMemo(() => getAvatarGradient(user?.name || "U"), [user?.name]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userRes = await api("GET", "/user", {
                    query: {
                        target: APIControl.User.Get.Target.PUBLIC_SINGLE,
                        id: id
                    }
                });

                if (userRes.action !== true) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setError(userRes.action === false ? (userRes as any).message : "Failed to load profile (Server Error)");
                    setLoading(false);
                    return;
                }
                setUser(userRes.data as PublicUser);

                const projectRes = await api("GET", "/project", {
                    query: {
                        target: APIControl.Project.Get.Target.ALL,
                        portfolio: APIControl.Project.Get.Portfolio.ANY
                    }
                });

                if (projectRes.action === true) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const allProjects = projectRes.data as any[];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const userProjects = allProjects.filter((p) => p.author._id === id || p.collaborators.some((c: any) => c._id === id));
                    setProjects(userProjects);
                }

                const blogRes = await api("GET", "/blog", {
                    query: {
                        target: APIControl.Blog.Get.Target.ALL
                    }
                });

                if (blogRes.action === true) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const allBlogs = blogRes.data as any[];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const userBlogs = allBlogs.filter((b) => b.author._id === id || b.collaborators.some((c: any) => c._id === id));
                    setBlogs(userBlogs);
                }

            } catch (err) {
                console.error(err);
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
                <p className="text-gray-400">{error || "User not found"}</p>
                <Link href="/profile" className="mt-6 text-pink-400 hover:text-pink-300 underline">Go to profiles</Link>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Navbar />

            {/* Fixed dark background gradient */}
            <div className="fixed inset-0 bg-black z-0" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(320_60%_15%_/_0.3),transparent_60%)] z-0" />

            {/* Hero Section */}
            <header className="relative z-10 pt-32 pb-20 overflow-hidden">
                {/* Subtle animated blobs */}
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 50, 0],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"
                />

                <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Column - User Info */}
                        <div className="text-center lg:text-left">
                            {/* Avatar */}
                            <div className="mb-8 inline-block">
                                <div className={`relative h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-gradient-to-br ${avatarGradient} p-[3px] shadow-2xl shadow-pink-500/20`}>
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-950 overflow-hidden relative">
                                        {user.profileImgMediaKey && !imgError ? (
                                            <Image
                                                src={user.profileImgMediaKey}
                                                alt={user.name}
                                                fill
                                                className="object-cover"
                                                onError={() => setImgError(true)}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatarGradient} text-5xl font-bold text-white select-none uppercase`}>
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {user.roles.includes(EUserRole.ADMIN) && (
                                        <div className="absolute bottom-1 right-1 bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full border-4 border-gray-950 shadow-lg" title="Admin">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <h1 className="mb-3 text-4xl sm:text-5xl font-bold text-white">
                                {user.name}
                            </h1>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                    {user.designation !== "NONE" ? user.designation : "Member"}
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    {user.team.name}
                                </span>
                            </div>

                            {/* CTA Button */}
                            <a
                                href={`mailto:${user.email}`}
                                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-pink-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-105 active:scale-95"
                            >
                                <Mail className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                                Get in Touch
                            </a>
                        </div>

                        {/* Right Column - Stats & Links */}
                        <div className="space-y-5">
                            {/* Member Since Card */}
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/10">
                                    <Calendar className="h-5 w-5 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-0.5">
                                        Member Since
                                    </p>
                                    <p className="text-lg font-semibold text-white">
                                        {user.memberSince}
                                    </p>
                                </div>
                            </div>

                            {/* Social Links Card */}
                            <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm">
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                    Social Links
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.links.length > 0 ? user.links.map((link, index) => {
                                        const Icon = getIconForLink(link.text);
                                        return (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex items-center gap-2 rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:bg-gray-800 hover:text-white hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5"
                                            >
                                                <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                                {link.text}
                                            </a>
                                        );
                                    }) : (
                                        <p className="text-gray-600 text-sm">No links added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Projects Section */}
            {projects.length > 0 && (
                <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 max-w-6xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                            <Code2 className="w-6 h-6 text-pink-400" />
                            Featured Projects
                        </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 p-5 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-pink-300 transition-colors">{project.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tags.slice(0, 4).map((tag: string) => (
                                        <span key={tag} className="text-xs px-2 py-1 rounded-md bg-gray-800/80 text-gray-400 border border-gray-700/50">{tag}</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Blog Section */}
            {blogs.length > 0 && (
                <section className="relative z-10 py-16">
                    <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                                <Rocket className="w-6 h-6 text-purple-400" />
                                Latest Posts
                            </h2>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog, index) => (
                                <motion.article
                                    key={blog._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 flex flex-col"
                                >
                                    {blog.coverImgMediaKey && (
                                        <div className="relative h-40 w-full overflow-hidden shrink-0">
                                            <Image
                                                src={prettySafeImage(blog.coverImgMediaKey)}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                                        </div>
                                    )}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">{blog.title}</h3>
                                        <div className="mt-auto">
                                            <a href={`/blog/${blog.slug}`} className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                                                Read Article <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </motion.div>
    );
};

export default UserProfile;
