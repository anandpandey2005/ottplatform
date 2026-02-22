import { useRef, useState } from "react";
import { uploadMedia } from "../lib/api.js";

const availableGenres = [
  "Action",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Horror",
  "Thriller",
  "Romance",
  "Documentary",
];

const formatFileSize = (size) => {
  if (!size) return "0 MB";
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [movieData, setMovieData] = useState({
    title: "",
    synopsis: "",
    genres: [],
  });

  const fileInputRef = useRef(null);

  const toggleGenre = (genre) => {
    setMovieData((prev) => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected
          ? prev.genres.filter((g) => g !== genre)
          : [...prev.genres, genre],
      };
    });
  };

  const setSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type?.startsWith("video/")) {
      setError("Please choose a valid video file.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Attach a video file before publishing.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", movieData.title.trim());
    formData.append("synopsis", movieData.synopsis.trim());
    formData.append("genres", movieData.genres.join(","));

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      await uploadMedia(formData);

      setSuccessMessage("Upload successful. It is now visible in Discover.");
      setFile(null);
      setMovieData({
        title: "",
        synopsis: "",
        genres: [],
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="glass-panel reveal rounded-[2rem] p-5 md:p-8"
        >
          <div className="mb-6 space-y-3">
            <p className="eyebrow">Studio Console</p>
            <h2 className="font-display text-3xl font-extrabold text-[var(--ink)] md:text-4xl">
              Publish a new title
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted-ink)]">
              Drop your video, set metadata, and push it to your shared OTT
              catalogue in one step.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                Video Asset
              </label>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`upload-dropzone ${
                  isDragging
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)]"
                }`}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(event) => setSelectedFile(event.target.files[0])}
                  accept="video/*"
                />
                <p className="font-display text-xl font-bold text-[var(--ink)]">
                  Drag and drop video
                </p>
                <p className="mt-1 text-sm text-[var(--muted-ink)]">
                  or click to browse local files
                </p>
                {file ? (
                  <div className="mt-4 rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3 text-left text-sm">
                    <p className="truncate font-semibold text-[var(--ink)]">
                      {file.name}
                    </p>
                    <p className="mt-1 text-[var(--muted-ink)]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="movie-title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]"
                >
                  Title
                </label>
                <input
                  id="movie-title"
                  type="text"
                  className="field-input"
                  placeholder="Add movie title"
                  value={movieData.title}
                  onChange={(event) =>
                    setMovieData({ ...movieData, title: event.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="movie-synopsis"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]"
                >
                  Synopsis
                </label>
                <textarea
                  id="movie-synopsis"
                  rows="4"
                  className="field-input min-h-28 resize-y"
                  placeholder="Write a quick summary"
                  value={movieData.synopsis}
                  onChange={(event) =>
                    setMovieData({ ...movieData, synopsis: event.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                Genres
              </p>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map((genre) => {
                  const selected = movieData.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`genre-chip ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--line)] bg-white/80 text-[var(--ink)]/80"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!file || isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[var(--ink)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Publishing..." : "Publish Now"}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="glass-panel reveal rounded-3xl p-5 md:p-6">
            <p className="eyebrow">Checklist</p>
            <h3 className="font-display mt-2 text-2xl font-bold text-[var(--ink)]">
              Before you publish
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted-ink)]">
              <li>Use clear titles so users can search quickly.</li>
              <li>Pick at least one genre for better discovery.</li>
              <li>Add a synopsis that explains the story in 1-2 lines.</li>
              <li>Preview the upload in Discover after publishing.</li>
            </ul>
          </div>

          <div className="glass-panel reveal rounded-3xl p-5 md:p-6">
            <p className="eyebrow">Pipeline</p>
            <div className="mt-3 space-y-3 text-sm text-[var(--muted-ink)]">
              <p>
                1. Frontend sends multipart data to <code>/upload</code>.
              </p>
              <p>2. Backend stores metadata in MongoDB.</p>
              <p>3. Home page fetches media list from <code>/media</code>.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
