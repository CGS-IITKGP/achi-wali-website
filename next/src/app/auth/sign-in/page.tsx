import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | CGS",
  description:
    "Sign in to your Computer Graphics Society account to access projects, games, blogs and community resources.",

  openGraph: {
    title: "Sign In | CGS",
    description:
      "Sign in to your Computer Graphics Society account.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sign In | CGS",
    description:
      "Sign in to your Computer Graphics Society account.",
  },
};

export default function Page() {
  return <LoginClient />;
}