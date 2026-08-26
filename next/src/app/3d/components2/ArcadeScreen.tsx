"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";

interface ArcadeScreenProps {
  step: number;
  games: any[]; 
}

export default function ArcadeScreen({ step, games }: ArcadeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!games || games.length === 0) {
      console.warn("No games data provided to ArcadeScreen");
      return null; 
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % games.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  const currentGame = games[currentIndex];

  return (
    <group position={[60.500, 35.524, -23.545]} rotation={[0, -Math.PI / 2, 0]}>
      <group rotation={[-Math.PI / 12, 0, 0]}>
      {step === 9 && (
        <Html 
          transform 
          center 
          zIndexRange={[100, 0]}
          scale={2} 
        >
          <div 
            style={{ 
              width: '800px', 
              height: '520px', 
              position: 'relative', 
              backgroundColor: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' 
            }}
          >
            {/* We now simply check the pre-processed 'liveDemoUrl' property! */}
            {currentGame.liveDemoUrl ? (
              <a 
                href={currentGame.liveDemoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
              >
                <img 
                  src={currentGame.coverImgUrl || "/default-fallback-image.png"} 
                  alt={currentGame.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    opacity: 0.8,
                    transition: 'opacity 0.3s'
                  }} 
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(236, 72, 153, 0.9)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  pointerEvents: 'none'
                }}>
                  ▶ Play Now
                </div>
              </a>
            ) : (
              <img 
                src={currentGame.coverImgUrl || "/default-fallback-image.png"} 
                alt={currentGame.title}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  opacity: 0.8
                }} 
              />
            )}

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
              color: 'white',
              fontFamily: 'sans-serif',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}>
              {currentGame.title}
            </div>

            <button 
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '2px solid rgba(236, 72, 153, 0.5)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <button 
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '2px solid rgba(236, 72, 153, 0.5)', 
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </Html>
      )}
      </group>
    </group>
  );
}