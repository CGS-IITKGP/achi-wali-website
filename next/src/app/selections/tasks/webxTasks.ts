// WebX Portfolio Tasks

export const webxTasks = [
  {
    title: "Interactive 3D Product Configurator ",
    introduction: "Design and develop a modern, responsive React-based web application featuring an interactive 3D scene using Three.js. ",
    overview: "Build a product configurator where users interact with a 3D model through a React UI, synchronizing standard UI state with a WebGL canvas. ",
    objectives: [
      "Initialize a 3D scene with appropriate lighting ",
      "Load a real 3D model in .gltf or .glb format ",
      "Implement interactive standard React UI controls ",
      "Containerize the application with Docker "
    ],
    phase1: [
      "Set up a React app with Three.js/React Three Fiber ",
      "Load the 3D asset with a Suspense fallback ",
      "Add OrbitControls for rotation and zooming ",
      "Implement material customization color pickers "
    ],
    phase2: [
      "Add visibility toggles for model parts ",
      "Implement raycasting for click events on the model ",
      "Ensure the UI and 3D canvas are fully responsive ",
      "Write a multi-stage Dockerfile "
    ],
    evaluation: [
      "Ability to load and optimize 3D assets ",
      "State management between DOM and Canvas ",
      "Implementation of 3D camera controls ",
      "Code scalability and documentation in README.md "
    ],
    techStack: [
      "React ",
      "Three.js & React Three Fiber ",
      "Zustand or Context API ",
      "Docker "
    ]
  },
  {
    title: "Authenticated Backend Server with Docker ",
    introduction: "Design and develop a robust backend server supporting user authentication with JWT and database integration. ",
    overview: "Build a production-ready backend service showcasing secure authentication, clean code structure, and a fully containerized deployment using Docker Compose. ",
    objectives: [
      "Create secure authentication routes for signup/signin ",
      "Protect user endpoints using JWTs ",
      "Integrate with MongoDB or PostgreSQL ",
      "Manage multi-container setup via Docker Compose "
    ],
    phase1: [
      "Develop POST /signup with password hashing ",
      "Develop GET /signin returning signed JWTs ",
      "Define User schema with unique username and description ",
      "Set up the selected ORM/ODM "
    ],
    phase2: [
      "Implement GET /me protected route ",
      "Implement PUT /me for updating descriptions ",
      "Configure docker-compose.yml for backend and DB ",
      "Add .env support and health check scripts "
    ],
    evaluation: [
      "Correctness and code clarity ",
      "Security practices like password hashing and JWT ",
      "Effectiveness of Docker Compose setup ",
      "Optional features like rate limiting and validation "
    ],
    techStack: [
      "Go / Node.js / Django / Flask ",
      "MongoDB / PostgreSQL ",
      "JWT ",
      "Docker Compose "
    ]
  },
  {
    title: "Blockchain Smart Contract & Frontend Integration ",
    introduction: "Create and deploy an ERC-20 token with advanced capabilities and build a frontend to interact with the contract. ",
    overview: "Deploy a fully functional smart contract on a testnet with custom properties, and replicate Remix IDE interactions through a user-friendly React interface. ",
    objectives: [
      "Develop an ERC-20 token with capped supply ",
      "Implement advanced functions like burnable tokens and self-destruct ",
      "Deploy and verify on a testnet ",
      "Build a MetaMask-integrated frontend "
    ],
    phase1: [
      "Limit total supply and make tokens burnable ",
      "Enable minting with optional rewards ",
      "Implement a secure selfDestruct() method ",
      "Deploy contract to Sepolia, Base Sepolia, or Amoy "
    ],
    phase2: [
      "Build a React frontend library ",
      "Integrate MetaMask connection ",
      "Display user token balances ",
      "Add UI buttons for Minting, Burning, and Transferring "
    ],
    evaluation: [
      "Successful testnet deployment and block explorer verification ",
      "Accuracy of Remix IDE replication in the frontend ",
      "Clear code organization and commenting ",
      "Complete README with setup instructions and features "
    ],
    techStack: [
      "Solidity [cite",
      "React ",
      "MetaMask ",
      "Docker (Optional) "
    ]
  }
];