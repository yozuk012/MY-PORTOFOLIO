"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeMute,
  FaVolumeUp,
  FaChevronRight,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";

const getTitle = (s) => s?.title || s?.name || s?.song_title || "Untitled";
const getArtist = (s) => s?.artist || s?.artist_name || s?.author || "";

const iconBtn = "p-2 text-text-muted hover:text-accent transition-colors font-mono text-xs";

export default function MiniPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  const songsRef = useRef([]);
  const activeRef = useRef(null);

  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { activeRef.current = activeSong; }, [activeSong]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { createClient } = await import("@/lib/client");
        const supabase = createClient();
        const { data } = await supabase.from("featured_songs").select("*").order("order_index");
        const list = data || [];
        const active = list.find((s) => s.is_active) || list[0] || null;
        setSongs(list.map((s) => ({ ...s, is_active: s.id === active?.id })));
        setActiveSong(active);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    const handleSongChange = (e) => {
      const { activeSong: newSong, isMuted: muted } = e.detail || {};
      if (newSong && newSong.id !== activeRef.current?.id) {
        setActiveSong(newSong);
        setSongs((prev) => prev.map((s) => ({ ...s, is_active: s.id === newSong.id })));
      }
      setIsMuted(!!muted);
    };
    window.addEventListener("spectrum-song-change", handleSongChange);
    return () => window.removeEventListener("spectrum-song-change", handleSongChange);
  }, []);

  const playSong = useCallback((song) => {
    if (!song) return;
    setSongs((prev) => prev.map((s) => ({ ...s, is_active: s.id === song.id })));
    setActiveSong(song);
    setIsPlaying(true);
    setIsMuted(false);
    window.dispatchEvent(new CustomEvent("spectrum-change-song", { detail: { song, autoplay: true } }));
  }, []);

  const step = useCallback((dir) => {
    const list = songsRef.current;
    if (!list.length) return;
    const i = list.findIndex((s) => s.id === activeRef.current?.id);
    playSong(list[(i + dir + list.length) % list.length]);
  }, [playSong]);

  useEffect(() => {
    const onEnded = () => step(1);
    const onPlayState = (e) => setIsPlaying(!!e.detail?.isPlaying);
    window.addEventListener("spectrum-song-ended", onEnded);
    window.addEventListener("spectrum-playstate", onPlayState);
    return () => {
      window.removeEventListener("spectrum-song-ended", onEnded);
      window.removeEventListener("spectrum-playstate", onPlayState);
    };
  }, [step]);

  const handlePlayPause = () => {
    window.dispatchEvent(new CustomEvent("spectrum-control", { detail: { action: isPlaying ? "pause" : "play" } }));
    setIsPlaying(!isPlaying);
  };

  const handleToggleMute = () => {
    window.dispatchEvent(new CustomEvent("spectrum-control", { detail: { action: "toggleMute" } }));
    setIsMuted(!isMuted);
  };

  if (loading || songs.length === 0) return null;

  return (
    <div
      className="fixed left-0 top-1/2 z-50 flex items-center transition-transform duration-300 ease-out"
      style={{ transform: `translateY(-50%) translateX(${isExpanded ? "0px" : "calc(-18rem)"})` }}
    >
      <aside
        className={`w-72 bg-background border border-border/80 flex flex-col rounded-r-none ${
          isExpanded ? "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]" : ""
        }`}
      >
        <div className="p-4 flex-1">
          {/* Header Terminal */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-main bg-surface px-2 py-0.5 border border-border/50">
              [ PLAYLIST.SYS ]
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              {songs.length} items
            </span>
          </div>

          {/* === KARTU JUDUL LAGU (TERMINAL STYLE) === */}
          {activeSong && (
            <div className="mb-5 bg-surface border border-border/60 p-3">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/40">
                <span className="text-[10px] font-mono text-accent">
                  {isPlaying ? "> NOW_PLAYING" : "> PAUSED"}
                </span>
                <span className="text-[9px] font-mono text-text-muted">
                  [ {isMuted ? "MUTE" : "AUDIO"} ]
                </span>
              </div>
              <h3 className="text-sm font-mono font-bold text-text-main truncate uppercase">
                {getTitle(activeSong)}
              </h3>
              <p className="text-[11px] font-mono text-text-muted truncate mt-1">
                by: {getArtist(activeSong)}
              </p>
            </div>
          )}

          {/* List Lagu */}
          <ul className="space-y-1 max-h-52 overflow-y-auto no-scrollbar">
            {songs.map((song, index) => (
              <li key={song.id}>
                <button
                  onClick={() => playSong(song)}
                  className={`w-full text-left px-2 py-1.5 border flex items-center gap-2 transition-colors ${
                    song.is_active 
                      ? "border-accent/50 bg-accent/5 text-accent" 
                      : "border-transparent text-text-muted hover:border-border/50 hover:text-text-main"
                  }`}
                >
                  <span className="font-mono text-[10px]">
                    {song.is_active ? "*" : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 min-w-0 font-mono text-[11px] truncate">
                    {getTitle(song)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Controls Terminal */}
        <div className="p-3 border-t border-border/80 bg-surface/30 flex items-center justify-between">
          <button onClick={handleToggleMute} className={iconBtn}>
            {isMuted ? "UNMUTE" : "MUTE"}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => step(-1)} className={iconBtn}><FaStepBackward className="w-3 h-3" /></button>
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 border border-accent flex items-center justify-center text-accent hover:bg-accent hover:text-background transition-colors"
            >
              {isPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3 translate-x-px" />}
            </button>
            <button onClick={() => step(1)} className={iconBtn}><FaStepForward className="w-3 h-3" /></button>
          </div>
          <span className="w-10" />
        </div>
      </aside>

      {/* Tab Pembuka Terminal */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="h-14 w-8 flex items-center justify-center border-y border-r border-border/80 bg-background hover:bg-surface text-text-muted hover:text-accent transition-colors"
      >
        <span className="font-mono text-[10px] rotate-90 tracking-widest">
          {isExpanded ? "CLOSE" : "OPEN"}
        </span>
      </button>
    </div>
  );
}