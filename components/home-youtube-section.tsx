"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import type { YouTubeVideo } from "@/lib/youtube";

const YOUTUBE_LIMIT = 3;
const PREVIOUS_VIDEOS_KEY = "medicina-sagrada:home-youtube-videos";
const subscribe = (onStoreChange: () => void) => {
  const timeoutId = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timeoutId);
};

const shuffleVideos = (videos: YouTubeVideo[]) => {
  const shuffled = [...videos];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const readPreviousVideoIds = () => {
  if (typeof window === "undefined") return [];

  try {
    const storedIds = JSON.parse(
      window.sessionStorage.getItem(PREVIOUS_VIDEOS_KEY) ?? "[]",
    ) as unknown;

    return Array.isArray(storedIds) &&
      storedIds.every((id) => typeof id === "string")
      ? storedIds
      : [];
  } catch {
    return [];
  }
};

const selectVideos = (videos: YouTubeVideo[], previousIds: string[]) => {
  const previousSet = new Set(previousIds);
  const unseenVideos = shuffleVideos(
    videos.filter(({ id }) => !previousSet.has(id)),
  );
  const remainingVideos = shuffleVideos(
    videos.filter(({ id }) => previousSet.has(id)),
  );

  return [...unseenVideos, ...remainingVideos].slice(0, YOUTUBE_LIMIT);
};

const createVideoSelection = (videos: YouTubeVideo[]) => {
  const serverSelection = videos.slice(0, YOUTUBE_LIMIT);
  const browserSelection = selectVideos(videos, readPreviousVideoIds());

  return {
    getServerSnapshot: () => serverSelection,
    getSnapshot: () => browserSelection,
  };
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  );
}

const getYouTubeEmbedUrl = (videoId: string) => {
  const parameters = new URLSearchParams({
    autoplay: "1",
    enablejsapi: "1",
    playsinline: "1",
    rel: "0",
  });

  if (typeof window !== "undefined") {
    parameters.set("origin", window.location.origin);
  }

  return `https://www.youtube.com/embed/${videoId}?${parameters.toString()}`;
};

export function HomeYoutubeSection({ videos }: { videos: YouTubeVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selection = useMemo(() => createVideoSelection(videos), [videos]);
  const visibleVideos = useSyncExternalStore(
    subscribe,
    selection.getSnapshot,
    selection.getServerSnapshot,
  );

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        PREVIOUS_VIDEOS_KEY,
        JSON.stringify(visibleVideos.map(({ id }) => id)),
      );
    } catch {
      // A seleção continua funcionando quando o armazenamento está indisponível.
    }
  }, [visibleVideos]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!activeVideo || !dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeVideo]);

  const closePlayer = () => {
    dialogRef.current?.close();
  };

  if (!videos.length) return null;

  return (
    <section className="youtube-section" aria-labelledby="youtube-title">
      <div className="container youtube-inner">
        <header className="youtube-heading">
          <div>
            <h2 id="youtube-title">No canal da Medicina Sagrada</h2>
            <p>Conversas e conteúdos para assistir com mais tempo e presença.</p>
          </div>
          <a
            className="youtube-channel-link"
            href="https://www.youtube.com/@medicinasagradabr"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="youtube-channel-icon">
              <PlayIcon />
            </span>
            Visitar o canal
          </a>
        </header>

        <div className="youtube-grid">
          {visibleVideos.map((video) => (
            <article className="youtube-card" key={video.id}>
              <button
                aria-controls="youtube-player-dialog"
                aria-haspopup="dialog"
                aria-label={`${video.title} — assistir nesta página`}
                className="youtube-card-link"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveVideo(video);
                }}
                type="button"
              >
                <span
                  className="youtube-card-media"
                  style={
                    {
                      "--youtube-thumbnail": `url("${video.thumbnail}")`,
                    } as CSSProperties
                  }
                >
                  <span className="youtube-card-play">
                    <PlayIcon />
                  </span>
                </span>
                <span className="youtube-card-copy">
                  <strong>{video.title}</strong>
                  <span>{video.description}</span>
                </span>
              </button>
            </article>
          ))}
        </div>

        <span className="scroll-hint youtube-scroll-hint" aria-hidden="true">
          Deslize para ver os vídeos
        </span>
      </div>

      <dialog
        aria-labelledby="youtube-player-title"
        className="youtube-player-dialog"
        id="youtube-player-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closePlayer();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePlayer();
        }}
        onClose={() => {
          setActiveVideo(null);
          triggerRef.current?.focus();
        }}
        ref={dialogRef}
      >
        {activeVideo ? (
          <div className="youtube-player-shell">
            <button
              aria-label="Fechar vídeo"
              className="youtube-player-close"
              onClick={closePlayer}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <div className="youtube-player-frame">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                key={activeVideo.id}
                referrerPolicy="origin-when-cross-origin"
                src={getYouTubeEmbedUrl(activeVideo.id)}
                title={activeVideo.title}
              />
            </div>
            <div className="youtube-player-copy">
              <h3 id="youtube-player-title">{activeVideo.title}</h3>
              <p>{activeVideo.description}</p>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
