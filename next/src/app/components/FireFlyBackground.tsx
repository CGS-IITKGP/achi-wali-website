"use client";

import { useEffect } from "react";

const random = (max: number, min = 0) => Math.random() * (max - min) + min;

interface FireflyBackgroundProps {
  quantity?: number;
}

const FireflyBackground: React.FC<FireflyBackgroundProps> = ({
  quantity = 30,
}) => {
  useEffect(() => {
    const generateStyles = () => {
      let keyframes = "";
      for (let i = 1; i <= quantity; i++) {
        const steps = Math.floor(random(12, 16));
        const rotationSpeed = random(3, 6);

        keyframes += `
          .firefly:nth-child(${i}) {
            animation-name: move${i};
          }
          .firefly:nth-child(${i})::before {
            animation-duration: ${rotationSpeed}s;
          }
          .firefly:nth-child(${i})::after {
            animation-duration: ${rotationSpeed}s, ${random(
          4000,
          2000
        )}ms; // CHANGED: Faster blinking (2-4s)
            animation-delay: 0ms, ${random(8000, 500)}ms;
          }
        `;

        let moveKeyframe = `@keyframes move${i} {`;
        for (let step = 0; step <= steps; step++) {
          moveKeyframe += `
            ${(step * 100) / steps}% {
              transform: translateX(${random(100, -50)}vw) translateY(${random(
            100,
            -50
          )}vh) scale(${random(1, 0.25)});
            }
          `;
        }
        moveKeyframe += "}";
        keyframes += moveKeyframe;
      }

      return `
        .firefly {
          position: fixed;
          left: 50%;
          top: 50%;
          width: 0.4vw;
          height: 0.4vw;
          margin: -0.2vw 0 0 9.8vw;
          animation: ease 80s alternate infinite; /* CHANGED: Faster movement across screen (was 200s) */
          pointer-events: none;
        }

        .firefly::before,
        .firefly::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform-origin: -10vw;
        }

        .firefly::before {
          background: black;
          opacity: 0.4;
          animation: drift ease alternate infinite;
        }

        .firefly::after {
          background: white;
          opacity: 0;
          /* CHANGED: Switched glow from yellow to pink (#ec4899) to match your theme */
          box-shadow: 0 0 0vw 0vw #ec4899; 
          animation: drift ease alternate infinite, flash ease infinite;
        }
        
        @keyframes drift {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* CHANGED: Updated flash color to pink (#ec4899) */
        @keyframes flash {
          0%, 30%, 100% { opacity: 0; box-shadow: 0 0 0vw 0vw #ec4899; }
          5% { opacity: 1; box-shadow: 0 0 2vw 0.4vw #ec4899; }
        }

        ${keyframes}
      `;
    };

    const styleElement = document.createElement("style");
    styleElement.id = "firefly-styles";
    styleElement.innerHTML = generateStyles();
    document.head.appendChild(styleElement);

    return () => {
      const style = document.getElementById("firefly-styles");
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, [quantity]);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {Array.from({ length: quantity }).map((_, i) => (
        <div key={i} className="firefly"></div>
      ))}
    </div>
  );
};

export default FireflyBackground;
