"use client";

import { useEffect, useRef } from "react";

/**
 * Client-side component that renders LaTeX math equations using KaTeX.
 * Uses KaTeX auto-render loaded from CDN as a fallback/primary renderer.
 * This ensures math is always rendered regardless of server-side processing.
 */
export default function MathContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Load KaTeX CSS
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css";
      link.integrity =
        "sha384-zh0CIslj3dQfF2MOSN6mVnJbhimYuUDTpSfqSAHdBk2b4T2LxMd3GOuLwFGWRp7";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }

    // Load KaTeX JS + auto-render
    const loadKatex = async () => {
      if (!(window as any).katex) {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js",
          "sha384-bB5yZZVJaRo2sUpBBNa2FHBma3gYDujDfJgVFmKRqJAhMnhk7C4Dgg7QULjy3ye",
        );
      }
      if (!(window as any).renderMathInElement) {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/contrib/auto-render.min.js",
          "sha384-hCXGrW6PitJeDYA4misSWQLEiEkNDsQx1afgDeCBMOFRME0XAAO2tvtqJcHITJ7g",
        );
      }

      const renderMathInElement = (window as any).renderMathInElement;
      if (renderMathInElement && ref.current) {
        renderMathInElement(ref.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
          trust: true,
        });
      }
    };

    loadKatex();
  }, [html]);

  return (
    <article
      ref={ref}
      className="prose prose-xl prose-invert max-w-none mdx-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function loadScript(src: string, integrity: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
