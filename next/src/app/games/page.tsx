export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Navbar from "../components/navbar";
import Footer from "../footer";
import GameClient from "./component/GameClient";
import { IProject } from "../types/domain.types";
import api from "../axiosApi";


export const metadata: Metadata = {
  title: "CGS Games",
  description:
    "Explore games developed by members of the Computer Graphics Society.",

  openGraph: {
    title: "CGS Games",
    description:
      "Explore games developed by members of the Computer Graphics Society.",
    images: ["/og/games-og.jpg"],
  },

  twitter: {
    card: "summary_large_image",
    title: "CGS Games",
    description:
      "Explore games developed by members of the Computer Graphics Society.",
    images: ["/og/games-og.jpg"],
  },
};


const fetchFeaturedGamesProjects = async () => {
  const apiResponse = await api("GET", "/featured", {
    query: {
      target: "game",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IProject[];
  }
  return [];
};

const fetchProjectGames = async () => {
  const apiResponse = await api("GET", "/project", {
    query: {
      portfolio: "game",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IProject[];
  }
  return [];
};

const getProjectsData = async () => {
  const [gamesProject, featuredGamesProject] = await Promise.all([
    fetchProjectGames(),
    fetchFeaturedGamesProjects(),
  ]);

  return {
    gamesProject,
    featuredGamesProject,
  };
};

export default async function ProjectsPage() {
  const { gamesProject, featuredGamesProject } = await getProjectsData();


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        <Navbar />
        <GameClient games={gamesProject} featuredGames={featuredGamesProject} />
        <Footer />
      </div>
    </>
  );
}
