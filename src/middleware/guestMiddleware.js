import jwt from 'jsonwebtoken';

const guestMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET); 
            return res.status(400).json({ message: 'You are already logged in' });
        } catch (error) {
           
            next();
        }
    } else {
        next(); 
    }
};

export default guestMiddleware;
