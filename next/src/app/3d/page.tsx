export const dynamic = "force-dynamic";

import Navbar from "../components/navbar";
import Footer from "../footer";
import { IProject } from "../types/domain.types";
import api from "../axiosApi";

import ArcadeWrapper from "./components2/ArcadeWrapper"; 

const fetchFeaturedGamesProjects = async () => {
  const apiResponse = await api("GET", "/featured", {
    query: {
      target: "game",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IProject[];
  } else if (apiResponse.action === null) {
    console.log("Internal Server Error while fetching featured graphics projects.");
  } else if (apiResponse.action === false) {
    console.error("API response error while fetching featured graphics projects.", apiResponse);
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
  } else if (apiResponse.action === null) {
    console.log("Internal Server Error while fetching all R&D projects.");
  } else if (apiResponse.action === false) {
    console.error("API response error while fetching all R&D projects.", apiResponse);
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
  const { gamesProject } = await getProjectsData();

  // 1. Process the links on the server!
  // We map over the games to extract the live-demo link and pass it as a direct property
  const processedGames = gamesProject.map((game) => {
    const liveDemoLink = game.links?.find((link) => link.text === "live-demo")?.url;
    
    return {
      ...game,
      liveDemoUrl: liveDemoLink || null, // Now it's readily available for the client
    };
  });

  return (
    <div className="min-h-screen bg-black relative">
      {/* 2. Pass the pre-processed array to your wrapper */}
      <ArcadeWrapper games={processedGames} />
    </div>
  );
}