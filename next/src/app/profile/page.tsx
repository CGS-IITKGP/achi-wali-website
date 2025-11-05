"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Globe,
  Sparkles,
  Code2,
  Rocket,
  Instagram,
} from "lucide-react";
import Footer from "../footer";

type LinkItem = {
  id: string;
  text: string;
  url: string;
  icon: typeof Github | typeof Linkedin | typeof Instagram | typeof Globe; // to be handled on the frontend
};

type ProjectItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  featured: boolean;
};

type BlogPost = {
  id: string;
  title: string;
  content: string;
  date: string;
};

type profile = {
  name: string;
  designation: string;
  email: string;
  memberSince: string;
};

const Index = () => {
  const profile: profile = {
    name: "Alex Rivera",
    designation: "Head of Graphics",
    email: "alex@example.com",
    memberSince: "January 2024",
  };

  const links: LinkItem[] = [
    { id: "1", text: "Portfolio", url: "https://alexrivera.dev", icon: Globe },
    {
      id: "2",
      text: "GitHub",
      url: "https://github.com/alexrivera",
      icon: Github,
    },
    {
      id: "3",
      text: "LinkedIn",
      url: "https://linkedin.com/in/alexrivera",
      icon: Linkedin,
    },
    {
      id: "4",
      text: "Instagram",
      url: "https://instagram.com/alexrivera",
      icon: Instagram,
    },
  ];

  const projects: ProjectItem[] = [
    {
      id: "1",
      title: "Portfolio CMS",
      description:
        "A headless CMS built with React and Node.js for managing portfolio content dynamically.",
      tags: ["React", "Node.js", "MongoDB"],
      link: "#",
      featured: true,
    },
    {
      id: "2",
      title: "AI Chat Interface",
      description:
        "Modern chat interface with AI integration, featuring real-time responses and sleek animations.",
      tags: ["TypeScript", "OpenAI", "Tailwind"],
      link: "#",
      featured: true,
    },
    {
      id: "3",
      title: "E-commerce Dashboard",
      description:
        "Analytics dashboard for e-commerce platforms with data visualization and reporting.",
      tags: ["React", "D3.js", "PostgreSQL"],
      link: "#",
      featured: false,
    },
  ];

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "Building Scalable React Applications",
      content:
        "Best practices and patterns for creating maintainable React apps that scale.",
      date: "Nov 2, 2025",
    },
    {
      id: "2",
      title: "The Art of Modern CSS",
      content:
        "Exploring advanced CSS techniques including Grid, Flexbox, and custom properties.",
      date: "Oct 28, 2025",
    },
    {
      id: "3",
      title: "TypeScript Tips for Better Code",
      content:
        "Level up your TypeScript skills with these practical tips and tricks.",
      date: "Oct 15, 2025",
    },
    {
      id: "4",
      title: "Deploying with Docker",
      content:
        "A comprehensive guide to containerizing and deploying modern web applications.",
      date: "Oct 3, 2025",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-black text-foreground"
      initial={{ opacity: 0, y: 40, backgroundColor: "rgba(0,0,0,0)" }}
      animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,1)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Hero & Info Section */}
      <header className="relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/15 to-fuchsia-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(320_70%_60%_/_0.15),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(270_60%_60%_/_0.15),transparent_50%)]" />

        <div className="container relative mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Profile Hero */}
              <div className="text-center lg:text-left">
                <div className="mb-8 inline-block opacity-100">
                  <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-fuchsia-700 p-1 shadow-2xl">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-6xl sm:text-7xl font-bold text-white">
                      AR
                    </div>
                  </div>
                </div>

                <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {profile.name}
                </h1>

                <p className="mb-6 text-xl sm:text-2xl font-semibold text-muted-foreground">
                  {profile.designation}
                </p>

                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-pink-600/90 px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-pink-700 hover:shadow-pink-800 hover:scale-105 active:scale-95"
                >
                  <Mail className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Get in Touch
                </a>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-300/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-700/20">
                  <Calendar className="h-5 w-5 text-pink-300 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Member Since
                    </p>
                    <p className="font-semibold text-foreground">
                      {profile.memberSince}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-pink-300/20 bg-black/20">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    About Profile
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      This is a public profile view. You are seeing information
                      curated by the owner for visitors.
                    </p>
                    <p>
                      The person behind this profile invites you to explore
                      projects, blog posts, and social links.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-pink-300/20 bg-black/20">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    Links
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {links.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:border-pink-500/60 hover:bg-pink-50/10 hover:shadow-lg hover:shadow-pink-600/20 hover:-translate-y-1 active:translate-y-0 text-foreground"
                          style={{ animationDelay: `${800 + index * 100}ms` }}
                        >
                          <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          {link.text}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Projects Section */}
      <section className="container mx-auto px-4 sm:px-6 pb-4 sm:pb-6 pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-bold flex items-center justify-center gap-3 text-foreground">
              <Code2 className="h-8 w-8 sm:h-10 sm:w-10 text-pink-400" />
              Featured Projects
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Showcasing my recent work in graphics, game dev, and web
              development
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-pink-400/60 hover:shadow-xl hover:shadow-pink-700/20 hover:-translate-y-2 active:translate-y-0"
                style={{ animationDelay: `${1300 + index * 100}ms` }}
              >
                {project.featured && (
                  <div className="absolute right-4 top-4 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/0 via-transparent to-purple-600/0 opacity-0 transition-opacity duration-300 group-hover:from-pink-600/10 group-hover:to-purple-600/10 group-hover:opacity-100" />

                <div className="relative">
                  <h3 className="mb-2 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-pink-300">
                    {project.title}
                  </h3>
                  <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                    {project.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-lg border border-pink-300/40 bg-pink-50/10 px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-300 hover:bg-pink-100/20 hover:shadow-inner hover:shadow-pink-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={project.link}
                    className="inline-flex items-center gap-2 font-medium text-pink-400 transition-all duration-300 hover:text-purple-300"
                  >
                    View Project
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:rotate-45" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className=" bg-gradient-to-br from-black via-[#120012] to-[#1a001a] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-bold flex items-center justify-center gap-3 text-foreground">
              <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-pink-400" />
              Latest Posts by the Author
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Thoughts on development, design, and technology
            </p>
          </div>

          <div className="space-y-6 mt-6">
            {blogPosts.map((post, index) => (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-pink-500/60 hover:shadow-xl hover:shadow-pink-700/20 hover:-translate-y-1 active:translate-y-0"
                style={{ animationDelay: `${1700 + index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/0 via-transparent to-purple-600/0 opacity-0 transition-opacity duration-300 group-hover:from-pink-600/5 group-hover:to-purple-600/5 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-3 flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                    <time
                      dateTime={post.date}
                      className="transition-colors group-hover:text-pink-300"
                    >
                      {post.date}
                    </time>
                  </div>

                  <h3 className="mb-2 text-xl sm:text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-pink-300">
                    {post.title}
                  </h3>

                  <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                    {post.content}
                  </p>

                  <a
                    href="#"
                    className="inline-flex items-center gap-2 font-medium text-pink-400 transition-all duration-300 hover:text-purple-300"
                  >
                    Read More
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:rotate-45" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </motion.div>
  );
};

export default Index;
