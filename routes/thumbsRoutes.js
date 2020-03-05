const express = require('express');

const router = express.Router();

const authController = require(`../controllers/authController`);
const commentController = require('../controllers/commentController');

router.use(authController.protect);
router.patch('/:commentId', commentController.updateThumbs);

module.exports = router;