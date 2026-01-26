"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Linkedin, Twitter, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
    title: string;
    slug: string;
}

const ShareButton = ({ title, slug }: ShareButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getShareUrl = () => {
        // In production, use the actual domain. Fallback to location.origin for dev/client-side.
        if (typeof window !== "undefined") {
            return `${window.location.origin}/blog/${slug}`;
        }
        return "";
    };

    const handleCopyLink = async () => {
        const url = getShareUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    const handleTwitterShare = () => {
        const url = getShareUrl();
        const text = `Check out "${title}" on CGS!`;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                text
            )}&url=${encodeURIComponent(url)}`,
            "_blank"
        );
        setIsOpen(false);
    };

    const handleLinkedInShare = () => {
        const url = getShareUrl();
        const text = `${title}\n${url}`;
        window.open(
            `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
                text
            )}`,
            "_blank"
        );
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full hover:bg-gray-800 transition-all duration-200 ${isOpen ? "text-pink-400 bg-gray-800" : "text-gray-400"
                    } hover:text-pink-400`}
                aria-label="Share article"
            >
                <Share2 className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 bottom-full mb-3 min-w-[160px] bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl overflow-hidden z-50 p-1.5"
                    >
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>

                            <button
                                onClick={handleTwitterShare}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
                            >
                                <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                Twitter
                            </button>

                            <button
                                onClick={handleLinkedInShare}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
                            >
                                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                LinkedIn
                            </button>
                        </div>

                        {/* Arrow pointer */}
                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-gray-900 border-b border-r border-gray-700/50 rotate-45 transform" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareButton;
