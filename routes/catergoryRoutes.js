const express = require('express');

const router = express.Router();

const authController = require(`../controllers/authController`);
const categoryController = require('../controllers/categoryController');


router.use(authController.protect);

router
    .route('/')
    .get(categoryController.getAllCategories)
    .post(authController.restrictTo('admin'), categoryController.createCategory);

router.use(authController.restrictTo('admin'));

router
    .route('/:id')
    .get(categoryController.getCategory)
    .patch(categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;