"use client";

export default function BoidsCanvas() {
    return (
        <iframe
            src="/rnd_projects/boid_simulation/index.html"
            title="Boids Simulation"
            className="w-full h-full"
            style={{
                border: "none",
            }}
            allowFullScreen
        />
    );
}