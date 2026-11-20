"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const faceRef = useRef(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("custom-cursor");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let animationFrameId;

    // Variabel untuk fisika bounce
    let bounceScale = 1;
    let bounceVelocity = 0;

    const onMouseMove = (e) => {
      setIsVisible(true);
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      const target = e.target;
      const interactive = target?.closest?.(
        'a, button, input, textarea, select, [role="button"], [data-cursor="pointer"]'
      );
      setIsHovering(Boolean(interactive));
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    const renderLoop = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      
      // Trailing movement
      ringX += dx * 0.15;
      ringY += dy * 0.15;

      // Jelly stretch calculation
      const distance = Math.sqrt(dx * dx + dy * dy);
      const stretch = Math.min(distance * 0.002, 0.35); 
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // --- BOUNCE PHYSICS (Spring) ---
      const targetBounce = isClicked ? 0.8 : 1.0; // Target: mengecil saat klik, normal saat lepas
      const springForce = (targetBounce - bounceScale) * 0.3; // Kekuatan pegas (stiffness)
      
      bounceVelocity += springForce;
      bounceVelocity *= 0.6; // Redaman (damping). Semakin kecil (misal 0.5), semakin banyak pantulannya
      bounceScale += bounceVelocity;
      // ---------------------------------

      if (ringRef.current) {
        // Kombinasikan stretch (arah gerakan) dengan bounceScale (aksi klik)
        // Saat diklik, kita paksa sedikit melebar (1.15) agar efek "gepeng" lebih terasa
        const finalScaleX = (1 + stretch) * (isClicked ? 1.15 : bounceScale);
        const finalScaleY = (1 - stretch) * bounceScale;

        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${finalScaleX}, ${finalScaleY})`;
        
        // Putar balik wajah agar tetap tegak, tanpa terpengaruh distorsi blob
        if (faceRef.current) {
          faceRef.current.style.transform = `rotate(${-angle}deg)`;
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Titik Presisi: Bintang (Sparkle) Cute */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center text-accent transition-opacity duration-300 ${
          isHovering ? "opacity-0 scale-50" : "opacity-100 scale-100"
        }`}
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* Cincin Pengikut: Blob Jelly Cute dengan Bounce */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9998] flex items-center justify-center border-2 transition-[width,height,border-radius,background-color,border-color] duration-300 ease-out ${
          isHovering
            ? "h-12 w-12 rounded-[45%_55%_50%_50%] border-accent/60 bg-accent/10 backdrop-blur-sm"
            : "h-8 w-8 rounded-full border-accent/40 bg-accent/5"
        }`}
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        {/* Wajah Lucu */}
        <div
          ref={faceRef}
          className={`flex items-center gap-1.5 transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Mata Kiri */}
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          
          {/* Mulut: Berubah jadi 'O' kecil saat diklik (bounce) */}
          {isClicked ? (
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          ) : (
            <div className="w-2 h-1 border-b-[2px] border-accent rounded-b-full" />
          )}
          
          {/* Mata Kanan */}
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
      </div>
    </>
  );
}