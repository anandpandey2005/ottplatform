import { Media } from "../models/media.models.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const isCloudinaryConfigured = Object.values(cloudinaryConfig).every(Boolean);

if (isCloudinaryConfigured) {
  cloudinary.config(cloudinaryConfig);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, "../../uploads");

const normalizeGenre = (genreInput) => {
  if (Array.isArray(genreInput)) {
    return genreInput.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof genreInput === "string") {
    return genreInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getUploadedFile = (req) => {
  if (req.file) return req.file;

  if (Array.isArray(req.files) && req.files.length > 0) {
    return req.files[0];
  }

  if (req.files && typeof req.files === "object") {
    const firstKey = Object.keys(req.files)[0];
    const list = req.files[firstKey];
    if (Array.isArray(list) && list.length > 0) {
      return list[0];
    }
  }

  return null;
};

const createLocalMediaUrl = (req, filePath) => {
  const fileName = path.basename(filePath);
  const encodedFileName = encodeURIComponent(fileName);
  return `${req.protocol}://${req.get("host")}/uploads/${encodedFileName}`;
};

const getLocalUploadFilename = (displayUrl) => {
  if (typeof displayUrl !== "string" || !displayUrl.trim()) return null;

  const marker = "/uploads/";

  const extractFilename = (inputPath) => {
    const markerIndex = inputPath.indexOf(marker);
    if (markerIndex === -1) return null;

    const encodedName = inputPath.slice(markerIndex + marker.length).split("/")[0];
    if (!encodedName) return null;

    return decodeURIComponent(encodedName);
  };

  try {
    const parsedUrl = new URL(displayUrl);
    return extractFilename(parsedUrl.pathname);
  } catch {
    return extractFilename(displayUrl);
  }
};

const removeLocalUploadFile = async (displayUrl) => {
  const fileName = getLocalUploadFilename(displayUrl);
  if (!fileName) return;

  const localFilePath = path.join(uploadDirectory, fileName);

  try {
    await fs.unlink(localFilePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

export const createMedia = async (req, res) => {
  try {
    const { title, synopsis } = req.body;
    const genreInput = req.body.genre ?? req.body.genres;
    const normalizedGenre = normalizeGenre(genreInput);
    const uploadedFile = getUploadedFile(req);

    if (!uploadedFile?.path) {
      return res.status(400).json({ success: false, message: "No video file uploaded" });
    }

    let cloudinaryResult = null;

    if (isCloudinaryConfigured) {
      try {
        cloudinaryResult = await cloudinary.uploader.upload(uploadedFile.path, {
          resource_type: "video",
          folder: "media_app",
        });

        await fs.unlink(uploadedFile.path).catch(() => {});
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, using local file instead:", cloudinaryError.message);
      }
    }

    const usesCloudinary = Boolean(cloudinaryResult);
    const localDisplayUrl = createLocalMediaUrl(req, uploadedFile.path);

    const newMedia = await Media.create({
      title,
      genre: normalizedGenre,
      synopsis,
      cloudinaryId: usesCloudinary ? cloudinaryResult.public_id : null,
      displayUrl: usesCloudinary ? cloudinaryResult.secure_url : localDisplayUrl,
      duration: usesCloudinary ? cloudinaryResult.duration : 0,
      format: usesCloudinary ? cloudinaryResult.format : uploadedFile.mimetype?.split("/")[1],
      resolution: {
        width: usesCloudinary ? cloudinaryResult.width : null,
        height: usesCloudinary ? cloudinaryResult.height : null,
      },
      bytes: usesCloudinary ? cloudinaryResult.bytes : uploadedFile.size,
      thumbnailUrl: usesCloudinary
        ? cloudinary.url(cloudinaryResult.public_id, {
            resource_type: "video",
            format: "jpg",
            secure: true,
          })
        : null,
    });

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      storage: usesCloudinary ? "cloudinary" : "local",
      data: newMedia,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- GET ALL MEDIA ---
export const getAllMedia = async (req, res) => {
  try {
    const allMedia = await Media.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: allMedia.length,
      data: allMedia,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    if (!mediaId) {
      return res.status(400).json({
        success: false,
        message: "Media id is required",
      });
    }

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    if (media.cloudinaryId) {
      if (!isCloudinaryConfigured) {
        return res.status(500).json({
          success: false,
          message: "Cloudinary is not configured. Unable to delete cloud media.",
        });
      }

      const destroyResponse = await cloudinary.uploader.destroy(media.cloudinaryId, {
        resource_type: "video",
        invalidate: true,
      });

      const destroyResult = destroyResponse?.result;
      if (destroyResult !== "ok" && destroyResult !== "not found") {
        return res.status(502).json({
          success: false,
          message: "Failed to delete media from Cloudinary",
          error: destroyResult || "Unknown Cloudinary response",
        });
      }
    } else {
      await removeLocalUploadFile(media.displayUrl);
    }

    await media.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete Media Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete media",
      error: error.message,
    });
  }
};
