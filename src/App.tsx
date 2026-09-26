import { useState, useEffect, useRef, useCallback } from 'react';

interface PlanetData {
  name: string;
  nameRu: string;
  radius: number;
  orbitRadius: number;
  orbitalPeriod: number;
  realRadius: string;
  distanceFromSun: string;
  orbitalPeriodText: string;
  color: string;
  description: string;
  angle: number;
}

const PLANETS_DATA: Omit<PlanetData, 'angle'>[] = [
  {
    name: 'Mercury',
    nameRu: 'Меркурий',
    radius: 4,
    orbitRadius: 60,
    orbitalPeriod: 88,
    realRadius: '2 439 км',
    distanceFromSun: '57,9 млн км',
    orbitalPeriodText: '88 дней',
    color: '#b5b5b5',
    description: 'Самая маленькая и ближайшая к Солнцу планета.',
  },
  {
    name: 'Venus',
    nameRu: 'Венера',
    radius: 7,
    orbitRadius: 95,
    orbitalPeriod: 225,
    realRadius: '6 052 км',
    distanceFromSun: '108,2 млн км',
    orbitalPeriodText: '225 дней',
    color: '#e8cda0',
    description: 'Самая горячая планета с плотной атмосферой из CO₂.',
  },
  {
    name: 'Earth',
    nameRu: 'Земля',
    radius: 8,
    orbitRadius: 135,
    orbitalPeriod: 365,
    realRadius: '6 371 км',
    distanceFromSun: '149,6 млн км',
    orbitalPeriodText: '365,25 дней',
    color: '#4da6ff',
    description: 'Наш дом — единственная известная планета с жизнью.',
  },
  {
    name: 'Mars',
    nameRu: 'Марс',
    radius: 5,
    orbitRadius: 175,
    orbitalPeriod: 687,
    realRadius: '3 390 км',
    distanceFromSun: '227,9 млн км',
    orbitalPeriodText: '687 дней',
    color: '#e07040',
    description: 'Красная планета с самой высокой горой в Солнечной системе.',
  },
  {
    name: 'Jupiter',
    nameRu: 'Юпитер',
    radius: 18,
    orbitRadius: 240,
    orbitalPeriod: 4333,
    realRadius: '69 911 км',
    distanceFromSun: '778,5 млн км',
    orbitalPeriodText: '11,86 лет',
    color: '#d4a574',
    description: 'Крупнейшая планета — газовый гигант с Большим красным пятном.',
  },
  {
    name: 'Saturn',
    nameRu: 'Сатурн',
    radius: 15,
    orbitRadius: 310,
    orbitalPeriod: 10759,
    realRadius: '58 232 км',
    distanceFromSun: '1 434 млн км',
    orbitalPeriodText: '29,46 лет',
    color: '#e8d5a0',
    description: 'Знаменита своими кольцами из льда и камней.',
  },
  {
    name: 'Uranus',
    nameRu: 'Уран',
    radius: 11,
    orbitRadius: 370,
    orbitalPeriod: 30687,
    realRadius: '25 362 км',
    distanceFromSun: '2 871 млн км',
    orbitalPeriodText: '84,01 лет',
    color: '#7de8e8',
    description: 'Ледяной гигант, вращающийся «на боку».',
  },
  {
    name: 'Neptune',
    nameRu: 'Нептун',
    radius: 10,
    orbitRadius: 420,
    orbitalPeriod: 60190,
    realRadius: '24 622 км',
    distanceFromSun: '4 495 млн км',
    orbitalPeriodText: '164,8 лет',
    color: '#4060e0',
    description: 'Самая далёкая планета с сильнейшими ветрами до 2100 км/ч.',
  },
];

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
  const b = Math.max(0, (num & 0x0000ff) - percent);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const planetsRef = useRef<PlanetData[]>(
    PLANETS_DATA.map(p => ({ ...p, angle: Math.random() * Math.PI * 2 }))
  );
  const lastTimeRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const hoveredRef = useRef(hoveredPlanet);
  const selectedRef = useRef(selectedPlanet);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { hoveredRef.current = hoveredPlanet; }, [hoveredPlanet]);
  useEffect(() => { selectedRef.current = selectedPlanet; }, [selectedPlanet]);

  // Generate stars
  const generateStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    const count = Math.floor((width * height) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
      });
    }
    starsRef.current = stars;
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      generateStars(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generateStars]);

  // Animation loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Update planet angles
      if (isPlayingRef.current) {
        planetsRef.current.forEach(planet => {
          const angularSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 60);
          planet.angle += angularSpeed * deltaTime * speedRef.current;
        });
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const currentHovered = hoveredRef.current;
      const currentSelected = selectedRef.current;

      // Clear
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);

      // Draw stars with twinkle
      const time = timestamp * 0.001;
      starsRef.current.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 1000);
        const opacity = star.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      // Sun outer glow
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
      sunGlow.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
      sunGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.1)');
      sunGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fillStyle = sunGlow;
      ctx.fill();

      // Sun body
      const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.2, '#fffde0');
      sunGrad.addColorStop(0.5, '#ffcc00');
      sunGrad.addColorStop(0.8, '#ff9900');
      sunGrad.addColorStop(1, '#ff6600');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Draw orbits
      planetsRef.current.forEach(planet => {
        const isActive = currentHovered === planet.name || currentSelected?.name === planet.name;
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isActive
          ? 'rgba(255, 255, 255, 0.35)'
          : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isActive ? 1.5 : 0.7;
        ctx.setLineDash(isActive ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw planets
      planetsRef.current.forEach(planet => {
        const px = centerX + Math.cos(planet.angle) * planet.orbitRadius;
        const py = centerY + Math.sin(planet.angle) * planet.orbitRadius;
        const isActive = currentHovered === planet.name || currentSelected?.name === planet.name;

        // Planet glow
        if (isActive) {
          const glow = ctx.createRadialGradient(px, py, planet.radius, px, py, planet.radius * 3);
          glow.addColorStop(0, planet.color + '60');
          glow.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(px, py, planet.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Planet body
        const planetGrad = ctx.createRadialGradient(
          px - planet.radius * 0.3, py - planet.radius * 0.3, 0,
          px, py, planet.radius
        );
        planetGrad.addColorStop(0, lightenColor(planet.color, 60));
        planetGrad.addColorStop(0.7, planet.color);
        planetGrad.addColorStop(1, darkenColor(planet.color, 40));
        ctx.beginPath();
        ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planetGrad;
        ctx.fill();

        // Saturn rings
        if (planet.name === 'Saturn') {
          ctx.beginPath();
          ctx.ellipse(px, py, planet.radius * 2.2, planet.radius * 0.5, -0.3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(210, 180, 120, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(px, py, planet.radius * 1.8, planet.radius * 0.4, -0.3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(180, 150, 100, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Earth moon
        if (planet.name === 'Earth') {
          const moonAngle = planet.angle * 13;
          const moonDist = planet.radius + 8;
          const mx = px + Math.cos(moonAngle) * moonDist;
          const my = py + Math.sin(moonAngle) * moonDist;
          ctx.beginPath();
          ctx.arc(mx, my, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#cccccc';
          ctx.fill();
        }

        // Jupiter bands
        if (planet.name === 'Jupiter') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
          ctx.clip();
          for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(px - planet.radius, py + i * 5);
            ctx.lineTo(px + planet.radius, py + i * 5);
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(180, 120, 60, 0.3)' : 'rgba(200, 160, 100, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          // Great Red Spot
          ctx.beginPath();
          ctx.ellipse(px + 5, py + 3, 4, 3, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200, 80, 50, 0.5)';
          ctx.fill();
          ctx.restore();
        }

        // Planet label
        if (isActive) {
          ctx.font = 'bold 12px Arial, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(planet.nameRu, px, py - planet.radius - 10);
          ctx.shadowBlur = 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getCenter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (canvas.width / dpr) / 2,
      y: (canvas.height / dpr) / 2,
    };
  };

  const findPlanetAt = (x: number, y: number): PlanetData | null => {
    const center = getCenter();
    for (const planet of planetsRef.current) {
      const px = center.x + Math.cos(planet.angle) * planet.orbitRadius;
      const py = center.y + Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= planet.radius + 8) {
        return { ...planet };
      }
    }
    return null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const planet = findPlanetAt(x, y);
    setSelectedPlanet(planet);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);
    const planet = findPlanetAt(x, y);

    if (planet) {
      setHoveredPlanet(planet.name);
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredPlanet(null);
      canvas.style.cursor = 'default';
    }
  };

  return (
    <div className="w-full h-screen bg-[#050510] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#0a1628] to-[#1a1040] border-b border-white/10 px-6 py-3 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <span className="text-3xl">☀️</span>
          <span>Интерактивная Солнечная система</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Нажмите на планету, чтобы узнать подробности</p>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas Container */}
        <div ref={containerRef} className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="absolute inset-0"
          />

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 bg-black/70 backdrop-blur-md rounded-full px-4 md:px-6 py-3 border border-white/10 z-10">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              title={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2l10 6-10 6V2z" />
                </svg>
              )}
            </button>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs hidden md:inline">Скорость:</span>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-20 md:w-28"
              />
              <span className="text-yellow-400 text-sm font-mono w-10 text-center">{speed.toFixed(1)}x</span>
            </div>

            {/* Speed presets */}
            <div className="flex gap-1">
              {[0.5, 1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    speed === s
                      ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {selectedPlanet && (
          <div className="w-80 flex-shrink-0 bg-gradient-to-b from-[#0a1628] to-[#1a1040] border-l border-white/10 p-6 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{selectedPlanet.nameRu}</h2>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Planet visual */}
            <div className="flex justify-center mb-6">
              <div
                className="rounded-full"
                style={{
                  width: `${Math.max(selectedPlanet.radius * 5, 80)}px`,
                  height: `${Math.max(selectedPlanet.radius * 5, 80)}px`,
                  background: `radial-gradient(circle at 35% 35%, ${lightenColor(selectedPlanet.color, 60)}, ${selectedPlanet.color}, ${darkenColor(selectedPlanet.color, 40)})`,
                  boxShadow: `0 0 40px ${selectedPlanet.color}50, 0 0 80px ${selectedPlanet.color}20`,
                }}
              />
            </div>

            <p className="text-gray-300 text-sm mb-6 italic leading-relaxed">{selectedPlanet.description}</p>

            <div className="space-y-3">
              <InfoRow icon="📏" label="Радиус" value={selectedPlanet.realRadius} />
              <InfoRow icon="🌞" label="Расстояние от Солнца" value={selectedPlanet.distanceFromSun} />
              <InfoRow icon="🔄" label="Орбитальный период" value={selectedPlanet.orbitalPeriodText} />
              <InfoRow icon="🌐" label="Название (EN)" value={selectedPlanet.name} />
            </div>

            {/* Planet order */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-gray-500 text-xs mb-3">Порядок от Солнца:</p>
              <div className="flex gap-1.5">
                {PLANETS_DATA.map((p, i) => (
                  <div
                    key={p.name}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                      p.name === selectedPlanet.name
                        ? 'ring-2 ring-yellow-400 scale-110 opacity-100'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{ backgroundColor: p.color + '40', color: p.color }}
                    title={p.nameRu}
                    onClick={() => setSelectedPlanet({ ...p, angle: 0 })}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
      <span className="text-lg mt-0.5">{icon}</span>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default App;
