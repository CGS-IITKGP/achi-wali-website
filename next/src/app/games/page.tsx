export const dynamic = "force-dynamic";

import Navbar from "../components/navbar";
import Footer from "../footer";
import GameClient from "./component/GameClient";
import { IProject } from "../types/domain.types";
import api from "../axiosApi";

const fetchFeaturedGamesProjects = async () => {
  const apiResponse = await api("GET", "/featured", {
    query: {
      target: "game",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IProject[];
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
    console.error(
      "API response error while fetching all R&D projects.",
      apiResponse
    );
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
