const express = require('express');
const router = express.Router();


const checkAuth = require('../middleware/check-auth');
const userController = require('../controllers/user');
const helpers = require('../helpers/helpers');
const { userValidationRules, validate } = require('../middleware/validator');

const fs = require('fs');
const multer = require('multer');
const path = require('path');


// New account avatar storage
var newAccountStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        var avatarPath = './public/images/users/tmp/';
        if (!fs.existsSync(avatarPath)) {
            fs.mkdirSync(avatarPath);
        }
        cb(null, avatarPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const newAccountUpload = multer({ storage: newAccountStorage });

// Update avatar storage
var storage = multer.diskStorage({
    //var avatarPath = './public/uploads/' + req.userData.id;
    // if (!fs.existsSync(dir)){
    //     fs.mkdirSync(dir);
    // }
    destination: (req, file, cb) => {
        var avatarPath = './public/images/users/' + req.userData.id;
        if (!fs.existsSync(avatarPath)) {
            fs.mkdirSync(avatarPath);
        }
        cb(null, avatarPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Upload post storage
var postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        var avatarPath = './public/images/posts/tmp/';
        if (!fs.existsSync(avatarPath)) {
            fs.mkdirSync(avatarPath);
        }
        cb(null, avatarPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const postUpload = multer({ storage: postStorage, fileFilter: helpers.imageFilter });

router.post('/login', userController.login);

// Change password
router.post('/change_password', userValidationRules('change_password'), validate, checkAuth, userController.change_password);

// Update profile info
// #1 - Update avatar
router.post('/change_avatar', checkAuth, upload.single('avatar'), userController.change_avatar);

// #2 - Update info
router.post('/update_profile', checkAuth, userController.update_profile);

// Sign up
// #1 - Upload avatar
router.post('/upload_avatar', newAccountUpload.single('avatar'), userController.upload_avatar);

// #2 - Signu up
router.post('/signup', userValidationRules('signup'), validate, userController.signup);

// Update firebase token
router.post('/update_gcm_token', checkAuth, userController.update_gcm_token);

// Add post
// #1 - Upload image
router.post('/post_image', checkAuth, postUpload.single('image'), userController.post_image);

// #2 - Add post
router.post('/post', checkAuth, userController.add_post);

// Get feed posts
router.get('/all_feeds/:offset/', checkAuth, userController.all_feeds);

// Get user feeds
router.get('/feeds/:offset/', checkAuth, userController.feeds);

// Get news
router.get('/news', checkAuth, userController.news);

// Get post comments
router.get('/post/:id/comments', checkAuth, userController.comments);

// Add comment
router.post('/comment', checkAuth, userValidationRules('comment'), validate, userController.add_comment);

// Delete comment
router.delete('/comment/:id/', checkAuth, userController.delete_comment);

// Get post by id
router.get('/post/:id/', checkAuth, userController.get_post);

// Get user posts
router.get('/posts/:id/', checkAuth, userController.user_posts);

// Like a post
router.post('/like', checkAuth, userController.like_post);

// Follow user
router.post('/follow', checkAuth, userController.follow_user);

// Get notifications
router.get('/notifications', checkAuth, userController.notifications);

// Get user info
router.get('/user/:id/', checkAuth, userController.user_info);

// Get user messages
router.get('/messages/', checkAuth, userController.user_messages);

// Get user messages
router.get('/messages/:id/:offset/', checkAuth, userController.user_messages_details);

// Search posts auto complete
router.get('/search', userController.search);

// Search posts
router.get('/search_posts', checkAuth, userController.search_posts);

// Reset password step 1
router.post('/reset_password_step_1', userController.reset_password_step_1);

// Reset password step 2
router.post('/reset_password_step_2', userController.reset_password_step_2);

// Reset password step 3
router.post('/reset_password', userController.reset_password);

module.exports = router;