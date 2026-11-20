"use client";

import { useEffect, useRef, useState } from "react";

// Blob ambient: 4 bercak warna besar & lembut di sudut-sudut layar.
// Posisi statis (aman untuk SSR); gerakan dilakukan lewat CSS keyframes.
// o = opacity tema terang, od = opacity tema gelap.
const BLOBS = [
  { // kiri atas
    style: { left: "-20vmax", top: "-22vmax" },
    color: "var(--vibe-2)", o: 0.22, od: 0.26, anim: "a", dur: 1.5, delay: 0,
  },
  { // kanan atas
    style: { right: "-22vmax", top: "-26vmax" },
    color: "var(--vibe-1)", o: 0.16, od: 0.38, anim: "b", dur: 1.9, delay: -6,
  },
  { // kanan bawah (glow utama)
    style: { right: "-8vmax", bottom: "-28vmax" },
    color: "var(--vibe-2)", o: 0.34, od: 0.4, anim: "c", dur: 1.3, delay: -3,
  },
  { // kiri bawah
    style: { left: "-24vmax", bottom: "-22vmax" },
    color: "var(--vibe-3)", o: 0.26, od: 0.3, anim: "d", dur: 1.7, delay: -9,
  },
];

export default function SpectrumBackground({ activeSong }) {
  const hostRef = useRef(null); // wrapper statis (dikelola React)
  const playerRef = useRef(null); // instance YT.Player
  const hasPlayedOnce = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false); // spectrum hanya tampil saat true
  const [currentSong, setCurrentSong] = useState(activeSong);

  // Sync dari props (server -> client)
  useEffect(() => {
    if (activeSong) setCurrentSong(activeSong);
  }, [activeSong?.id]);

  // 1. Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT?.Player) {
      setIsReady(true);
      return;
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      setIsReady(true);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // 2. Buat YT.Player (div dibuat manual agar aman dari reconciliation React)
  useEffect(() => {
    if (!isReady || !hostRef.current || !currentSong?.youtube_id) return;
    if (playerRef.current) return;

    const mount = document.createElement("div");
    hostRef.current.appendChild(mount);

    const player = new window.YT.Player(mount, {
      videoId: currentSong.youtube_id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          try {
            e.target.mute(); // default muted (kebijakan autoplay browser)
          } catch {}
        },
        onStateChange: (e) => {
          const S = window.YT.PlayerState;
          if (e.data === S.ENDED) {
            setIsPlaying(false);
            window.dispatchEvent(new CustomEvent("spectrum-song-ended"));
          } else if (e.data === S.PLAYING) {
            setIsPlaying(true);
            window.dispatchEvent(
              new CustomEvent("spectrum-playstate", { detail: { isPlaying: true } })
            );
          } else if (e.data === S.PAUSED) {
            setIsPlaying(false);
            window.dispatchEvent(
              new CustomEvent("spectrum-playstate", { detail: { isPlaying: false } })
            );
          }
        },
      },
    });

    playerRef.current = player;

    return () => {
      try {
        player.destroy();
      } catch {}
      playerRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
    // Player dibuat sekali; lagu berikutnya lewat loadVideoById
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, !!currentSong?.youtube_id]);

  // 3. Kontrol play / pause / mute dari MiniPlayer
  useEffect(() => {
    const handleControl = (e) => {
      const { action } = e.detail || {};
      const player = playerRef.current;
      if (!player || typeof player.playVideo !== "function") return;

      try {
        if (action === "play") {
          if (!hasPlayedOnce.current) {
            player.unMute();
            player.setVolume(100);
            hasPlayedOnce.current = true;
            setIsMuted(false);
          }
          player.playVideo();
        } else if (action === "pause") {
          player.pauseVideo();
        } else if (action === "toggleMute") {
          hasPlayedOnce.current = true;
          if (player.isMuted()) {
            player.unMute();
            player.setVolume(100);
            setIsMuted(false);
          } else {
            player.mute();
            setIsMuted(true);
          }
        }
      } catch (err) {
        console.warn("Player control error:", err);
      }
    };
    window.addEventListener("spectrum-control", handleControl);
    return () => window.removeEventListener("spectrum-control", handleControl);
  }, []);

  // 4. Ganti lagu dari MiniPlayer (termasuk auto-next)
  useEffect(() => {
    const handleChangeSong = (e) => {
      const { song, autoplay } = e.detail || {};
      if (!song?.youtube_id) return;
      setCurrentSong(song);

      const player = playerRef.current;
      if (!player || typeof player.loadVideoById !== "function") return;

      try {
        if (autoplay) {
          player.unMute();
          player.setVolume(100);
          player.loadVideoById(song.youtube_id);
          hasPlayedOnce.current = true;
          setIsMuted(false);
        } else {
          player.cueVideoById(song.youtube_id);
        }
      } catch (err) {
        console.warn("Change song error:", err);
      }
    };
    window.addEventListener("spectrum-change-song", handleChangeSong);
    return () =>
      window.removeEventListener("spectrum-change-song", handleChangeSong);
  }, []);

  // 5. Broadcast state ke MiniPlayer
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("spectrum-song-change", {
        detail: { activeSong: currentSong, isMuted },
      })
    );
  }, [currentSong?.id, isMuted]);

  if (!currentSong) return null;

  // ====== Styling ======
  const speedMap = { slow: 20, normal: 10, fast: 5 };
  const amplitudeMap = { low: 20, medium: 40, high: 80 };
  const duration = speedMap[currentSong.wave_speed] || 20;
  const amplitude = amplitudeMap[currentSong.wave_amplitude] || 20;

  const vibeStyle = {
    "--vibe-1": currentSong.vibe_1 || "#0F172A",
    "--vibe-2": currentSong.vibe_2 || "#3B82F6",
    "--vibe-3": currentSong.vibe_3 || "#A5B4FC",
    "--wave-duration": `${duration}s`,
  };

  // Jarak gerak mengikuti wave_amplitude; kecepatan mengikuti wave_speed (min 10s)
  const k = (amplitude / 40).toFixed(2);
  const driftBase = Math.max(duration, 10);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        ...vibeStyle,
        "--k": k,
        // Warna berganti mulus saat lagu diganti (lihat @property di bawah)
        transition:
          "--vibe-1 1600ms ease, --vibe-2 1600ms ease, --vibe-3 1600ms ease",
      }}
      aria-hidden="true"
    >
      {/* Keyframes lokal: tidak bergantung pada tailwind.config */}
      <style>{`
        @property --vibe-1 { syntax: "<color>"; inherits: true; initial-value: #0F172A; }
        @property --vibe-2 { syntax: "<color>"; inherits: true; initial-value: #3B82F6; }
        @property --vibe-3 { syntax: "<color>"; inherits: true; initial-value: #A5B4FC; }

        @keyframes sb-drift-a {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to   { transform: translate3d(calc(9vw * var(--k)), calc(10vh * var(--k)), 0) scale(1.15); }
        }
        @keyframes sb-drift-b {
          from { transform: translate3d(0, 0, 0) scale(1.05); }
          to   { transform: translate3d(calc(-10vw * var(--k)), calc(8vh * var(--k)), 0) scale(1); }
        }
        @keyframes sb-drift-c {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to   { transform: translate3d(calc(-12vw * var(--k)), calc(-8vh * var(--k)), 0) scale(1.2); }
        }
        @keyframes sb-drift-d {
          from { transform: translate3d(0, 0, 0) scale(1.1); }
          to   { transform: translate3d(calc(10vw * var(--k)), calc(-9vh * var(--k)), 0) scale(1); }
        }
        .sb-blob {
          opacity: var(--o);
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        .dark .sb-blob { opacity: var(--od); }
        .sb-blob-a { animation-name: sb-drift-a; }
        .sb-blob-b { animation-name: sb-drift-b; }
        .sb-blob-c { animation-name: sb-drift-c; }
        .sb-blob-d { animation-name: sb-drift-d; }
        @media (prefers-reduced-motion: reduce) {
          .sb-blob { animation: none; }
        }
      `}</style>

      {/* Ambient mesh: hanya tampil saat lagu SEDANG DIPUTAR */}
      <div
        className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: isPlaying ? 1 : 0 }}
      >
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className={`sb-blob sb-blob-${b.anim} absolute rounded-full`}
            style={{
              ...b.style,
              width: "62vmax",
              height: "62vmax",
              background: `radial-gradient(closest-side, ${b.color} 0%, transparent 100%)`,
              "--o": b.o,
              "--od": b.od,
              animationDuration: `${(driftBase * b.dur).toFixed(1)}s`,
              animationDelay: `${b.delay}s`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Host YouTube Player (iframe dibuat manual di dalam sini) */}
      <div
        ref={hostRef}
        className="absolute -left-[9999px] top-0 w-[200px] h-[200px] opacity-0"
      />
    </div>
  );
}