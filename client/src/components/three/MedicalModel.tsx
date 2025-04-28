import React, { useState, useEffect } from 'react';

// Interactive SVG component that simulates a 3D medical model
const MedicalModel: React.FC<{ modelType?: 'pill' | 'dna' | 'stethoscope' }> = ({
  modelType = 'stethoscope'
}) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation loop for rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Handle mouse interaction
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isClicked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePosition({ x, y });
    }
  };

  // Render different models based on the modelType prop
  const renderModel = () => {
    const baseColor = isHovered ? '#ff6b6b' : '#ff8787';
    const secondaryColor = isHovered ? '#4dabf7' : '#339af0';
    const accentColor = '#20c997';

    // Apply interactive transformations
    const transform = `
      rotate(${rotation + (mousePosition.x * 30)}deg)
      scale(${isClicked ? 1.1 : scale})
      translateX(${mousePosition.x * 20}px)
      translateY(${mousePosition.y * 20}px)
    `;

    switch (modelType) {
      case 'pill':
        return (
          <g transform={transform} style={{ transformOrigin: 'center' }}>
            {/* Pill body */}
            <ellipse cx="100" cy="100" rx="30" ry="80" fill={baseColor} />

            {/* Pill divider */}
            <line x1="70" y1="100" x2="130" y2="100" stroke="white" strokeWidth="4" />

            {/* Pill highlights */}
            <ellipse cx="100" cy="100" rx="20" ry="70" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <ellipse cx="90" cy="70" rx="8" ry="15" fill="rgba(255,255,255,0.3)" />
          </g>
        );

      case 'dna':
        return (
          <g transform={transform} style={{ transformOrigin: 'center' }}>
            {/* DNA strands */}
            {Array.from({ length: 10 }).map((_, i) => {
              const y = 40 + i * 20;
              const offset = Math.sin((rotation + i * 36) * Math.PI / 180) * 30;

              return (
                <g key={i}>
                  {/* Left strand */}
                  <circle cx={70 + offset} cy={y} r="8" fill={baseColor} />

                  {/* Right strand */}
                  <circle cx={130 - offset} cy={y} r="8" fill={secondaryColor} />

                  {/* Connecting line (base pair) */}
                  {i % 2 === 0 && (
                    <line
                      x1={70 + offset}
                      y1={y}
                      x2={130 - offset}
                      y2={y}
                      stroke="#dee2e6"
                      strokeWidth="3"
                    />
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'stethoscope':
      default:
        return (
          <g transform={transform} style={{ transformOrigin: 'center' }}>
            {/* Stethoscope head */}
            <circle cx="100" cy="150" r="25" fill="#495057" />
            <circle cx="100" cy="150" r="20" fill="#e9ecef" />

            {/* Stethoscope tube */}
            <path
              d={`
                M100,150
                Q70,120 70,80
                Q70,50 50,50
                Q30,50 30,70
              `}
              fill="none"
              stroke={accentColor}
              strokeWidth="8"
              strokeLinecap="round"
            />

            <path
              d={`
                M100,150
                Q130,120 130,80
                Q130,50 150,50
                Q170,50 170,70
              `}
              fill="none"
              stroke={accentColor}
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Earpieces */}
            <circle cx="30" cy="70" r="10" fill="#495057" />
            <circle cx="170" cy="70" r="10" fill="#495057" />

            {/* Highlights */}
            <circle cx="90" cy="140" r="5" fill="rgba(255,255,255,0.3)" />
          </g>
        );
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50 rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
    >
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full max-w-[300px] max-h-[300px] transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
      >
        <defs>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(32, 201, 151, 0.3)" />
            <stop offset="100%" stopColor="rgba(32, 201, 151, 0)" />
          </radialGradient>
        </defs>

        {/* Background glow effect */}
        <circle cx="100" cy="100" r="80" fill="url(#glowGradient)" />

        {/* Render the selected model */}
        {renderModel()}
      </svg>
    </div>
  );
};

export default MedicalModel;
