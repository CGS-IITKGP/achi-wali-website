"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Righteous } from "next/font/google";
import { IBlogOfList } from "@/app/types/index.types";
import {
  prettyDate,
  prettySafeImage,
  prettyShortName,
} from "@/app/utils/pretty";

const righteousFont = Righteous({ weight: "400", subsets: ["latin"] });

interface BlogListProps {
  posts: IBlogOfList[];
}

export default function BlogList({ posts }: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlogs = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl mx-auto mb-16"
      >
        <div className="bg-gray-900/50 mt-8 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2
                className={`text-3xl md:text-4xl font-bold text-white mb-2 ${righteousFont.className}`}
              >
                All Articles
              </h2>
              <p className="text-gray-400">
                {filteredBlogs.length} article
                {filteredBlogs.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, index) => (
              <motion.article
                key={blog.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/blog/${blog.slug}`}>
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden hover:border-pink-500/50 transition-all duration-500 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={prettySafeImage(blog.coverImgMediaKey)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-pink-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                          {"Blog"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors duration-300 line-clamp-2">
                        {blog.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span suppressHydrationWarning={true}>
                              {prettyDate(blog.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>5 min</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-md font-semibold">
                              {prettyShortName(blog.author.name)}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {blog.author.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-4 group-hover:text-pink-400 transition-colors duration-300">
                        <span className="text-sm font-medium">Read More</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search terms or category filter.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-pink-500/20"
          >
            <h3
              className={`text-3xl md:text-4xl font-bold text-white mb-4 ${righteousFont.className}`}
            >
              Stay Updated
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get the latest articles and insights delivered straight to your
              inbox. No spam, just quality content about computer graphics, game
              and web development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 px-6 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
