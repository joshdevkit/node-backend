import User from "../../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import generateToken from '../../utils/JwtGenerator.js'

export const register = async (req, res) => {
    const { userName, email, password, confirmPassword } = req.body;

    try {
        if (!userName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            userName,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id, res);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
            },
            token, 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, res);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, userName: user.userName, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const profile = async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


export const currentUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        res.status(200).json({ user: user });
        

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const logOut = async (req, res) => {
    try {
        //this logout only works on a browser
        //if you try on postman, just remove the bearer token and send the request cause the token is stored in the browser
        res.cookie('token', '', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 0,
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
