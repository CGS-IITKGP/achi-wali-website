import React from "react";
import {
  Star,
  Calendar,
  Clock,
  User,
  Eye,
  Heart,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../footer";
import BlogList from "./components/BlogList";
import { Righteous, Roboto } from "next/font/google";
import { getAllPosts } from "./lib/mdx";
import CGSLogo from "../assets/logo.png";

const righteousFont = Righteous({ weight: "400", subsets: ["latin"] });
const robotoFont = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const processPost = (post: any) => {
  return {
    slug: post.slug,
    title: post.title || "Untitled Post",
    description: post.description || post.excerpt || "No description available",
    date: post.date || new Date().toISOString().split("T")[0],
    readTime: post.readTime || "5 min read",
    author: post.author || "CGS",
    category: post.category || "Technology",
    tags: post.tags || ["Blog"],
    featured: post.featured || false,
    image: post.image || CGSLogo.src,
    likes: post.likes || Math.floor(Math.random() * 200) + 50,
    comments: post.comments || Math.floor(Math.random() * 50) + 5,
    views: post.views || Math.floor(Math.random() * 5000) + 500,
  };
};

export default async function Blog() {
  const rawPosts = getAllPosts();
  const posts = rawPosts.map(processPost);

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  const processedPosts = posts.map((post, index) => ({
    ...post,
    featured: index < 2,
  }));

  const featuredPosts = processedPosts.filter((post) => post.featured);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative pt-64 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1
              className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 ${righteousFont.className}`}
            >
              <span className="bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent">
                CGS Blog
              </span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed ${robotoFont.className}`}
            >
              Discover insights, tutorials, and stories from the world of
              computer graphics, web development and game development.
            </p>

            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {processedPosts.length}
                </div>
                <div className="text-sm text-gray-500">Articles</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">1k+</div>
                <div className="text-sm text-gray-500">Readers</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="py-16 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <Star className="w-6 h-6 text-pink-400" />
              <h2
                className={`text-3xl md:text-4xl font-bold text-white ${righteousFont.className}`}
              >
                Featured Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post, index) => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-pink-500/50 transition-all duration-500 h-full">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-pink-500 text-white text-sm font-medium rounded-full">
                            Featured
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors duration-300">
                          {post.title}
                        </h3>

                        <p className="text-gray-400 leading-relaxed mb-6">
                          {post.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span suppressHydrationWarning={true}>
                                {new Date(post.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {post.author
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {post.author}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end mt-6 group-hover:text-pink-400 transition-colors duration-300">
                          <span className="font-medium">Read Article</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogList posts={processedPosts} categories={categories} />

      <Footer />
    </main>
  );
}
