const express = require('express');

const router = express.Router();

const authController = require(`../controllers/authController`);
const commentController = require('../controllers/commentController');

router
    .route('/')
    .get(commentController.getAllComments)
    .post(authController.protect, commentController.createComment);

router
    .route('/:postId')
    .post(authController.protect, commentController.createCommentByPostId);

router
    .route('/:postId/reply/:commentId')
    .post(authController.protect, commentController.createCommentByPostIdAndReplay);

router
    .route('/:id/:postId')
    .delete(authController.protect, commentController.deleteAndDecrementCommentsLength);

router
    .route('/:id')
    .get(commentController.getComment)
    .patch(authController.protect, commentController.updateComment)
    .delete(authController.protect, commentController.deleteComment);

module.exports = router;