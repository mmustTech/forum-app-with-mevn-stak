const express = require('express');

const router = express.Router();

const topicController = require('../controllers/topicController');

router
    .route('/')
    .get(topicController.getAllTopics)
    .post(topicController.createTopic);

router
    .route('/:id')
    .get(topicController.getTopicWithIncViews)
    .patch(topicController.updateTopic)
    .delete(topicController.deleteTopic);

module.exports = router;