import { IProject } from "../types/domain.types";
import api from "../axiosApi";
import ThreeDModeManager from "./components2/ThreeDModeManager";

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

interface PageProps {
  searchParams?: Promise<{ mode?: string }> | { mode?: string };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawMode = (resolvedSearchParams?.mode || "").toLowerCase();
  const mode: "arcade" | "experience" = rawMode === "arcade" ? "arcade" : "experience";

  const { gamesProject } = await getProjectsData();

  // Process the links on the server
  const processedGames = gamesProject.map((game) => {
    const liveDemoLink = game.links?.find((link) => link.text === "live-demo")?.url;
    
    return {
      ...game,
      liveDemoUrl: liveDemoLink || null,
    };
  });

  return (
    <div className="min-h-screen bg-black relative">
      <ThreeDModeManager mode={mode} games={processedGames} />
    </div>
  );
}
