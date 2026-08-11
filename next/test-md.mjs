import { remark } from "remark";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

async function run() {
  const md = `
hi
$$\\frac{M(r)}{M}=\\left(\\frac{r}{a}\\right)^3\\left[1+\\left(\\frac{r}
{a}\\right)^2\\right]^{-\\frac{3}{2}}$$
`;

  // Test 1: Single newline (what I did)
  const single = md.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
    return \`\\n$$\\n\${p1.trim()}\\n$$\\n\`;
  });

  // Test 2: Double newline
  const double = md.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
    return \`\\n\\n$$\\n\${p1.trim()}\\n$$\\n\\n\`;
  });

  console.log("=== SINGLE NEWLINE ===");
  const p1 = await remark().use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify).process(single);
  console.log(p1.toString().includes("katex")); // true if parsed as math

  console.log("=== DOUBLE NEWLINE ===");
  const p2 = await remark().use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify).process(double);
  console.log(p2.toString().includes("katex")); // true if parsed as math
}

run();
