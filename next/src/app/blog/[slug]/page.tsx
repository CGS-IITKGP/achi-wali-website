export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import "../lib/mdx.css";
import { remark } from "remark";
import Link from "next/link";
import api from "@/app/axiosApi";
import { IBlog } from "@/app/types/domain.types";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import { prettyDate } from "@/app/utils/pretty";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

const fetchBlog = async (slug: string): Promise<IBlog> => {
  const apiResponse = await api("GET", `/blog/view/${slug}`);

  if (apiResponse.action === null || apiResponse.action === false) {
    notFound();
  } else {
    const content = (apiResponse.data as IBlog).content;
    const processedContent = await remark()
      .use(remarkRehype)
      .use(rehypePrettyCode, {
        theme: "github-dark",
        keepBackground: false,
      })
      .use(rehypeStringify)
      .process(content);

    const html = processedContent.toString();
    return {
      ...(apiResponse.data as IBlog),
      content: html,
    };
  }
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const blog = await fetchBlog((await params).slug);

  if (!blog) return notFound();

  return (
    <main className="min-h-screen bg-black">
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link
                href="/blog"
                className="text-pink-400 hover:text-pink-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="text-gray-400 text-sm font-medium">CGS Blog</div>
            </div>

            {/* Many options in the nav bar */}
            {/* <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-pink-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-pink-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-pink-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-pink-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div> */}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            {blog.title}
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed font-light">
            {"Exploring the latest in technology and innovation"}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4 py-6 border-t border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {blog.author.name
                    .split(" ")
                    .map((token) => token[0])
                    .join(".")}
                  .
                </span>
              </div>
              <div>
                <div className="text-white font-medium">{blog.author.name}</div>
                <div className="text-gray-400 text-sm flex items-center space-x-4">
                  <span>{prettyDate(blog.createdAt)}</span>
                  {/* <span>·</span>
                  <span>5 min read</span>
                  <span>·</span>
                  <button className="text-pink-400 hover:text-pink-300 transition-colors">
                    Follow
                  </button> */}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Like Button */}
              {/* <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button> */}
              {/* Comment Button */}
              {/* <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button> */}
              {/* Save Blog Button */}
              {/* <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button> */}
              <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
              {/* More options button */}
              {/* <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button> */}
            </div>
          </div>
        </header>

        <article
          className="prose prose-xl prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <footer className="mt-16 pt-8 border-t border-gray-800">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Upvotes, Comments and Shares Section */}
          {/* <div className="flex items-center justify-between py-6 border-t border-b border-gray-800">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors group">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  124
                </span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-800 transition-colors group">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  12
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-pink-400 transition-all duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div> */}

          {/* Follow CGS banner */}
          {/* <div className="mt-8 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">CGS</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Computer Graphics Society
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  We are a passionate community of developers, designers, and
                  innovators exploring the frontiers of computer graphics and
                  interactive technology.
                </p>
                <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition-colors">
                  Follow
                </button>
              </div>
            </div>
          </div> */}
        </footer>
      </div>

      {/* Social Share Buttons / Left Bar */}
      {/* <div className="fixed left-4 top-1/2 transform -translate-y-1/2 hidden lg:flex flex-col space-y-4 z-40">
        <button className="p-3 rounded-full bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-gray-400 hover:text-pink-400 transition-all duration-200 shadow-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
            />
          </svg>
        </button>
        <div className="text-xs text-gray-500 text-center">124</div>
        <button className="p-3 rounded-full bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-gray-400 hover:text-pink-400 transition-all duration-200 shadow-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        <div className="text-xs text-gray-500 text-center">12</div>
      </div> */}
    </main>
  );
}
