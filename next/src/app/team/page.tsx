import Navbar from "../components/navbar";
import TeamJPG from "../assets/team.jpg";
import TeamCard from "./TeamCard";
import Footer from "../footer";
const teamMembers = [
  {
    name: "Alex Chen",
    role: "Lead Game Developer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    linkedin: "https://linkedin.com/in/alexchen",
    github: "https://github.com/alexchen",
    email: "alex@gamedev.com",
  },
  {
    name: "Sarah Martinez",
    role: "Technical Artist",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    linkedin: "https://linkedin.com/in/sarahmartinez",
    github: "https://github.com/sarahmartinez",
    email: "sarah@gamedev.com",
  },
  {
    name: "Jordan Park",
    role: "Creative Director",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    linkedin: "https://linkedin.com/in/jordanpark",
    github: "https://github.com/jordanpark",
    email: "jordan@gamedev.com",
  },
  {
    name: "Maya Patel",
    role: "UI/UX Designer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    linkedin: "https://linkedin.com/in/mayapatel",
    github: "https://github.com/mayapatel",
    email: "maya@gamedev.com",
  },
  {
    name: "Liam O'Brien",
    role: "Sound Engineer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    linkedin: "https://linkedin.com/in/liamobrien",
    github: "https://github.com/liamobrien",
    email: "liam@gamedev.com",
  },
  {
    name: "Zara Kim",
    role: "Narrative Designer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara",
    linkedin: "https://linkedin.com/in/zarakim",
    github: "https://github.com/zarakim",
    email: "zara@gamedev.com",
  },
  {
    name: "Ray Johnson",
    role: "3D Modeler",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ray",
    linkedin: "https://linkedin.com/in/rayjohnson",
    github: "https://github.com/rayjohnson",
    email: "ray@gamedev.com",
  },
  {
    name: "Nina Wong",
    role: "Animation Specialist",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina",
    linkedin: "https://linkedin.com/in/ninawong",
    github: "https://github.com/ninawong",
    email: "nina@gamedev.com",
  },
  {
    name: "Marcus Silva",
    role: "Level Designer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    linkedin: "https://linkedin.com/in/marcussilva",
    github: "https://github.com/marcussilva",
    email: "marcus@gamedev.com",
  },
  {
    name: "Emma Wright",
    role: "Game Producer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    linkedin: "https://linkedin.com/in/emmawright",
    github: "https://github.com/emmawright",
    email: "emma@gamedev.com",
  },
  {
    name: "Kai Zhang",
    role: "AI Engineer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai",
    linkedin: "https://linkedin.com/in/kaizhang",
    github: "https://github.com/kaizhang",
    email: "kai@gamedev.com",
  },
  {
    name: "Sofia Rodriguez",
    role: "VFX Artist",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    linkedin: "https://linkedin.com/in/sofiarodriguez",
    github: "https://github.com/sofiarodriguez",
    email: "sofia@gamedev.com",
  },
];

export default function GameDev() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="h-screen">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={TeamJPG.src}
              alt="Our Team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-5xl mx-auto text-center">
              {/* <span className="inline-block px-4 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-semibold mb-6 border border-pink-500/30">
                Game Development Team
              </span> */}

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg fade-in">
                Our <span className="text-pink-400">Team</span>
              </h1>

              <div className="w-24 h-1 bg-pink-500 mx-auto mb-8"></div>

              <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-200 mb-10 fade-in-2">
                We&apos;re a diverse group of passionate developers, artists,
                and storytellers committed to creating immersive gaming
                experiences that push creative and technical boundaries.
              </p>

              {/* <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button className="px-8 py-3 bg-pink-500 hover:bg-pink-400 text-gray-900 font-bold rounded-md transition duration-300 transform hover:scale-105 hover:shadow-lg">
                  Meet the Team
                </button>
                <button className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold rounded-md transition duration-300 transform hover:scale-105">
                  View Our Projects
                </button>
              </div> */}
            </div>

            <div className="absolute bottom-16">
              <span className="inline-flex flex-col items-center animate-bounce">
                <svg
                  className="w-8 h-8 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="mt-2 text-pink-400 font-light">
                  Scroll Down
                </span>
              </span>
            </div>
          </div>

          <div className="absolute top-10 left-10 w-40 h-40 border-t-4 border-l-4 border-pink-500/20 hidden lg:block"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-b-4 border-r-4 border-pink-500/20 hidden lg:block"></div>
        </div>
      </section>

      {/* Team Cards Section */}
      <section className="py-20 px-4 sm:px-8 md:px-16 lg:px-24 relative bg-gradient-to-b from-black via-black to-pink-900/10 overflow-hidden">
        {/* Enhanced animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute w-[600px] h-[600px] -left-48 top-1/4 rounded-full bg-gradient-to-tr from-pink-500/10 via-purple-500/15 to-pink-500/10 blur-3xl animate-float-slow opacity-30 mix-blend-screen"></div>
          <div className="absolute w-[500px] h-[500px] -right-32 bottom-1/4 rounded-full bg-gradient-to-bl from-pink-500/10 via-purple-500/15 to-pink-500/10 blur-3xl animate-float opacity-30 mix-blend-screen" style={{ animationDelay: '3s' }}></div>
          
          {/* Enhanced grid pattern with glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(236,72,153,0.075)_1px,transparent_0)] bg-[size:40px_40px] opacity-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(236,72,153,0.05)_1px,transparent_0)] bg-[size:80px_80px] opacity-30 animate-pulse-slow"></div>
          
          {/* Dynamic light effects */}
          <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-pink-500/10 to-transparent rotate-45 animate-[shine_12s_ease-in-out_infinite]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-pink-500/5 to-purple-500/5 animate-pulse-slow mix-blend-overlay"></div>
          
          {/* Particle effect overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(236,72,153,0.1) 0%, transparent 8%)',
            backgroundSize: '120px 120px',
            animation: 'particleFade 4s ease-in-out infinite alternate',
          }}></div>
        </div>

        <div className="relative z-10 max-w-[96rem] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 lg:gap-8 2xl:gap-10">
            {teamMembers.map((member, index) => (
              <div key={index} className="lg:max-w-[280px] 2xl:max-w-[300px] mx-auto w-full">
                <TeamCard member={member} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>
          <Footer />
    </div>


  );
}
