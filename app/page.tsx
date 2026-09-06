import MusicPlayer from "@/components/MusicPlayer";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <picture>

          <source
            media="(max-width: 640px)"
            srcSet="/backgrounds/mobile.png"
          />

          <source
            media="(max-width: 1024px)"
            srcSet="/backgrounds/tablet.png"
          />

          <img
            src="/backgrounds/desktop.png"
            alt=""
            className="h-full w-full object-cover"
          />

        </picture>

        {/* DARK OVERLAY */}

        <div className="absolute inset-0 bg-[#071017]/35" />

      </div>


      {/* TOP INFORMATION */}

      <div className="absolute left-5 top-5 z-20 rounded-full border border-white/15 bg-[#0b151b]/70 px-4 py-2 text-sm text-[var(--foreground)] shadow-lg shadow-black/10 backdrop-blur-xl md:left-8 md:top-7">

        <span className="mr-2 text-[var(--accent)]">
          ●
        </span>

        Listening Live

      </div>

      {/* PLAYER + CHAT */}

      <MusicPlayer />

    </main>
  );
}