import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv' 
dotenv.config()

cloudinary.config({     
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
  secure: true
});

/**
 * Safely delete an asset from Cloudinary by its public_id.
 * Errors are caught and logged so Cloudinary failures never corrupt database operations.
 */
export const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId || typeof publicId !== "string" || publicId.trim() === "") return;
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return res;
  } catch (err) {
    console.warn(`[Cloudinary Warning] Failed to delete asset with public_id "${publicId}":`, err.message || err);
  }
};

export default cloudinary;