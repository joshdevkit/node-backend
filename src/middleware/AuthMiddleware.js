import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const token = req.cookies.token;

    // // If no token is found, return unauthorized response
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized!' });
    }
    try {
        // Verify the token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach decoded user data to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        // If the token is invalid or expired, return error
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

};

export default authenticate;
