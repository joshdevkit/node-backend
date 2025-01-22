import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true, 
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true, 
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 
                'Please enter a valid email address',
            ],
        },
        password: {
            type: String,
            required: true,
            minlength: 8, 
        },
    },
    {
        timestamps: true, 
    }
);

const User = mongoose.model('User', userSchema);

export default User;
