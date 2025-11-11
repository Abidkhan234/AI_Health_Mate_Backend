import cloudinary from '../config/cloudinary.js'
import "dotenv/config"

const uploadFileToCloudinary = async (buffer) => {
    try {
        if (!buffer) {
            return;
        }

        // Convert buffer to base64 data URI for PDF
        const base64String = buffer.toString('base64');
        const dataURI = `data:application/pdf;base64,${base64String}`;

        const publicFile = await cloudinary.uploader.upload(dataURI, {
            folder: process.env.CLOUDINARY_FOLDER_NAME,
        });

        if (!publicFile) {
            return;
        }

        return publicFile;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const removeFileFromCloudinary = async (publicId) => {
    try {

        if (!publicId) {
            return;
        }

        const status = await cloudinary.uploader.destroy(publicId, {
            folder: process.env.CLOUDINARY_FOLDER_NAME,
        });

        return status;
    } catch (error) {
        console.log(error);
        throw error
    }
}

export { uploadFileToCloudinary, removeFileFromCloudinary };