import { remark } from "remark";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

async function run() {
  const md = `
1. Particle Distribution (Inverse Transform Sampling):
To generate the positions of particles, the following equation is used.
$$\\frac{M(r)}{M}=\\left(\\frac{r}{a}\\right)^3\\left[1+\\left(\\frac{r}
{a}\\right)^2\\right]^{-\\frac{3}{2}}$$
where,
* $M(r)$ = Mass enclosed within radius $r$.
* $M$ = Total mass of the galaxy.
* $r$ = Radial distance of a particle from the center of the galaxy.
* $a$ = Scale radius of the Plummer sphere.
`;

  // Fix display math
  const fixedMd = md.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
    return \`\\n$$\\n\${p1.trim()}\\n$$\\n\`;
  });

  const processed = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(fixedMd);

  console.log(processed.toString());
}

run();
