import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            trim: true,
            default: null,  // Set default to null
        },
        images: {
            type: [String], // Array of image URLs
            default: [],
        },
        videos: {
            type: [String], // Array of video URLs
            default: [],
        },
        postType: {
            type: String,
            enum: ['text', 'image', 'video', 'mixed'],
            default: 'text', // text by default
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, // Store the User's ObjectId
            ref: 'User', // Reference to the User model
            required: true, // A post must have a user associated with it
        }
    },
    { timestamps: true }
);

// Create a model for Post
const Post = mongoose.model('Post', postSchema);

export default Post;
