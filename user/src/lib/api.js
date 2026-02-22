const normalizeBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return "https://sharingiscaring-4c58.onrender.com";
  return rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
};

const API_BASE_URL = normalizeBaseUrl("https://sharingiscaring-4c58.onrender.com");

const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error("Server unavailable. Please check Render deployment and try again.");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload;
};

export const getMediaList = async () => {
  const payload = await request("/media", {
    method: "GET",
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const uploadMedia = async (formData) => {
  return request("/upload", {
    method: "POST",
    body: formData,
  });
};

export const deleteMedia = async (mediaId) => {
  if (!mediaId) {
    throw new Error("Media id is required");
  }

  return request(`/media/${mediaId}`, {
    method: "DELETE",
  });
};
