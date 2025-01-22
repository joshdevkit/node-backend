import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token
 * @param {string} userId - The user ID to include in the token payload
 * @param {Object} res - The Express response object (for setting cookies)
 * @returns {string} - The generated JWT token
 */
const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });

    return token;
};

export default generateToken; // Default export
