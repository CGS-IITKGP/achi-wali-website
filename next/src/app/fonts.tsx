import { Arima, Righteous, Roboto, Fredoka, JetBrains_Mono  } from "next/font/google";

const arimaFont = Arima({
  subsets: ["latin"],
});

const righteousFont = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const robotoFont = Roboto({
  subsets: ["latin"],
});

const fredokaFont = Fredoka({
  subsets: ["latin"],
});

const jetbrainsMonoFont = JetBrains_Mono({
  subsets: ["latin"],
});

export { arimaFont, righteousFont, robotoFont, fredokaFont, jetbrainsMonoFont };
