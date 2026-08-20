import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Sign Up | CGS",
  description:
    "Create your Computer Graphics Society account and join the CGS community.",

  openGraph: {
    title: "Sign Up | CGS",
    description:
      "Create your Computer Graphics Society account.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sign Up | CGS",
    description:
      "Create your Computer Graphics Society account.",
  },
};

export default function Page() {
  return <RegisterClient />;
}