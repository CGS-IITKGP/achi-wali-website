import {
  Righteous,
  Roboto,
} from "next/font/google";

import Navbar from "./components/navbar";
import FeaturedProjects from "./featuredprojects";
import Footer from "./footer";

// import LandingVideoMP4 from "./landingvideo.mp4";

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
});

export default function Home() {
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
      <section className="h-screen w-full flex flex-col justify-center items-center z-10 relative">
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
          className={`text-6xl md:text-8xl lg:text-9xl fade-in max-w-6xl text-center ${heading_font.className} bg-gradient-to-tr from-white to-pink-600 bg-clip-text text-transparent z-10`}
        >
          Computer Graphics Society
        </h1>

        <p
          className={`text-gray-400 px-8 lg:px-0 fade-in-2 text-xl md:text-xl lg:text-2xl max-w-4xl text-center font-bold mt-8 ${paragraph_font.className} z-10`}
        >
          We, the Computer Graphics Society at IIT Kharagpur, are a passionate
          group of students dedicated to exploring the world of game development
          using Unity and Unreal engines.
        </p>

        <p className="text-gray-500 relative top-32 z-10">
          <span className="inline-flex flex-col items-center animate-bounce">
            <svg
              className="w-8 h-8 text-pink-400"
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
            <span className="mt-2 text-pink-400 font-semibold">
              Scroll Down
            </span>
          </span>
        </p>
      </section>

      <FeaturedProjects />
      {/* <FeaturedProjects2 /> */}

      <Footer />
    </div>
  );
}
