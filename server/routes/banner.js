const express = require("express");
const router = express.Router();
const Banner = require("../models/Banner");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all banners
router.get("/fetchimages", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new banner
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title,description, link, position, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Create a promise to handle the Cloudinary upload
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "banners",
            format: "webp", // Convert to webp for better compression
            transformation: [
              { width: 1200, height: 630, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    };

    // Upload the image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    const newBanner = new Banner({
      title,
      description,
      image: imageUrl,
      link,
      position: parseInt(position),
      isActive: isActive === "true",
    });

    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (err) {
    console.error("Error adding banner:", err);
    res.status(400).json({
      message: err.message || "Error uploading banner",
    });
  }
});

// Delete banner
router.delete("/delete/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const urlParts = banner.image.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    const fullPublicId = `banners/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);

    await Banner.findByIdAndDelete(req.params.id);

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description, link, position, isActive } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let imageUrl = banner.image;

    // If a new image is uploaded, delete the old one and upload new
    if (req.file) {
      // Delete existing image from Cloudinary
      const urlParts = banner.image.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split(".")[0];
      const fullPublicId = `banners/${publicId}`;
      await cloudinary.uploader.destroy(fullPublicId);

      // Upload new image to Cloudinary
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "banners",
              format: "webp",
              transformation: [
                { width: 1200, height: 630, crop: "limit" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
      };

      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Update the banner fields
    banner.title = title;
    banner.description = description;
    banner.link = link;
    banner.position = parseInt(position);
    banner.isActive = isActive === "true";
    banner.image = imageUrl;

    const updatedBanner = await banner.save();
    res.json({ success: true, message: "Banner updated successfully", data: updatedBanner });
  } catch (err) {
    console.error("Error updating banner:", err);
    res.status(500).json({ message: err.message || "Error updating banner" });
  }
});


module.exports = router;
