"use client";

import { useEffect, useRef, useState } from "react";
import {
  ListMusic,
  Maximize2,
  Minimize2,
  MessageSquare,
  Pause,
  Play,
  Repeat2,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";

import { songs } from "@/data/songs";
import ChatPanel from "@/components/ChatPanel";

type RepeatMode = "off" | "all" | "one";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isChatOpen, setIsChatOpen] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  // Playlist is OPEN by default
  const [isLibraryOpen, setIsLibraryOpen] =
    useState(true);

  const [shuffle, setShuffle] = useState(false);

  // off → all → one → off
  const [repeatMode, setRepeatMode] =
    useState<RepeatMode>("off");

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const repeatModeRef = useRef<RepeatMode>("off");
  const shuffleRef = useRef(false);
  const currentSongRef = useRef(0);

  const song = songs[currentSong];

  // --------------------------------------------------
  // KEEP REFS UPDATED
  // --------------------------------------------------

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  // --------------------------------------------------
  // AUDIO ANALYZER
  // --------------------------------------------------

  const setupAudioAnalyzer = () => {
    if (!audioRef.current || audioContextRef.current) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    const analyser = context.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = context.createMediaElementSource(
      audioRef.current
    );

    source.connect(analyser);
    analyser.connect(context.destination);

    audioContextRef.current = context;
    analyserRef.current = analyser;
    sourceRef.current = source;

    startVisualizer();
  };

  // --------------------------------------------------
  // CIRCULAR AUDIO VISUALIZER
  // --------------------------------------------------

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Center of the circular visualizer
      const centerX = width / 2;
      const centerY = height / 2;

      // Distance from headphone to spectrum
      const baseRadius = Math.min(width, height) * 0.35;

      // Number of visible bars
      const barCount = 96;

      for (let i = 0; i < barCount; i++) {
        // Spread bars around complete circle
        const angle = (i / barCount) * Math.PI * 2;

        // Sample frequency data
        const dataIndex = Math.floor(
          (i / barCount) * (bufferLength * 0.75)
        );

        const value = dataArray[dataIndex] || 0;

        // Make the movement more noticeable
        const normalized = value / 255;

        const barLength =
          12 + Math.pow(normalized, 0.7) * 75;

        const innerRadius = baseRadius;
        const outerRadius =
          baseRadius + barLength;

        const x1 =
          centerX + Math.cos(angle) * innerRadius;
        const y1 =
          centerY + Math.sin(angle) * innerRadius;

        const x2 =
          centerX + Math.cos(angle) * outerRadius;
        const y2 =
          centerY + Math.sin(angle) * outerRadius;

        // White spectrum bars
        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        ctx.stroke();
      }
    };

    draw();
  };

  // --------------------------------------------------
  // PLAY / PAUSE
  // --------------------------------------------------

  const togglePlay = async () => {
    if (!audioRef.current) return;

    setupAudioAnalyzer();

    if (
      audioContextRef.current?.state ===
      "suspended"
    ) {
      await audioContextRef.current.resume();
    }

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // --------------------------------------------------
  // PLAY SONG
  // --------------------------------------------------

  const playSong = async (index: number) => {
    if (!audioRef.current) return;

    setCurrentSong(index);
    setProgress(0);

    setTimeout(async () => {
      if (!audioRef.current) return;

      audioRef.current.load();

      try {
        if (
          audioContextRef.current?.state ===
          "suspended"
        ) {
          await audioContextRef.current.resume();
        }

        await audioRef.current.play();

        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }, 50);
  };

  // --------------------------------------------------
  // NEXT SONG
  // --------------------------------------------------

  const nextSong = () => {
    let nextIndex: number;

    if (
      shuffleRef.current &&
      songs.length > 1
    ) {
      nextIndex = Math.floor(
        Math.random() * songs.length
      );

      while (
        nextIndex === currentSongRef.current
      ) {
        nextIndex = Math.floor(
          Math.random() * songs.length
        );
      }
    } else {
      nextIndex =
        currentSongRef.current ===
          songs.length - 1
          ? 0
          : currentSongRef.current + 1;
    }

    playSong(nextIndex);
  };

  // --------------------------------------------------
  // PREVIOUS SONG
  // --------------------------------------------------

  const previousSong = () => {
    const previousIndex =
      currentSongRef.current === 0
        ? songs.length - 1
        : currentSongRef.current - 1;

    playSong(previousIndex);
  };

  // --------------------------------------------------
  // AUDIO EVENTS
  // --------------------------------------------------

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      const mode = repeatModeRef.current;

      // Repeat ONE song
      if (mode === "one") {
        audio.currentTime = 0;

        audio.play().catch(() => {
          setIsPlaying(false);
        });

        return;
      }

      // Repeat ALL playlist
      if (mode === "all") {
        nextSong();
        return;
      }

      // Normal mode
      if (
        currentSongRef.current <
        songs.length - 1
      ) {
        nextSong();
      } else {
        // End of playlist
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener(
      "timeupdate",
      updateProgress
    );

    audio.addEventListener(
      "loadedmetadata",
      updateDuration
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        updateProgress
      );

      audio.removeEventListener(
        "loadedmetadata",
        updateDuration
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, []);

  // --------------------------------------------------
  // VOLUME
  // --------------------------------------------------

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      audioContextRef.current?.close();
    };
  }, []);

  // --------------------------------------------------
  // SEEK
  // --------------------------------------------------

  const seek = (value: number) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = value;

    setProgress(value);
  };

  // --------------------------------------------------
  // REPEAT BUTTON
  // --------------------------------------------------

  const cycleRepeat = () => {
    setRepeatMode((current) => {
      if (current === "off") {
        return "all";
      }

      if (current === "all") {
        return "one";
      }

      return "off";
    });
  };

  // --------------------------------------------------
  // REPEAT LABEL
  // --------------------------------------------------

  const repeatLabel = {
    off: "Repeat Off",
    all: "Repeat All",
    one: "Repeat One",
  }[repeatMode];

  // --------------------------------------------------
  // FORMAT TIME
  // --------------------------------------------------

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };
  // --------------------------------------------------
  // FULLSCREEN
  // --------------------------------------------------

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      {/* ============================================
          LEFT SIDE VISUALIZER
      ============================================ */}

      <div className="pointer-events-none absolute inset-0 z-10">

        <div
          className="
    absolute
    left-[4%]
    top-[35%]
    flex
    aspect-square
    w-[57vw]
    max-w-[780px]
    -translate-y-1/2
    items-center
    justify-center
  "
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={800}
            className="h-full w-full opacity-90"
          />
        </div>

      </div>
      {/* ============================================
    CHAT PANEL
============================================ */}

      {isChatOpen && (
        <ChatPanel
          onClose={() =>
            setIsChatOpen(false)
          }
        />
      )}

      {/* ============================================
          RIGHT MUSIC PANEL
      ============================================ */}

      <aside
        className="
    absolute
    right-0
    top-0
    z-30
    flex
    h-full
    w-full
    flex-col
    bg-[#0b151b]/80
    text-[var(--foreground)]
    backdrop-blur-2xl
    lg:w-[30%]
  "
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="flex shrink-0 items-center justify-between px-5 py-4 md:px-6">

          <div>

            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
              Now Playing
            </p>

            <p className="mt-1 text-xs text-white/60">
              Music Experience
            </p>

          </div>


          <div className="flex items-center gap-1">

            <button
              type="button"
              onClick={() =>
                setIsChatOpen(
                  (current) => !current
                )
              }
              className={`
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-full
    transition
    ${isChatOpen
                  ? "bg-white text-black"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
                }
  `}
              aria-label={
                isChatOpen
                  ? "Close chat"
                  : "Open chat"
              }
            >
              <MessageSquare size={17} />
            </button>


            <button
              type="button"
              onClick={toggleFullscreen}
              className="
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-full
    text-white/50
    transition
    hover:bg-white/10
    hover:text-white
  "
              aria-label={
                isFullscreen
                  ? "Exit fullscreen"
                  : "Enter fullscreen"
              }
              title={
                isFullscreen
                  ? "Exit fullscreen"
                  : "Fullscreen"
              }
            >
              {isFullscreen ? (
                <X size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
            </button>

          </div>

        </div>


        {/* ==========================================
            PLAYER SECTION
        ========================================== */}

        <div
          className="
            shrink-0
            px-5
            pb-5
            md:px-6
          "
        >

          {/* COVER */}

          <div className="mx-auto w-full max-w-[270px]">

            <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/10 bg-white/5 shadow-2xl">

              <img
                src={song.cover}
                alt={song.title}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            </div>

          </div>


          {/* SONG INFORMATION */}

          <div className="mt-4 flex items-center justify-between gap-3">

            <div className="min-w-0">

              <h1 className="truncate text-lg font-semibold">

                {song.title}

              </h1>

              <p className="mt-0.5 truncate text-sm text-white/45">

                {song.artist}

              </p>

            </div>


            {/* SMALL EQUALIZER */}

            {isPlaying && (

              <div className="flex h-6 items-end gap-[3px]">

                <span className="h-2 w-[3px] animate-pulse rounded-full bg-white" />

                <span className="h-5 w-[3px] animate-pulse rounded-full bg-white" />

                <span className="h-3 w-[3px] animate-pulse rounded-full bg-white" />

                <span className="h-6 w-[3px] animate-pulse rounded-full bg-white" />

              </div>

            )}

          </div>


          {/* PROGRESS */}

          <div className="mt-4">

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(event) =>
                seek(
                  Number(event.target.value)
                )
              }
              className="w-full cursor-pointer accent-white"
            />

            <div className="mt-1 flex justify-between text-[11px] text-white/35">

              <span>
                {formatTime(progress)}
              </span>

              <span>
                {formatTime(duration)}
              </span>

            </div>

          </div>


          {/* CONTROLS */}

          <div className="mt-4 flex items-center justify-between">

            {/* REPEAT */}

            <button
              onClick={cycleRepeat}
              title={repeatLabel}
              aria-label={repeatLabel}
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                transition
                ${repeatMode !== "off"
                  ? "bg-white text-black"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
                }
              `}
            >

              {repeatMode === "one" ? (
                <Repeat1 size={17} />
              ) : (
                <Repeat2 size={17} />
              )}

            </button>


            {/* SHUFFLE */}

            <button
              onClick={() =>
                setShuffle(!shuffle)
              }
              title={
                shuffle
                  ? "Shuffle On"
                  : "Shuffle Off"
              }
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                transition
                ${shuffle
                  ? "bg-white text-black"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
                }
              `}
            >

              <Shuffle size={17} />

            </button>


            {/* PREVIOUS */}

            <button
              onClick={previousSong}
              className="flex h-9 w-9 items-center justify-center text-white/75 transition hover:scale-110 hover:text-white"
              aria-label="Previous"
            >

              <SkipBack size={20} />

            </button>


            {/* PLAY */}

            <button
              onClick={togglePlay}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105"
              aria-label={
                isPlaying
                  ? "Pause"
                  : "Play"
              }
            >

              {isPlaying ? (
                <Pause
                  size={23}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={23}
                  fill="currentColor"
                />
              )}

            </button>


            {/* NEXT */}

            <button
              onClick={nextSong}
              className="flex h-9 w-9 items-center justify-center text-white/75 transition hover:scale-110 hover:text-white"
              aria-label="Next"
            >

              <SkipForward size={20} />

            </button>


            {/* VOLUME */}

            <div className="hidden items-center gap-2 xl:flex">

              <Volume2
                size={16}
                className="text-white/50"
              />

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) =>
                  setVolume(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-16 accent-white"
              />

            </div>

          </div>


          {/* LIBRARY TOGGLE */}

          <button
            onClick={() =>
              setIsLibraryOpen(
                !isLibraryOpen
              )
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] py-2.5 text-xs text-white/65 transition hover:bg-white/10 hover:text-white"
          >

            <ListMusic size={16} />

            {isLibraryOpen
              ? "Hide Playlist"
              : "Open Playlist"}

          </button>

        </div>


        {/* ==========================================
            PLAYLIST
        ========================================== */}

        {isLibraryOpen && (

          <div className="min-h-0 flex-1 border-t border-white/10">

            {/* PLAYLIST HEADER */}

            <div className="flex items-center justify-between px-5 py-3 md:px-6">

              <div>

                <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                  Queue
                </p>

                <h2 className="mt-0.5 text-sm font-medium">
                  My Music
                </h2>

              </div>


              <span className="text-[10px] text-white/30">
                {songs.length} songs
              </span>

            </div>


            {/* SONG LIST */}

            <div className="h-[calc(100%-58px)] overflow-y-auto px-3 pb-4 md:px-4">

              {songs.map(
                (item, index) => (

                  <button
                    key={item.id}
                    onClick={() =>
                      playSong(index)
                    }
                    className={`
                      mb-1
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      p-2
                      text-left
                      transition
                      ${index === currentSong
                        ? "bg-white/12"
                        : "hover:bg-white/[0.06]"
                      }
                    `}
                  >

                    {/* NUMBER */}

                    <div className="w-5 text-center text-[10px] text-white/30">

                      {index === currentSong &&
                        isPlaying
                        ? "♪"
                        : index + 1}

                    </div>


                    {/* COVER */}

                    <img
                      src={item.cover}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />


                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <p
                        className={`
                          truncate
                          text-xs
                          font-medium
                          ${index ===
                            currentSong
                            ? "text-white"
                            : "text-white/75"
                          }
                        `}
                      >

                        {item.title}

                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-white/35">

                        {item.artist}

                      </p>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>

        )}

      </aside>


      {/* AUDIO */}

      <audio
        ref={audioRef}
        src={song.audio}
        preload="metadata"
      />
    </>
  );
}