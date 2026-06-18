export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { IProject } from "@/app/types/index.types";
import ProjectsClient from "./components/ProjectClient";
import Navbar from "../components/navbar";
import Footer from "../footer";
import FireflyBackground from "../components/FireFlyBackground";
import api from "../axiosApi";

export const metadata: Metadata = {
  title: "CGS Projects",
  description:
    "Explore graphics, research and development projects created by members of the Computer Graphics Society.",

  openGraph: {
    title: "CGS Projects",
    description:
      "Explore graphics, research and development projects created by members of the Computer Graphics Society.",
  },

  twitter: {
    card: "summary_large_image",
    title: "CGS Projects",
    description:
      "Explore graphics, research and development projects created by members of the Computer Graphics Society.",
  },
};

const fetchFeaturedGraphicsProjects = async () => {
  const apiResponse = await api("GET", "/featured", {
    query: {
      target: "graphics",
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

const fetchFeaturedRndProjects = async () => {
  const apiResponse = await api("GET", "/featured", {
    query: {
      target: "rnd",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IProject[];
  } else if (apiResponse.action === null) {
    console.log("Internal Server Error while fetching featured R&D projects.");
  } else if (apiResponse.action === false) {
    console.error(
      "API response error while fetching featured R&D projects.",
      apiResponse
    );
  }
  return [];
};

const fetchProjectsGraphics = async () => {
  const apiResponse = await api("GET", "/project", {
    query: {
      portfolio: "graphics",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as IProject[];
  } else if (apiResponse.action === null) {
    console.log("Internal Server Error while fetching all graphics projects.");
  } else if (apiResponse.action === false) {
    console.error(
      "API response error while fetching all graphics projects.",
      apiResponse
    );
  }
  return [];
};

const fetchProjectRnd = async () => {
  const apiResponse = await api("GET", "/project", {
    query: {
      portfolio: "rnd",
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
  const [
    featuredGraphicsProject,
    featuredRndProject,
    graphicsProject,
    rndProject,
  ] = await Promise.all([
    fetchFeaturedGraphicsProjects(),
    fetchFeaturedRndProjects(),
    fetchProjectsGraphics(),
    fetchProjectRnd(),
  ]);

  const projects: IProject[] = [...graphicsProject, ...rndProject];
  const featuredProjects: IProject[] = [
    ...featuredGraphicsProject,
    ...featuredRndProject,
  ];

  return {
    projects,
    featuredProjects,
  };
};

export default async function ProjectsPage() {
  const { projects, featuredProjects } = await getProjectsData();

  // Fallback: If no featured projects, use first 3 regular projects
  const displayFeaturedProjects =
    featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);

  return (
    <>
      <FireflyBackground quantity={30} />
      <div className="min-h-screen relative z-10">
        <Navbar />
        <ProjectsClient
          projects={projects}
          featuredProjects={displayFeaturedProjects}
        />
        <Footer />
      </div>
    </>
  );
}
