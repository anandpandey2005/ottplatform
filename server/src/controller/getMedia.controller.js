import { Media } from "../models/media.models.js";

const getMedia = async (req, res) => {
    try {
    
        const mediaList = await Media.find().sort({ createdAt: -1 });

       
        if (!mediaList || mediaList.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No media found in the library",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            count: mediaList.length,
            data: mediaList
        });

    } catch (err) {
        console.error("GetMedia Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve media",
            error: err.message
        });
    }
};

export { getMedia };