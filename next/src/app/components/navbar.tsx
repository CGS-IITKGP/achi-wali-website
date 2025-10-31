"use client";

import Image from "next/image";
import Logo from "../assets/logo.png";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Games", href: "/games" },
    { name: "Projects", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Team", href: "/team" },
    { name: "Sign In", href: "/auth/sign-in" },
    // { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="z-50">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full px-2 xs:px-4 lg:px-8 py-2 xs:py-3 lg:py-4 flex items-center justify-between z-999 transition-all duration-500 ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl shadow-2xl border-b border-pink-500/20"
            : "bg-transparent"
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative pl-2"
        >
          <Link href="/">
            <Image
              src={Logo}
              alt="Computer Graphics Society Logo"
              width={56}
              height={56}
              className={
                isMenuOpen
                  ? "hidden w-10 h-10 lg:w-14 lg:h-14 drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300"
                  : " w-10 h-10 lg:w-14 lg:h-14 drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300"
              }
            />
          </Link>
        </motion.div>{" "}
        <div className="hidden lg:flex flex-row items-center gap-8 bg-gray-900/30 backdrop-blur-2xl px-8 py-4 rounded-2xl shadow-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <Link
                href={item.href}
                className="font-bold text-white hover:text-pink-300 duration-300 transition-all relative overflow-hidden py-2 px-1"
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 group-hover:w-full transition-all duration-300"></div>
                <div className="absolute inset-0 bg-pink-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="https://github.com/CGS-IITKGP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black px-4 py-2 rounded-full hover:from-pink-600 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 border border-gray-700 hover:border-pink-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="white"
                viewBox="0 0 24 24"
                className="transition-transform duration-300 group-hover:rotate-12"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.804 5.624-5.476 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span className="text-white font-semibold">GitHub</span>
            </Link>
          </motion.div>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={toggleMenu}
          className="lg:hidden relative z-60 p-2 rounded-xl bg-gray-900/50 backdrop-blur-lg border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 group"
          aria-label="Toggle navigation menu"
        >
          <div className="flex flex-col items-center justify-center w-6 h-6 space-y-1">
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-6 h-0.5 bg-white group-hover:bg-pink-300 transition-colors duration-300 origin-center"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="block w-6 h-0.5 bg-white group-hover:bg-pink-300 transition-colors duration-300"
            />
            <motion.span
              animate={
                isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.3 }}
              className="block w-6 h-0.5 bg-white group-hover:bg-pink-300 transition-colors duration-300 origin-center"
            />
          </div>
        </motion.button>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleMenu}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="fixed top-0 left-0 w-[280px] xs:w-80 h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 z-50 lg:hidden shadow-2xl border-r border-pink-500/30"
            >
              <div className="flex items-center justify-between p-4 xs:p-6 border-b border-pink-500/20">
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="relative min-w-[32px] xs:min-w-[40px]">
                    <Image
                      src={Logo}
                      alt="CGS Logo"
                      width={40}
                      height={40}
                      className="w-8 h-8 xs:w-10 xs:h-10 drop-shadow-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-white font-bold text-base xs:text-lg truncate">
                      CGS
                    </h2>
                    <p className="text-pink-300 text-xs xs:text-sm truncate">
                      Graphics Society
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-6 xs:py-8 px-4 xs:px-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    className="mb-2"
                  >
                    <Link
                      href={item.href}
                      onClick={toggleMenu}
                      className="block w-full p-3 xs:p-4 rounded-xl text-white font-semibold text-base xs:text-lg hover:bg-pink-500/20 hover:text-pink-300 transition-all duration-300 border border-transparent hover:border-pink-500/30 group"
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <motion.svg
                          className="w-5 h-5 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          whileHover={{ x: 5 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="mt-8 pt-6 border-t border-pink-500/20"
                >
                  <Link
                    href="https://github.com/CGS-IITKGP"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={toggleMenu}
                    className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 rounded-xl bg-gradient-to-r from-gray-800 to-black hover:from-pink-600 hover:to-pink-500 transition-all duration-300 border border-gray-700 hover:border-pink-400 shadow-lg hover:shadow-pink-500/25"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.804 5.624-5.476 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    <div>
                      <span className="text-white font-semibold block text-sm xs:text-base">
                        GitHub
                      </span>
                      <span className="text-gray-300 text-xs xs:text-sm">
                        View our repositories
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-center py-4 border-t border-pink-500/20">
                  <p className="text-gray-400 text-sm">
                    © 2025 Computer Graphics Society
                  </p>
                  <div className="flex justify-center gap-4 mt-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
