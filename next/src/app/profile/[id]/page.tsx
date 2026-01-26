"use client";

import { useEffect, useState } from "react";
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
// ... (skip type definition if unchanged)

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch User
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

                // Fetch Projects (ALL and filter)
                const projectRes = await api("GET", "/project", {
                    query: {
                        target: APIControl.Project.Get.Target.ALL,
                        portfolio: APIControl.Project.Get.Portfolio.ANY
                    }
                });

                if (projectRes.action === true) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const allProjects = projectRes.data as any[];
                    // Filter by author._id
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const userProjects = allProjects.filter((p) => p.author._id === id || p.collaborators.some((c: any) => c._id === id));
                    setProjects(userProjects);
                }

                // Fetch Blogs (ALL and filter)
                const blogRes = await api("GET", "/blog", {
                    query: {
                        target: APIControl.Blog.Get.Target.ALL
                    }
                });

                if (blogRes.action === true) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const allBlogs = blogRes.data as any[];
                    // Filter by author._id
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
            className="min-h-screen bg-black text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Dynamic Hero Section */}
            <Navbar />
            <header className="relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm pt-32 pb-16">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/15 to-fuchsia-600/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(320_70%_60%_/_0.15),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(270_60%_60%_/_0.15),transparent_50%)]" />

                {/* Animated blurred blobs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen"
                />
                <motion.div
                    animate={{
                        x: [0, -70, 0],
                        y: [0, 100, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[90px] pointer-events-none mix-blend-screen"
                />

                <div className="container relative mx-auto px-4 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Column - User Info */}
                            <div className="text-center lg:text-left">
                                <div className="mb-8 inline-block">
                                    <div className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-fuchsia-700 p-1.5 shadow-2xl">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-black overflow-hidden relative">
                                            {user.profileImgMediaKey && !imgError ? (
                                                <Image
                                                    src={user.profileImgMediaKey}
                                                    alt={user.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={() => setImgError(true)}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-5xl font-bold text-white/50 select-none uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {user.roles.includes(EUserRole.ADMIN) && (
                                            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full border-4 border-black shadow-lg" title="Admin">
                                                <Shield className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h1 className="mb-2 text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                                    {user.name}
                                </h1>

                                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-500/10 text-pink-300 border border-pink-500/20">
                                        {user.designation !== "NONE" ? user.designation : "Member"}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                        {user.team.name}
                                    </span>
                                </div>

                                <a
                                    href={`mailto:${user.email}`}
                                    className="group inline-flex items-center gap-2 rounded-full bg-pink-600/90 px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-pink-700 hover:shadow-pink-800 hover:scale-105 active:scale-95"
                                >
                                    <Mail className="h-4 w-4 transition-transform group-hover:rotate-12" />
                                    Get in Touch
                                </a>
                            </div>

                            {/* Right Column - Stats & Links */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/10 backdrop-blur-md">
                                    <Calendar className="h-6 w-6 text-pink-300" />
                                    <div>
                                        <p className="text-sm text-pink-200/60 font-medium tracking-wide">
                                            Member Since
                                        </p>
                                        <p className="text-lg font-bold text-white">
                                            {user.memberSince}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-400" />
                                        Social Links
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {user.links.length > 0 ? user.links.map((link, index) => {
                                            const Icon = getIconForLink(link.text);
                                            return (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10"
                                                >
                                                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                                    {link.text}
                                                </a>
                                            );
                                        }) : (
                                            <p className="text-gray-500 text-sm italic">No links added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Projects Section */}
            {projects.length > 0 && (
                <section className="container mx-auto px-4 sm:px-6 py-16">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            <Code2 className="w-8 h-8 text-pink-400" />
                            Featured Projects
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/30 p-5 hover:border-pink-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-pink-900/20"
                            >
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">{project.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.map((tag: string) => (
                                        <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/5">{tag}</span>
                                    ))}
                                </div>
                                {/* We assume project.links exists or similar */}
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Blog Section */}
            {blogs.length > 0 && (
                <section className="bg-gradient-to-b from-transparent to-purple-900/20 py-16">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                <Rocket className="w-8 h-8 text-purple-400" />
                                Latest Posts
                            </h2>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog, index) => (
                                <motion.article
                                    key={blog._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/30 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 flex flex-col"
                                >
                                    {blog.coverImgMediaKey && (
                                        <div className="relative h-48 w-full overflow-hidden shrink-0">
                                            <Image
                                                src={prettySafeImage(blog.coverImgMediaKey)}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{blog.title}</h3>
                                        <div className="mt-auto">
                                            <a href={`/blog/${blog.slug}`} className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1">
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

            {/* Footer */}
            <Footer />
        </motion.div>
    );
};

export default UserProfile;
