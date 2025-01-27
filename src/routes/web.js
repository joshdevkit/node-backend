import express from 'express';
import { currentUser, login, logOut, profile, register, reset, updatePassword, validateResetToken } from '../controllers/auth/AuthController.js';
import authenticate from '../middleware/AuthMiddleware.js';
import guestMiddleware from '../middleware/guestMiddleware.js';
import {  createPost,  getAllPosts } from '../controllers/post/PostController.js';
import upload from "../utils/multer.js";
const router = express.Router();

router.post('/auth/register', guestMiddleware, register); 
router.post('/auth/login', guestMiddleware, login);      
router.post('/auth/logout', authenticate, logOut)  
router.get('/profile/:id', authenticate, profile);
router.get('/current-user', authenticate, currentUser);

router.post('/post/create', authenticate, upload.array("images"), createPost)

router.get('/post', authenticate, getAllPosts)


router.get('/', (req, res) => {
    res.send('Welcome!');
});

router.post('/password-reset', reset);
router.post('/validate-token', validateResetToken);
router.post('/update-password', updatePassword)

export default router;
