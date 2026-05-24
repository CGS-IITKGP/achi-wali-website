export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import "../lib/mdx.css";
import { remark } from "remark";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/axiosApi";
import { IBlog } from "@/app/types/domain.types";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import { prettyDate } from "@/app/utils/pretty";
import ShareButton from "../components/ShareButton";
import Footer from "@/app/footer";

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

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const slug = (await props.params).slug;
  const blog = await fetchBlog(slug);

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight tracking-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4 py-6 border-t border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <Image
                src={blog.author.profileImgUrl || "/default-fallback-image.png"}
                alt="Profile Image"
                className="w-10 h-10 object-cover rounded-full border-2 border-pink-500/20"
                width={40}
                height={40}
              />
              <div>
                <div className="text-white font-medium">{blog.author.name}</div>
                <div className="text-gray-400 text-sm flex items-center space-x-4">
                  <span>{prettyDate(blog.createdAt)}</span>
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
              <ShareButton title={blog.title} slug={slug} />
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
          className="prose prose-xl prose-invert max-w-none mdx-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="py-6 border-t border-gray-800 flex flex-wrap gap-2">
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

      <Footer />
    </main>
  );
}
