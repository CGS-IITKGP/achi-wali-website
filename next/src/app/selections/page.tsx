"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../footer";
import { graphicsTasks } from '@/app/selections/tasks/graphicsTasks';
import { webxTasks } from '@/app/selections/tasks/webxTasks';
import { gamedevTasks } from '@/app/selections/tasks/gamedevTasks';

const portfolioData = {
  WebX: {
    download: "/docs/webx.pdf",
    tasks: webxTasks,
    welcomeTitle: "Welcome to WebX",
    welcomeContent: (
      <div className="space-y-3 sm:space-y-4 text-gray-300 leading-relaxed text-sm sm:text-lg">
        <p>Hello, Sophomores! We hope you're all doing well!</p>
        <p>
          We’re thrilled to present the Task Round of the Computer Graphics
          Society for the WebX Portfolio.
        </p>
        <p>
          Below, you'll find carefully curated problem statements across diverse
          domains. You're encouraged to choose any one of the tasks and give it
          your best shot. Not only will you enjoy the creative process, but
          you'll also gain hands-on experience in exciting and emerging areas of
          web development.
        </p>
        <div className="mt-5 sm:mt-6 flex items-start gap-3 bg-pink-500/10 border border-pink-500/20 p-3 sm:p-4 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.1)]">
          <span className="text-lg sm:text-xl shrink-0">⚠️</span>
          <p className="text-pink-200 font-medium text-xs sm:text-base">
            Remember — WebX is more than just traditional Web Development.
          </p>
        </div>
      </div>
    ),
    extraContent: (
      <div className="space-y-5 sm:space-y-6">
        <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4">Submission Guidelines</h3>
        
        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 sm:mb-3">1. GitHub Repository</h4>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-base">
            <li>Create a public GitHub repository for your project.</li>
            <li>Include a clear and well-structured README with: Project Overview, Features Implemented, Technologies Used, Setup & Build Instructions, Screenshots / Demo, Any Known Issues or Future Work.</li>
          </ul>
        </div>
        
        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 sm:mb-3">2. Code Structure & Build</h4>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-base">
            <li>Organize your code properly into folders and include comments where necessary.</li>
            <li>Dockerfiles / docker-compose.yml should be in the root or a clearly marked directory.</li>
            <li>Your project should be runnable locally using the provided instructions. If you&apos;ve used Docker, ensure the Dockerfile/Compose setup works as expected.</li>
          </ul>
        </div>

        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
          <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 sm:mb-3">Repo Checklist</h4>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-base mb-3 sm:mb-4">
            <li>README with setup steps and project explanation</li>
            <li>Dockerfile or docker-compose.yml (if required by your track)</li>
            <li>Working code for selected task</li>
            <li>Bonus features or improvements (if any)</li>
            <li>Screenshots / Recordings (optional but appreciated)</li>
          </ul>
          <p className="text-pink-200 text-xs sm:text-sm">
            <strong>Submission Link:</strong> The submission form link will be shared soon. If you have any doubts, feel free to reach out on our WhatsApp group.
          </p>
        </div>

        <div className="w-full h-px bg-pink-500/20 my-5 sm:my-6"></div>

        <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4 mt-6 sm:mt-8">Learning Resources</h3>
        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <ul className="grid sm:grid-cols-2 gap-2 sm:gap-3 text-gray-300 text-xs sm:text-base">
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=9bSbNNH4Nqw" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline break-words">Docker - Full Course</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline break-words">React Full Playlist</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=un6ZyFkqFKo" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words">Go Lang Full Course</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=Oe421EPjeBE" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words">Node & Express Full Tutorial</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=jBzwzrDvZ18" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words">Python Full Course</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=6biMWgD6_JY" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words">Tailwind CSS Crash Course</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=c2M-rlkkT5o" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words">MongoDB Tutorial for Beginners</a></li>
            <li className="flex items-start sm:items-center gap-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=qw--VYLpxG4" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words">PostgreSQL Full Course</a></li>
            <li className="flex items-start sm:items-center gap-2 col-span-1 sm:col-span-2"><span className="shrink-0 mt-0.5 sm:mt-0">▶</span> <a href="https://www.youtube.com/watch?v=gyMwXuJrbJQ" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline underline  break-words"> Blockchain Development Tutorial</a></li>
          </ul>
        </div>
      </div>
    ),
  },
  Graphics: {
    download: "/docs/graphics.pdf",
    tasks: graphicsTasks,
    welcomeTitle: "Welcome to Graphics",
    welcomeContent: (
      <div className="space-y-3 sm:space-y-4 text-gray-300 leading-relaxed text-sm sm:text-lg">
        <p>
          Hello sophomores! Welcome to the task round of the Computer Graphics
          Society, Graphics team.
        </p>
        <p>
          This challenge is designed to test your creativity, technical skills,
          familiarity with 3D modeling and animation using Blender and to bring
          your imagination to life. Whether you are new to Blender or have some
          experience, this task will help you build a strong foundation for more
          advanced projects.
        </p>
      </div>
    ),
    extraContent: (
      <div className="space-y-5 sm:space-y-6">
        <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4">Submission Guidelines</h3>
        
        <div className="mt-2 mb-5 sm:mb-6 flex flex-col sm:flex-row items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 sm:p-5 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <span className="text-xl sm:text-2xl shrink-0">🚨</span>
          <div className="text-red-200 text-xs sm:text-base leading-relaxed">
            <strong className="font-bold block mb-1 text-red-400">IMPORTANT:</strong> 
            Refrain from copying directly from any tutorial or reference image/video for any of the above tasks. Any use of AI (except for ideation and creating reference images) is prohibited. These will be grounds for instant disqualification from the selection process.
          </div>
        </div>

        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 sm:mb-3">1. Prepare Your Folder</h4>
          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">To submit your work successfully, prepare a folder containing:</p>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-base">
            <li>Your Blender project file (.blend)</li>
            <li>Some rendered images of your project in different camera angles.</li>
            <li>One video file of the final animation.</li>
            <li>3-4 clear screenshots of the scene in the viewport in wireframe and solid views.</li>
            <li className="text-pink-200 mt-2 sm:mt-3 border-l-2 border-pink-400 pl-2 sm:pl-3 break-all sm:break-normal">
              <strong>Name of the folder:</strong> CGS_[Rollno]_[YourFirstName]_Graphics
            </li>
          </ul>
        </div>

        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 sm:mb-3">2. Upload the Folder</h4>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-base">
            <li>Open Google Drive and Upload the Folder.</li>
            <li>Copy the link for the folder after changing the access to &quot;Anyone with link&quot;.</li>
            <li>Paste the link in the Google Form which we will provide near the submission deadline.</li>
          </ul>
        </div>

        <div className="w-full h-px bg-pink-500/20 my-5 sm:my-6"></div>

        <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4 mt-6 sm:mt-8">Tutorials to Help You on Your Journey :)</h3>
        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <ul className="space-y-3 sm:space-y-4 text-gray-300 text-xs sm:text-base">
            <li><a href="https://www.youtube.com/playlist?list=PLgO2ChD7acqH5S3fCO1GbAJC55NeVaCCp" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline block sm:inline">
              <strong className="text-pink-300 underline ">Blender Basics:</strong> </a>CrossMind studio absolute beginner blender series
            </li>
            <li><a href="https://www.youtube.com/watch?v=tapTU-xxAZA" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline block sm:inline">
              <strong className="text-pink-300 underline">Blender speed issue:</strong></a> EVERY way to SPEED up Cycles!
            </li>
            <li><a href="https://www.youtube.com/watch?v=CBJp82tlR3M" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline block sm:inline">
              <strong className="text-pink-300 underline">Animation in blender:</strong> </a>Animation for Beginners!
            </li>
            <li><a href="https://www.youtube.com/watch?v=HJSGoKbNBnQ" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline block sm:inline">
              <strong className="text-pink-300 underline">Sculpting in blender:</strong></a> Sculpting for beginners
            </li>
            <li><a href="https://www.youtube.com/playlist?list=PLjEaoINr3zgEPv5y--4MKpciLaoQYZB1Z" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline block sm:inline">
              <strong className="text-pink-300 underline">Donut Series By BlenderGuru:</strong> </a> Beginner donut series
            </li>
          </ul>
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
            <p className="text-pink-200 text-xs sm:text-sm leading-relaxed">
              Remember, these tasks are meant to be enjoyable and provide an opportunity to showcase your skills in 3D modeling and creativity. Feel free to reach out if you have any questions, and have fun bringing your ideas to life in Blender!
            </p>
          </div>
        </div>
      </div>
    ),
  },
  GameDev: {
    download: "/docs/gamedev.pdf",
    tasks: gamedevTasks,
    welcomeTitle: "Welcome to GameDev",
    welcomeContent: (
      <div className="space-y-3 sm:space-y-4 text-gray-300 leading-relaxed text-sm sm:text-lg">
        <p>Hello, Sophomores! We hope you're all doing well.</p>
        <p>
          We're excited to introduce the task round of the CGS (Computer
          Graphics Society) for Game Development. Below, you'll find two
          intriguing problem statements, and we encourage you to choose and
          attempt at least one of them.
        </p>
        <p>
          We believe you'll not only have a great time working on these tasks
          but also gain valuable experience in the world of game development.
          So, without further ado, let's dive in and get creative!
        </p>
      </div>
    ),
    extraContent: (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4">Evaluation Guidelines</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
            Whether you complete the game or not is not the primary concern. Instead, we are interested in understanding the effort you put into the project and how effectively you present your work.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
              <strong className="text-pink-300 block mb-1 text-sm sm:text-base">1. Effort Over Complexity</strong>
              <span className="text-gray-300 text-xs sm:text-sm">Prioritize effort over complexity. It&apos;s okay if your project is simple as long as you&apos;ve put in sincere effort.</span>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
              <strong className="text-pink-300 block mb-1 text-sm sm:text-base">2. Presentation Matters</strong>
              <span className="text-gray-300 text-xs sm:text-sm">Focus on presenting your game effectively. Ensure you understand every detail of your project and can explain how you created it.</span>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
              <strong className="text-pink-300 block mb-1 text-sm sm:text-base">3. Exploration & Learning</strong>
              <span className="text-gray-300 text-xs sm:text-sm">We appreciate your willingness to explore and learn. Share what components, code, and assets you&apos;ve explored.</span>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-4">
              <strong className="text-pink-300 block mb-1 text-sm sm:text-base">4. Task Preference</strong>
              <span className="text-gray-300 text-xs sm:text-sm">Though we prefer creativity, a successful exhibition of theme-based Tasks would not be discriminated against.</span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-pink-500/20"></div>

        <div>
          <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4">Submission Guidelines</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">To have your game considered, please prepare and submit three essential components:</p>
          
          <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <strong className="text-pink-300 text-base sm:text-lg block mb-1 sm:mb-2">1. Devlog</strong>
              <p className="text-gray-300 text-xs sm:text-sm">Think of the Devlog as a diary for your game project. Introduce your game idea, maintain a record of your daily/weekly progress, and include challenges encountered (like bugs) and how you resolved them.</p>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <strong className="text-pink-300 text-base sm:text-lg block mb-1 sm:mb-2">2. Project Files</strong>
              <p className="text-gray-300 text-xs sm:text-sm">This includes all the files in your project folder, with a focus on your assets, scenes, and scripts. These are the building blocks of your game.</p>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <strong className="text-pink-300 text-base sm:text-lg block mb-1 sm:mb-2">3. Final Build</strong>
              <p className="text-gray-300 text-xs sm:text-sm">Compile your game into a playable file. Focus on creating a start-to-end Game Prototype with clear win/lose conditions.</p>
            </div>
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-dashed">
              <strong className="text-pink-300 text-base sm:text-lg block mb-1 sm:mb-2">Optional Video (2-3 mins)</strong>
              <p className="text-gray-300 text-xs sm:text-sm">Create a short video where you explain your game and discuss the scripts you&apos;ve used. Adds an extra layer of understanding to your submission.</p>
            </div>
          </div>

          <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
            <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 sm:mb-3">Important Submission Details</h4>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-base">
              <li>Zip all these components into a single file and upload it to Google Drive.</li>
              <li>Please <strong>do not</strong> submit files separately, as they will not be considered valid.</li>
              <li className="text-pink-200 mt-3 sm:mt-4 border-l-2 border-pink-400 pl-2 sm:pl-3 break-words">
                <strong>Name your file:</strong> &lt;Your Name&gt;_&lt;Your Roll No&gt;_&lt;GameDev&gt;<br/>
                <span className="text-xs sm:text-sm opacity-80 mt-1 block">Example: Sahil_25A110023_GameDev</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full h-px bg-pink-500/20"></div>

        <div>
          <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4">Resources</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5">Here are some links to help you through your Game dev journey:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <strong className="text-pink-300 text-base sm:text-lg block mb-2 sm:mb-3">Documentation</strong>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
                <li><a href="https://docs.unity3d.com/Manual/index.html" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Unity Docs</a></li>
                <li><a href="https://docs.unrealengine.com/5.3/en-US/" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Unreal Docs</a></li>
                <li><a href="https://docs.godotengine.org/en/stable/index.html" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Godot Docs</a></li>
              </ul>
            </div>

            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <strong className="text-pink-300 text-base sm:text-lg block mb-2 sm:mb-3">General Resources</strong>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
                <li><a href="https://www.youtube.com/@Brackeys/featured" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Brackeys</a></li>
                <li><a href="https://www.youtube.com/@SunnyValleyStudio/videos" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Sunny Valley Studio</a></li>
                <li><a href="https://www.youtube.com/@CodeMonkeyUnity/featured" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Code Monkey</a></li>
                <li><a href="https://www.youtube.com/watch?v=vFjXKOXdgGo" className="text-pink-400 underline">GMTK:</a> How I learned Unity without following tutorials</li>
              </ul>
            </div>
            
            <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 sm:col-span-2">
              <strong className="text-pink-300 text-base sm:text-lg block mb-2 sm:mb-3">Assets</strong>
              <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">You can try finding your desired assets on: Unity asset store/ unreal marketplace, Itch, Sketchfab, Ready Player Me, Vroid Studio.</p>
              <p className="text-gray-300 text-xs sm:text-sm">
                <strong className="text-pink-300">Mixamo:</strong> <a href="https://www.youtube.com/watch?v=Q8lJpoUwaBA" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline underline">Mixamo tutorial</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

// --- Reusable Typography & Layout Components ---

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg sm:text-2xl font-semibold text-pink-200 mb-3 sm:mb-4">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 leading-relaxed text-xs sm:text-lg mb-6 sm:mb-10">{children}</p>;
}

function ListSection({ title, items }: { title: string; items: any[] | undefined }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-6 sm:mb-8">
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-2 sm:space-y-3">
        {items.map((item, index) => (
          <li key={`list-item-${index}`} className="text-gray-300 leading-relaxed text-xs sm:text-base">
            •{" "}
            {typeof item === "object" && item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 hover:underline transition-colors duration-200 underline"
              >
                {item.label}
              </a>
            ) : (
              // Fallback for standard string items
              <span>{item}</span> 
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Portfolio-Specific Renderers ---

function WebXTask({ task }: { task: any }) {
  return (
    <>
      {task.introduction && (
        <div>
          <SectionTitle>Introduction</SectionTitle>
          <Paragraph>{task.introduction}</Paragraph>
        </div>
      )}

      {task.overview && (
        <div>
          <SectionTitle>Overview</SectionTitle>
          <Paragraph>{task.overview}</Paragraph>
        </div>
      )}

      <ListSection title="Objectives" items={task.objectives} />

      {task.phase1 && task.phase1.length > 0 && (
        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10">
          <ListSection title="Phase 1" items={task.phase1} />
        </div>
      )}

      {task.phase2 && task.phase2.length > 0 && (
        <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10">
          <ListSection title="Phase 2" items={task.phase2} />
        </div>
      )}

      <ListSection title="Evaluation Criteria" items={task.evaluation} />
      <ListSection title="Recommended Tech Stack" items={task.techStack} />
    </>
  );
}

function GraphicsTask({ task }: { task: any }) {
  return (
    <>
      {task.objective && (
        <div>
          <SectionTitle>Objective</SectionTitle>
          <Paragraph>{task.objective}</Paragraph>
        </div>
      )}

      {task.taskRequirements && (
        <div className="mb-6 sm:mb-10">
          <SectionTitle>Task Requirements</SectionTitle>
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(task.taskRequirements).map(([reqTitle, reqDesc]) => (
              <div key={reqTitle} className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2">{reqTitle}</h4>
                <p className="text-gray-300 text-xs sm:text-base leading-relaxed">{reqDesc as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ListSection title="Examples & References" items={task.examplesAndReferences}/>
    </>
  );
}

function GameDevTask({ task }: { task: any }) {
  const dynamicKeys = Object.keys(task).filter(
    (key) => !["title", "overview", "examplesAndReferences"].includes(key)
  );

  return (
    <>
      {task.overview && (
        <div>
          <SectionTitle>Overview</SectionTitle>
          <Paragraph>{task.overview}</Paragraph>
        </div>
      )}

      {dynamicKeys.length > 0 && (
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
          {dynamicKeys.map((key) => {
            const displayTitle = key.toLowerCase().startsWith("step")
              ? key.replace(/step/i, "Step ")
              : key;

            return (
              <div key={key} className="bg-pink-500/5 border border-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-pink-300 mb-2 capitalize">
                  {displayTitle}
                </h4>
                <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
                  {task[key]}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// --- Main Page Component ---

export default function SelectionsPage() {
  const [activeTab, setActiveTab] = useState("WebX");
  const [activeTask, setActiveTask] = useState<number | 'extra'>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const currentPortfolio = portfolioData[activeTab as keyof typeof portfolioData];

  useEffect(() => {
    const handleScroll = () => {
      let isExtraActive = false;

      // Check if Extra section is in view
      const extraElement = document.getElementById('extra-submission-guidelines');
      if (extraElement) {
        const rect = extraElement.getBoundingClientRect();
        if (rect.top <= 350 && rect.bottom >= 200) {
          setActiveTask('extra');
          isExtraActive = true;
        }
      }

      // Only check tasks if Extra isn't hijacking the view
      if (!isExtraActive) {
        currentPortfolio.tasks.forEach((_, index) => {
          const element = document.getElementById(`task-${index}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 250 && rect.bottom >= 200) {
              setActiveTask(index);
            }
          }
        });
      }

      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPortfolio.tasks]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#12000f] to-black text-white pt-24 sm:pt-32 pb-32 sm:pb-32 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Hero */}
        <section className="max-w-6xl mx-auto text-center mb-10 sm:mb-16">
          <div className="inline-block mb-4 sm:mb-5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-200 text-[10px] sm:text-sm shadow-[0_0_15px_rgba(236,72,153,0.15)] whitespace-nowrap">
            2026–27 Selections
          </div>
          <h1 
            className="text-3xl min-[375px]:text-4xl sm:text-6xl md:text-7xl font-bold text-pink-100 mb-3 sm:mb-5 leading-tight tracking-tight px-1"
            style={{ textShadow: "2px 0px 0px #00e5ff, -2px 0px 0px #ff0055" }}
          >
            Sophomore Selections
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-xs min-[375px]:text-sm sm:text-lg leading-relaxed px-4">
            Explore the official selection tasks for WebX, Graphics, and Game
            Development portfolios of the Computer Graphics Society.
          </p>

          {/* Deadline */}
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto border border-pink-500/20 bg-pink-500/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-sm w-[90%] sm:w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-pink-200 font-semibold text-xs min-[375px]:text-sm sm:text-base text-center">
              <span>Submission Deadline:</span>
              <span className="text-white">27th June 2026 • 11:59 PM (Tentative)</span>
            </div>
          </div>
        </section>

        {/* Tabs - Optimized to prevent clipping on tiny screens */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 sm:gap-4 mb-10 sm:mb-14">
          {Object.keys(portfolioData).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setActiveTask(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-[11px] min-[375px]:text-sm sm:text-base transition-all duration-300 border px-1 sm:px-4 ${
                activeTab === tab
                  ? "bg-pink-400 text-black border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  : "bg-[#1a1a1a]/80 backdrop-blur-xl text-white border-gray-700 hover:border-pink-300/50 hover:bg-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-36 border border-pink-500/10 bg-white/[0.02] rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-xl font-semibold text-pink-200 mb-6">Task Contents</h3>
              <div className="space-y-3">
                {currentPortfolio.tasks.map((task, index) => (
                  <button
                    key={`sidebar-task-${index}`}
                    onClick={() => {
                      document.getElementById(`task-${index}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                      activeTask === index
                        ? "bg-pink-400 text-black border-pink-300"
                        : "bg-black/20 border-white/5 text-gray-300 hover:border-pink-300/50"
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">Task {index + 1}</div>
                    <div className="text-sm leading-relaxed truncate">{task.title}</div>
                  </button>
                ))}

                {/* Extra Link in Sidebar */}
                <button
                  onClick={() => {
                    document.getElementById('extra-submission-guidelines')?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border mt-5 ${
                    activeTask === 'extra'
                      ? "bg-pink-400 text-black border-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                      : "bg-black/20 border-white/5 text-pink-200/70 hover:border-pink-300/50 hover:text-pink-200"
                  }`}
                >
                  <div className="text-sm font-semibold mb-1 text-pink-300">Extra</div>
                  <div className="text-sm leading-relaxed truncate">Guidelines & Resources</div>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="space-y-8 sm:space-y-16 w-full">
            
            {/* Dynamic Welcome Banner */}
            <div className="relative overflow-hidden border border-pink-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-10 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent backdrop-blur-md">
              {/* Decorative Blur Bubble */}
              <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <h2 className="text-xl sm:text-3xl font-bold text-pink-300 mb-3 sm:mb-4 drop-shadow-md">
                {currentPortfolio.welcomeTitle}
              </h2>
              {currentPortfolio.welcomeContent}
            </div>

            {/* Task Lists */}
            {currentPortfolio.tasks.map((task, index) => (
              <section
                id={`task-${index}`}
                key={`task-section-${index}`}
                className="scroll-mt-24 sm:scroll-mt-32 border border-pink-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 bg-white/[0.02] backdrop-blur-sm"
              >
                {/* Number & Title Header */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-pink-400 text-black flex items-center justify-center text-base sm:text-xl font-bold mb-4 sm:mb-8 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                  {index + 1}
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-pink-300 mb-4 sm:mb-6 leading-tight break-words">
                  {task.title}
                </h2>
                <p className="text-gray-500 mb-6 sm:mb-10 text-xs sm:text-base">
                  Portfolio Task • 2026–27 Selection Process
                </p>

                {/* Conditional Rendering based on Tab */}
                {activeTab === "WebX" && <WebXTask task={task} />}
                {activeTab === "Graphics" && <GraphicsTask task={task} />}
                {activeTab === "GameDev" && <GameDevTask task={task} />}
              </section>
            ))}

            {/* Extra Section - Submission Guidelines */}
            <section
              id="extra-submission-guidelines"
              className="scroll-mt-24 sm:scroll-mt-32 border border-pink-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(236,72,153,0.05)] relative overflow-hidden"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 sm:w-48 h-40 sm:h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-4xl font-bold text-pink-300 mb-2 leading-tight">
                  Extra
                </h2>
                <div className="w-12 sm:w-16 h-1 bg-pink-500/50 rounded-full mb-6 sm:mb-8"></div>
                
                {currentPortfolio.extraContent}
              </div>
            </section>

            {/* Bottom Download Section */}
            <div className="flex justify-center pt-4 sm:pt-6 pb-16 sm:pb-6">
              <a
                href={currentPortfolio.download}
                download
                className="inline-flex items-center justify-center bg-pink-400 text-black font-semibold px-5 sm:px-7 py-3 sm:py-4 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 text-xs sm:text-base text-center w-[90%] sm:w-auto"
              >
                Download Full {activeTab} Tasks
              </a>
            </div>
          </div>
        </div>

        {/* Floating Back To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-4 sm:bottom-7 sm:right-7 z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-lg md:text-2xl rounded-full bg-pink-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-110 transition-all duration-300 font-semibold"
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </main>

      <Footer />
    </>
  );
}