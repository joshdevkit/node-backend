import Post from "../../models/Post.js";
import cloudinary from "../../utils/cloudinary.js";
import path from 'path';
import { fileURLToPath } from "url";
import { promises as fsPromises } from 'fs';


export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const uploadedImages = [];

    // Upload images to Cloudinary and store the URLs
    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "posts",  
      });

      uploadedImages.push(result.secure_url);

      // Once upload to Cloudinary is successful, then unlink the local file
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      // Construct the file path to delete the local file
      const filePath = path.join(__dirname, "../../../public/attachments/", file.filename);
      try {
        // Delete the local file after successful upload to Cloudinary
        await fsPromises.unlink(filePath);
        console.log(`File deleted: ${filePath}`);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Prepare the post data
    const postData = {
      content,
      user: req.user.userId,  
      images: uploadedImages,  
      postType: content.length > 0 && uploadedImages.length > 0 ? 'mixed' : 'text', 
    };

    // Save the post data to the database
    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id).populate('user', 'name');

    // Send success response
    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error uploading images to Cloudinary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images.",
    });
  }
};






export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name email')  
            .sort({ createdAt: -1 }); 

        res.status(200).json({
            posts,
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};