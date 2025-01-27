import User from "../../models/User.js";
import bcrypt from 'bcryptjs';
import generateToken from '../../utils/JwtGenerator.js'
import path from 'path'
import { fileURLToPath } from "url";
import sendEmail from '../../utils/mailer.js'
import crypto from 'crypto';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PasswordResetTemplatePath = path.join(__dirname, "../../mails/template.html");

export const register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    try {
        if (!name || !email || !password || !confirmPassword) {
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
            name,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id, res);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
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
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
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
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const reset = async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email }).select('-password');
  
    if (!user) {
        return res.status(404).json({ message: "Email address doesn't exist" });
    }
  
    if (user.resetAttempts >= 3) {
        return res.status(400).json({
            message: 'You have exceeded the maximum number of password reset requests.',
        });
    }
  
    try {
        const resetToken = crypto.randomBytes(32).toString('hex'); // Generates a 32-byte token with hex characters
  
        const salt = bcrypt.genSaltSync(12);
        
        const hashedToken = bcrypt.hashSync(resetToken, salt);

        const resetTokenExpiration = Date.now() + 60 * 60 * 1000;

        user.resetToken = hashedToken;
        user.resetTokenExpiration = resetTokenExpiration;
        user.resetAttempts += 1;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/change-password/${user._id}?token=${hashedToken}`;

        await sendEmail({
            email: user.email,
            subject: "Password Reset Link",
            templatePath: PasswordResetTemplatePath,
            templateData: {
                fullname: user.name,
                link: resetLink,
                supportEmail: process.env.APP_MAILER_USER,
            },
        });
  
        res.status(200).json({
            message: "Reset link has been sent to your email.",
        });
  
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

export const validateResetToken = async (req, res) => {
    const { userID, token } = req.body;
  
    try {
      // Find the user by their ID
      const user = await User.findById(userID);
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ isValid: false, message: "User not found." });
      }
  
      // Check if the token exists and is not expired
      if (!user.resetToken || user.resetTokenExpiration < Date.now()) {
        return res.status(400).json({
          isValid: false,
          isExpired: true,
          message: "The token has expired or is invalid.",
        });
      }
  
      // Directly compare the provided token with the stored resetToken
      if (token !== user.resetToken) {
        return res.status(400).json({ isValid: false, message: "Invalid token." });
      }
  
      // If everything is valid
      res.status(200).json({
        isValid: true,
        isExpired: false,
        message: "Token is valid.",
      });
    } catch (error) {
      console.error("Error validating reset token:", error.message);
      res.status(500).json({
        isValid: false,
        message: "Server error.",
        error: error.message,
      });
    }
};

export const updatePassword = async (req, res) => {
    const { id, password, confirmPassword } = req.body;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ isValid: false, message: "User not found." });
      }
  
      if (password !== confirmPassword) {
        return res.status(400).json({ isValid: false, message: "Passwords do not match." });
      }

      if (password.length < 8) {
        return res.status(400).json({
          isValid: false,
          message: "Password must be at least 8 characters long.",
        });
      }
  
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user.password = hashedPassword;
      user.resetToken = null; 
      user.resetAttempts = 0;   
      await user.save();
  
      res.status(200).json({
        isUpdated: true,
        message: "Password updated successfully.",
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error.",
        error: error.message,
      });
    }
  };
  