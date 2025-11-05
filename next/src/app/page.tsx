export const dynamic = "force-dynamic";

import { Righteous, Roboto } from "next/font/google";

import Navbar from "./components/navbar";
import FeaturedContent from "./featuredprojects";
import Footer from "./footer";
import HeroCard from "./components/HeroCard"
import api from "./axiosApi";
import { IRecentFeaturedContent } from "./types/domain.types";

// import LandingVideoMP4 from "./landingvideo.mp4";

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
});

const fetchRecentFeatured = async () => {
  const apiResponse = await api("GET", "/featured", {
    query: {
      target: "highlight",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IRecentFeaturedContent[];
  } else if (apiResponse.action === null) {
    console.log(
      "Internal Server Error while fetching featured graphics projects."
    );
  } else if (apiResponse.action === false) {
    console.error(
      "API response error while fetching featured graphics projects.",
      apiResponse
    );
  }
  return [];
};

export default async function Home() {
  const recentFeatured = await fetchRecentFeatured();

  return (
    <div className="bg-gradient-to-tr from-neutral-900 to-gray-950">
      {/* <div className="w-full h-screen grid grid-cols-2 text-white">
        <div className="w-full h-full grid grid-rows-3">
          <div className="grid grid-cols-2">
            <div className="grid grid-rows-2">
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
            </div>
            <div className="flex p-4 gap-4">
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid grid-rows-2">
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
            </div>
            <div className="flex p-4 gap-4">
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid grid-rows-2">
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
            </div>
            <div className="flex p-4 gap-4">
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
            </div>
          </div>
        </div>
        <div className="w-full h-full grid grid-rows-3">
          <div className="grid grid-cols-2">
            <div className="grid grid-rows-2">
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
            </div>
            <div className="flex p-4 gap-4">
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid grid-rows-2">
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
            </div>
            <div className="flex p-4 gap-4">
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid grid-rows-2">
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
              <div className="flex p-4 gap-4">
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
                <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              </div>
            </div>
            <div className="flex p-4 gap-4">
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
              <div className="w-full h-full bg-pink-100/10 border-2 border-pink-400/40 hover:bg-pink-300/50 transition-all duration-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div> */}
      <section className="h-screen w-full flex flex-col justify-center items-center z-10 relative px-4 sm:px-6 md:px-8">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          >
            <source src="/landingvideo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <Navbar />
        <h1
          className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl fade-in max-w-6xl text-center ${heading_font.className} bg-gradient-to-tr from-white to-pink-600 bg-clip-text text-transparent z-10 leading-tight mb-25 sm:mb-20 md:mb-6`}
        >
          Computer Graphics Society
        </h1>

        <p
          className={`text-gray-400 px-4 sm:px-6 md:px-8 lg:px-0 fade-in-2 text-base sm:text-lg md:text-xl lg:text-2xl max-w-4xl text-center font-bold mb-10 sm:mb-0 mt-4 sm:mt-6 md:mt-8 ${paragraph_font.className} z-10 leading-relaxed`}
        >
          We, the Computer Graphics Society at IIT Kharagpur, are a passionate
          group of students dedicated to exploring the world of game development
          using Unity and Unreal engines.
        </p>

        <p className="text-gray-500 relative top-16 sm:top-24 md:top-32 z-10">
          <span className="inline-flex flex-col items-center animate-bounce">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-pink-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span className=" mb-0 mt-6 lg:mt-0 lg:mb-12 text-pink-400 font-semibold text-sm sm:text-base">
              Scroll Down
            </span>
          </span>
        </p>
      </section>
      <HeroCard/>
      <FeaturedContent featured={recentFeatured} />
      {/* <FeaturedProjects2 /> */}

      <Footer />
    </div>
  );
}
