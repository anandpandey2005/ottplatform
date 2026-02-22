import { useEffect, useMemo, useState } from "react";
import { deleteMedia, getMediaList } from "../lib/api.js";

const formatBytes = (value) => {
  if (!value || Number.isNaN(value)) return "Unknown size";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return "Unknown duration";
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function Home() {
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getMediaList();
        setMediaList(data);
      } catch (err) {
        setError(err.message || "Failed to load media");
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();
  }, []);

  const handleDeleteMedia = async (mediaId) => {
    if (!mediaId || deletingId) return;

    const shouldDelete = window.confirm(
      "Delete this media? It will also be removed from Cloudinary.",
    );

    if (!shouldDelete) return;

    try {
      setDeletingId(mediaId);
      setActionError("");
      await deleteMedia(mediaId);

      setMediaList((prevList) => prevList.filter((item) => item._id !== mediaId));
      setSelectedMedia((prevSelected) =>
        prevSelected?._id === mediaId ? null : prevSelected,
      );
    } catch (err) {
      setActionError(err.message || "Failed to delete media");
    } finally {
      setDeletingId("");
    }
  };

  const genres = useMemo(() => {
    const collection = new Set();
    mediaList.forEach((item) => {
      if (Array.isArray(item.genre)) {
        item.genre.forEach((entry) => {
          if (entry) collection.add(entry);
        });
      }
    });
    return ["All", ...Array.from(collection)];
  }, [mediaList]);

  const filteredMedia = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mediaList.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const synopsis = (item.synopsis || "").toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        synopsis.includes(normalizedQuery);
      const matchesGenre =
        activeGenre === "All" ||
        (Array.isArray(item.genre) && item.genre.includes(activeGenre));
      return matchesQuery && matchesGenre;
    });
  }, [activeGenre, mediaList, query]);

  const featured = filteredMedia[0] || null;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="glass-panel reveal rounded-[2rem] px-5 py-7 md:px-8 md:py-9">
        <div className="grid items-center gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="eyebrow">Freshly Uploaded</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-[var(--ink)] md:text-5xl">
              Your OTT dashboard for community-driven films.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-ink)] md:text-base">
              Browse everything that has been uploaded, filter by category, and
              play instantly. This page pulls live data from your backend media
              collection.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="metric-card">
                <span>Total Media</span>
                <strong>{mediaList.length}</strong>
              </div>
              <div className="metric-card">
                <span>Visible Now</span>
                <strong>{filteredMedia.length}</strong>
              </div>
              <div className="metric-card col-span-2 sm:col-span-1">
                <span>Genres</span>
                <strong>{Math.max(genres.length - 1, 0)}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white/90 p-4 shadow-[0_18px_40px_rgba(36,63,78,0.12)]">
            {featured?.displayUrl ? (
              <>
                <video
                  className="h-56 w-full rounded-2xl bg-black object-cover"
                  src={featured.displayUrl}
                  poster={featured.thumbnailUrl || ""}
                  muted
                  controls
                  preload="metadata"
                />
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    Spotlight
                  </p>
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    {featured.title || "Untitled"}
                  </h3>
                  <p className="text-clamp-2 text-sm text-[var(--muted-ink)]">
                    {featured.synopsis || "No synopsis provided."}
                  </p>
                </div>
              </>
            ) : (
              <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)]">
                <p className="text-sm font-medium text-[var(--muted-ink)]">
                  Upload a video to populate spotlight.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-7 space-y-5">
        <div className="glass-panel reveal rounded-3xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <label htmlFor="search-media" className="sr-only">
                Search media
              </label>
              <input
                id="search-media"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or synopsis"
                className="field-input"
              />
            </div>
            <div className="text-sm text-[var(--muted-ink)]">
              Showing <strong className="text-[var(--ink)]">{filteredMedia.length}</strong>{" "}
              result{filteredMedia.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setActiveGenre(genre)}
                className={`genre-chip ${
                  activeGenre === genre
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "border-[var(--line)] text-[var(--ink)]/80 hover:border-[var(--accent)]/50"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="glass-panel reveal rounded-3xl p-8 text-sm font-semibold text-[var(--muted-ink)]">
            Loading library...
          </div>
        ) : null}

        {error ? (
          <div className="glass-panel reveal rounded-3xl border border-red-200 bg-red-50/80 p-5 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {actionError ? (
          <div className="glass-panel reveal rounded-3xl border border-red-200 bg-red-50/80 p-5 text-sm font-semibold text-red-700">
            {actionError}
          </div>
        ) : null}

        {!isLoading && !error && filteredMedia.length === 0 ? (
          <div className="glass-panel reveal rounded-3xl p-10 text-center">
            <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
              No media matches your filter
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              Try a different search or clear genre selection.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMedia.map((media, index) => (
              <article
                key={media._id || media.displayUrl}
                className="media-card reveal"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="relative">
                  {media.thumbnailUrl ? (
                    <img
                      src={media.thumbnailUrl}
                      alt={media.title || "Media thumbnail"}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-44 place-items-center bg-gradient-to-br from-[var(--accent-soft)] to-[var(--paper)] text-sm font-semibold text-[var(--muted-ink)]">
                      Video Ready
                    </div>
                  )}
                  {media.displayUrl ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMedia(media)}
                      className="absolute bottom-3 right-3 rounded-full bg-[var(--ink)]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--accent)]"
                    >
                      Play
                    </button>
                  ) : null}
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="font-display text-lg font-bold text-[var(--ink)]">
                    {media.title || "Untitled"}
                  </h3>
                  <p className="text-clamp-2 text-sm text-[var(--muted-ink)]">
                    {media.synopsis || "No synopsis provided."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(media.genre) && media.genre.length > 0 ? (
                      media.genre.map((genre) => (
                        <span key={`${media._id}-${genre}`} className="meta-pill">
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="meta-pill">Uncategorized</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-ink)]">
                    <span>{formatDuration(media.duration)}</span>
                    <span>{formatBytes(media.bytes)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(media._id)}
                    disabled={!media._id || deletingId === media._id}
                    className="w-full rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingId === media._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {selectedMedia ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#10242f]/75 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-4xl rounded-3xl p-4 md:p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  {selectedMedia.title || "Untitled"}
                </h3>
                <p className="text-sm text-[var(--muted-ink)]">
                  {selectedMedia.synopsis || "No synopsis provided."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--ink)]"
              >
                Close
              </button>
            </div>
            <video
              className="h-[50vh] w-full rounded-2xl bg-black"
              src={selectedMedia.displayUrl}
              controls
              autoPlay
              poster={selectedMedia.thumbnailUrl || ""}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
