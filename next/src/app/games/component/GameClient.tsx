"use client";

import Navbar from "../../components/navbar";
import { robotoFont, righteousFont } from "../../fonts";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Github,
  Gamepad2,
} from "lucide-react";
import { RxAvatar } from "react-icons/rx";
import { IProject } from "@/app/types/index.types";
import { prettySafeImage } from "@/app/utils/pretty";

interface GameClientProps {
  games?: IProject[];
  featuredGames?: IProject[];
}

export default function GameClient({
  games = [],
  featuredGames = [],
}: GameClientProps) {
  const [selectedGame, setSelectedGame] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setSelectedGame((prev) => (prev + 1) % featuredGames.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextGame = () => {
    setSelectedGame((prev) => (prev + 1) % featuredGames.length);
    setIsAutoPlaying(false);
  };

  const prevGame = () => {
    setSelectedGame(
      (prev) => (prev - 1 + featuredGames.length) % featuredGames.length
    );
    setIsAutoPlaying(false);
  };

  const selectGame = (index: number) => {
    setSelectedGame(index);
    setIsAutoPlaying(false);
  };

  const getSelectedGameLinkUrl = (linkText: string): string => {
    if (selectedGame >= 0 && selectedGame < featuredGames.length) {
      return (
        featuredGames[selectedGame].links.find((link) => {
          return link.text === linkText;
        })?.url ?? "#"
      );
    }
    return "#";
  };

  const currentGame = featuredGames[selectedGame] || {
    _id: "",
    title: "No Game Selected",
    description: "No game available at the moment.",
    coverImgMediaKey: "",
    tags: [],
    links: [],
  };

  // If no games are available, show a message
  if (!games.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-2">No Games Available</h2>
            <p>Please check back later for our game collection.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <Navbar />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-64 min-h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-4xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent ${righteousFont.className} mb-2`}
              >
                Game Gallery
              </h1>
              <p className={`text-gray-400 text-lg ${robotoFont.className}`}>
                Featured Games by CGS
              </p>
            </div>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 ${
                isAutoPlaying
                  ? "bg-pink-500/20 border-pink-500/50 text-pink-300"
                  : "bg-gray-800/50 border-gray-600/50 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAutoPlaying ? "bg-pink-400 animate-pulse" : "bg-gray-500"
                  }`}
                ></div>
                {isAutoPlaying ? "Auto-play ON" : "Auto-play OFF"}
              </div>
            </motion.button> */}
          </div>
        </motion.div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-3 relative group">
            <motion.div
              key={selectedGame}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-pink-500/20"
            >
              <Image
                src={prettySafeImage(currentGame.coverImgMediaKey || "")}
                alt={currentGame.title || "Game image"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t from-pink-600 via-rose-500 to-orange-400 opacity-20`}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <button
                onClick={prevGame}
                className="absolute left-4 top-1/2 transform -translate-y-[15vh] lg:-translate-y-1/2 z-50 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-pink-500/30 hover:border-pink-500/60"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextGame}
                className="absolute right-4 top-1/2 transform -translate-y-[15vh] lg:-translate-y-1/2 z-50 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-pink-500/30 hover:border-pink-500/60"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="space-y-4">
                  {/* <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 border border-pink-500/40 rounded-full text-pink-300 text-sm font-semibold backdrop-blur-sm"
                  >
                    {currentGame.icon}
                    {currentGame.category}
                  </motion.div> */}

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl ${righteousFont.className} leading-tight`}
                  >
                    {currentGame.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl ${robotoFont.className} line-clamp-3 sm:line-clamp-none`}
                  >
                    {currentGame.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-2"
                  >
                    {currentGame.tags?.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800/60 backdrop-blur-sm rounded-full text-gray-300 text-sm border border-gray-600/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-4 mt-6"
                  >
                    {getSelectedGameLinkUrl("live-demo") ? (
                      <a
                        href={getSelectedGameLinkUrl("live-demo")}
                        target="_blank"
                        rel="noopener noreferrer"
                        // Active Style (Original)
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-pink-500/25"
                      >
                        <Play className="w-5 h-5" />
                        Play Now
                      </a>
                    ) : (
                      // Disabled State
                      <span className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 text-gray-400 font-semibold rounded-xl cursor-not-allowed shadow-lg">
                        <Play className="w-5 h-5" />
                        Live Demo N/A
                      </span>
                    )}

                    {/* GitHub / View Code Link */}
                    {getSelectedGameLinkUrl("github") ? (
                      <a
                        href={getSelectedGameLinkUrl("github")}
                        target="_blank"
                        rel="noopener noreferrer"
                        // Active Style (Original)
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 border border-gray-600/40 hover:border-gray-500/60"
                      >
                        <Github className="w-5 h-5" />
                        View Code
                      </a>
                    ) : (
                      // Disabled State
                      <span className="flex items-center gap-2 px-6 py-3 bg-gray-800/30 text-gray-500 font-semibold rounded-xl cursor-not-allowed border border-gray-800">
                        <Github className="w-5 h-5" />
                        Code N/A
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {isAutoPlaying && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="w-full h-1 bg-gray-800/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-500 to-pink-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "linear" }}
                      key={selectedGame}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="flex lg:flex-col gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 px-2 -mx-2 snap-x snap-mandatory sm:snap-none">
              {featuredGames.map((game, index) => (
                <motion.div
                  key={game._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => selectGame(index)}
                  className={`relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-full lg:h-[120px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 snap-center ${
                    selectedGame === index
                      ? "border-pink-500 shadow-lg shadow-pink-500/25 scale-105"
                      : "border-gray-700/50 hover:border-pink-500/50 hover:scale-102"
                  }`}
                >
                  <Image
                    src={prettySafeImage(game.coverImgMediaKey)}
                    alt={game.title}
                    fill
                    className="object-cover transition-all duration-300"
                  />

                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      selectedGame === index
                        ? "bg-pink-500/20"
                        : "bg-black/40 hover:bg-black/20"
                    }`}
                  ></div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                    <div
                      className={`mb-1 transition-all duration-300 ${
                        selectedGame === index
                          ? "text-pink-300 scale-110"
                          : "text-white/80"
                      }`}
                    >
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold text-center leading-tight ${
                        selectedGame === index
                          ? "text-pink-300"
                          : "text-white/80"
                      }`}
                    >
                      {game.title}
                    </span>
                  </div>

                  {selectedGame === index && (
                    <motion.div
                      layoutId="activeGame"
                      className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-pink-400 rounded-2xl"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="hidden lg:block mt-8 p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                Gallery Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Games</span>
                  <span className="text-white font-semibold">
                    {projects.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current</span>
                  <span className="text-pink-300 font-semibold">
                    {selectedGame + 1}/{projects.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Auto-play</span>
                  <span
                    className={`font-semibold ${
                      isAutoPlaying ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {isAutoPlaying ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </motion.div> */}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-2 pb-8"
        >
          {featuredGames.map((_, index) => (
            <button
              key={index}
              onClick={() => selectGame(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                selectedGame === index
                  ? "bg-pink-500 scale-125"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </motion.div>
      </div>

      <div className="min-h-screen flex flex-col pt-24 px-4 lg:px-16 xl:px-32 2xl:px-64 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent ${righteousFont.className} mb-4`}
              >
                Complete Collection
              </h2>
              <p
                className={`text-gray-400 text-lg ${robotoFont.className} max-w-2xl`}
              >
                Explore the complete set of games designed and developed by
                members of CGS
              </p>
            </div>

            {/* <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/50">
              <button className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-xl font-semibold text-sm border border-pink-500/30 transition-all duration-300">
                Grid View
              </button>
              <button className="px-4 py-2 text-gray-400 hover:text-white rounded-xl font-semibold text-sm transition-all duration-300">
                List View
              </button>
            </div> */}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20">
          {games.map((game, index) => (
            <motion.div
              key={game._id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/30 hover:border-pink-500/40 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative h-48 lg:h-56 overflow-hidden">
                <Image
                  src={prettySafeImage(game.coverImgMediaKey || "")}
                  alt={game.title || "Game image"}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />{" "}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-pink-600 via-rose-500 to-orange-400 opacity-20 group-hover:opacity-30 transition-opacity duration-500`}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                {/* <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-pink-300 text-sm font-semibold border border-pink-500/30">
                    {game.icon}
                    {game.category}
                  </div>
                </div> */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex gap-3">
                    {game.links?.find((link) => link.text === "live-demo") && (
                      <motion.a
                        href={
                          game.links.find(
                            (link) => link.text === "live-demo"
                          )!.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()} // Prevents event bubbling
                        className="w-12 h-12 bg-pink-500/90 hover:bg-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                      >
                        <Play className="w-5 h-5" />
                      </motion.a>
                    )}
                  </div>
                </div>
                {/* <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-yellow-400 text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-white font-semibold">4.8</span>
                  </div>
                </div> */}
              </div>

              {/* `flex-1` pushes the footer (with the divider line) to the bottom. */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1 space-y-4">
                  <div>
                    {/* Fixed height for title (2 lines) */}
                    <h3
                      className={`text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300 ${righteousFont.className} h-16`}
                    >
                      {game.title}
                    </h3>

                    {/*
                    // =================================================================
                    // ⭐️ CHANGE 1: More space for description
                    //
                    // `h-24` (6rem) fits 4 lines of text.
                    // `line-clamp-4` cuts off anything after 4 lines.
                    // This is the compromise: more text, but still uniform.
                    // =================================================================
                    */}
                    <p
                      className={`text-gray-400 text-sm leading-relaxed ${robotoFont.className} line-clamp-4 h-24`}
                    >
                      {game.description}
                    </p>
                  </div>

                  {/*
                  // =================================================================
                  // ⭐️ CHANGE 2: Distance between tags and divider
                  //
                  // `mb-4` (1rem) adds the space you wanted.
                  // This section is now perfectly aligned on all cards.
                  // =================================================================
                  */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {game.tags?.slice(0, 2).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-full border border-gray-600/40 hover:border-pink-500/40 hover:text-pink-300 transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {(game.tags?.length ?? 0) > 2 && (
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/40">
                        +{(game.tags?.length ?? 0) - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* This footer is pushed to the bottom by `flex-1` above */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {/* <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>2 hrs ago</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>1.2k</span>
                    </div> */}
                    <div className="flex items-center gap-1">
                      <RxAvatar className="w-4 h-4" />
                      <span>{game.author?.name || "Anonymous"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {game.links?.find((link) => link.text === "github") && (
                      <motion.a
                        href={
                          game.links.find(
                            (link) => link.text === "github"
                          )!.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()} // Prevents event bubbling
                        className="w-8 h-8 bg-gray-800/60 hover:bg-pink-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-300 transition-all duration-300"
                      >
                        <Github className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {[
            { label: "Total Games", value: _Projects.length, icon: Gamepad },
            { label: "Downloads", value: "12.4k", icon: Download },
            { label: "Average Rating", value: "4.8", icon: Star },
            { label: "Active Players", value: "2.1k", icon: Award },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300 text-center group"
            >
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gray-40m-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </div>
  );
}