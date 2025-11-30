import { useEffect, useRef } from 'react';

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    // Check if mobile device for optimization
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 60 : 150;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars - reduce on mobile
    if (starsRef.current.length === 0) {
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: isMobile ? Math.random() * 1 : Math.random() * 1.5,
          opacity: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.02 + 0.002,
        });
      }
    }

    // Initialize planets
    if (planetsRef.current.length === 0) {
      planetsRef.current = [
        { x: canvas.width * 0.15, y: canvas.height * 0.3, radius: 40, color: '#FF6B6B', speed: 0.0002 },
        { x: canvas.width * 0.85, y: canvas.height * 0.7, radius: 60, color: '#4ECDC4', speed: 0.0001 },
        { x: canvas.width * 0.5, y: canvas.height * 0.15, radius: 30, color: '#FFE66D', speed: 0.0003 },
        { x: canvas.width * 0.2, y: canvas.height * 0.8, radius: 50, color: '#A8E6CF', speed: 0.00015 },
      ];
    }

    // Frame skip for mobile optimization
    let frameCount = 0;
    const frameSkip = isMobile ? 2 : 1; // Skip every 2nd frame on mobile

    const animate = () => {
      frameCount++;
      if (frameCount % frameSkip === 0) {
        timeRef.current += 1;

        // Clear with gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f0f1e');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars - reduced animation on mobile
        ctx.fillStyle = '#ffffff';
        starsRef.current.forEach((star) => {
          const pulse = isMobile ? 0.7 : Math.sin(timeRef.current * star.speed) * 0.3 + 0.7;
          ctx.globalAlpha = star.opacity * pulse;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw planets - skip glow and beams on mobile for performance
        if (!isMobile) {
          planetsRef.current.forEach((planet) => {
            // Planet glow
            const glowGradient = ctx.createRadialGradient(planet.x, planet.y, planet.radius * 0.5, planet.x, planet.y, planet.radius * 2);
            glowGradient.addColorStop(0, planet.color + '40');
            glowGradient.addColorStop(1, planet.color + '00');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Planet body
            const planetGradient = ctx.createRadialGradient(planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, planet.radius * 0.3, planet.x, planet.y, planet.radius);
            planetGradient.addColorStop(0, planet.color + 'ff');
            planetGradient.addColorStop(1, planet.color + 'cc');
            ctx.fillStyle = planetGradient;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw connecting energy beams between planets
          ctx.globalAlpha = 0.3;
          for (let i = 0; i < planetsRef.current.length; i++) {
            const p1 = planetsRef.current[i];
            const p2 = planetsRef.current[(i + 1) % planetsRef.current.length];

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            const intensity = Math.sin(timeRef.current * 0.01 + i) * 0.5 + 0.5;

            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, p1.color + Math.floor(intensity * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(0.5, p1.color + Math.floor(intensity * 128).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, p2.color + Math.floor(intensity * 255).toString(16).padStart(2, '0'));

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.quadraticCurveTo(midX + Math.sin(timeRef.current * 0.005 + i) * 30, midY + Math.cos(timeRef.current * 0.005 + i) * 30, p2.x, p2.y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
}
