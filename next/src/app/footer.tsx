"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import CGSLogo from "./assets/logo.png";
import { motion } from "framer-motion";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-black text-gray-200 py-12 px-8 font-sans overflow-hidden border-t border-pink-500/20 backdrop-blur-xl">
      {/* Subtle glowing orbs like navbar’s tone */}
      <div className="absolute w-[300px] h-[300px] -top-[100px] -left-[100px] rounded-full opacity-10 z-0 bg-gradient-to-br from-pink-400 to-pink-600 blur-[90px]" />
      <div className="absolute w-[300px] h-[300px] bottom-[0px] -right-[100px] rounded-full opacity-10 z-0 bg-gradient-to-br from-pink-300 to-pink-500 blur-[90px]" />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <Image
              src={CGSLogo}
              alt="CGS Logo"
              width={60}
              height={60}
              className="rounded-full drop-shadow-lg hover:drop-shadow-pink-500/40 transition-all duration-300"
            />
            <span className="text-xl font-bold text-white">
              Computer Graphics Society
            </span>
          </div>

          <p className="text-gray-400/90 text-sm md:text-base tracking-wide">
            Creative minds at IIT Kharagpur — blending art and technology.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © {year} Computer Graphics Society
          </p>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16 text-sm"
        >
          <div className="flex flex-col gap-2">
            <Link href="/" className="hover:text-pink-400 transition-colors">
              Home
            </Link>
            <Link href="/games" className="hover:text-pink-400 transition-colors">
              Games
            </Link>
            <Link href="/projects" className="hover:text-pink-400 transition-colors">
              Projects
            </Link>
            <Link href="/blog" className="hover:text-pink-400 transition-colors">
              Blog
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/team" className="hover:text-pink-400 transition-colors">
              Team
            </Link>
            <Link href="/auth/sign-in" className="hover:text-pink-400 transition-colors">
              Sign In
            </Link>
            <Link href="/contact" className="hover:text-pink-400 transition-colors">
              Contact
            </Link>
            <Link href="#" className="hover:text-pink-400 transition-colors">
              Terms
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-gray-400/70 text-sm mb-1">Follow Us</p>
            <div className="flex gap-4">
              {[
                { icon: <FaGithub />, href: "https://github.com/CGS-IITKGP" },
                {
                  icon: <FaLinkedin />,
                  href: "https://www.linkedin.com/company/computer-graphics-lab/",
                },
                { icon: <FaYoutube />, href: "https://youtube.com/@cgs_iitkgp" },
                { icon: <FaInstagram />, href: "https://instagram.com/cgs_iitkgp" },
              ].map(({ icon, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-900 hover:bg-pink-400 transition-all duration-300 flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:-translate-y-1 hover:scale-110 border border-pink-500/20 hover:border-pink-400 shadow-sm"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
