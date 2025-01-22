import express from 'express';
import { currentUser, login, logOut, profile, register } from '../controllers/auth/AuthController.js';
import authenticate from '../middleware/AuthMiddleware.js';
import guestMiddleware from '../middleware/guestMiddleware.js';

const router = express.Router();

router.post('/register', guestMiddleware, register); 
router.post('/login', guestMiddleware, login);      
router.post('/logout', authenticate, logOut)  
router.get('/profile/:id', authenticate, profile);
router.get('/current-user', authenticate, currentUser);




router.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

export default router;
