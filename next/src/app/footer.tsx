"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import CGSLogo from "./assets/logo.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 text-gray-100 pb-8 px-8 overflow-hidden font-sans">
      {/* Blurry animated background elements */}
      <div className="absolute w-[300px] h-[300px] -top-[100px] -left-[100px] rounded-full opacity-20 z-0 bg-gradient-to-br from-pink-400 to-pink-600 blur-[70px] animate-footer-float-1"></div>
      <div className="absolute w-[400px] h-[400px] -bottom-[200px] -right-[100px] rounded-full opacity-20 z-0 bg-gradient-to-br from-pink-300 to-pink-500 blur-[70px] animate-footer-float-2"></div>
      <div className="absolute w-[250px] h-[250px] top-[30%] left-[20%] rounded-full opacity-20 z-0 bg-gradient-to-br from-pink-400 to-pink-600 blur-[70px] animate-footer-float-3"></div>
      <div className="absolute w-[200px] h-[200px] bottom-[20%] right-[30%] rounded-full opacity-20 z-0 bg-gradient-to-br from-pink-500 to-pink-400 blur-[70px] animate-footer-float-4"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between  border-b border-pink-300/30 pb-8"></div>

        <div className="flex flex-wrap justify-center gap-4 items-center pt-6">
          <div className=" min-w-[50px] lg:mr-20">
            <Image src={CGSLogo} alt="logo" width={50} height={50} />
          </div>
          <Link
            href="mailto:cgsiitkgp@gmail.com"
            className=" text-md mr-10 transition-all duration-300 flex items-center justify-center text-[#ffffffdd] hover:text-pink-300 hover:-translate-y-1 hover:scale-110 hover:shadow-pink-300/30"
          >
            cgsiitkgp@gmail.com
          </Link>

          <div className="mr-4 text-sm text-gray-300/70">
            <span>© {year} Computer Graphics Society</span>
          </div>

          <div className="flex gap-5">
            <Link
              href="https://github.com/CGS-IITKGP"
              className="text-gray-300/70 text-2xl transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:text-gray-900 hover:bg-pink-300 hover:-translate-y-1 hover:scale-110 hover:shadow-lg hover:shadow-pink-300/30"
            >
              <FaGithub />
            </Link>
            <Link
              href="https://www.linkedin.com/company/computer-graphics-lab/"
              className="text-gray-300/70 text-2xl transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:text-gray-900 hover:bg-pink-300 hover:-translate-y-1 hover:scale-110 hover:shadow-lg hover:shadow-pink-300/30"
            >
              <FaLinkedin />
            </Link>
            <Link
              href="https://youtube.com/@cgs_iitkgp"
              className="text-gray-300/70 text-2xl transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:text-gray-900 hover:bg-pink-300 hover:-translate-y-1 hover:scale-110 hover:shadow-lg hover:shadow-pink-300/30"
            >
              <FaYoutube />
            </Link>
            <Link
              href="https://instagram.com/cgs_iitkgp"
              className="text-gray-300/70 text-2xl transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:text-gray-900 hover:bg-pink-300 hover:-translate-y-1 hover:scale-110 hover:shadow-lg hover:shadow-pink-300/30"
            >
              <FaInstagram />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
