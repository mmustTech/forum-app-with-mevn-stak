const ObjectId = require('mongodb').ObjectID;

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');
const Comment = require('../models/commentModel');
const Topic = require('../models/topicModel');


exports.createCommentByPostId = catchAsync(async (req, res, next) => {
    const _body = {
        postId: req.params.postId,
        userId: req.user._id,
        body: req.body.body,
        parent: true
    }
    
    const doc = await Comment.create(_body);

    if(doc){
        await Topic.findByIdAndUpdate(
            req.params.postId,
            { $inc: { commentsLength: 1}, lastActivity: Date.now() } // }, 
        );
    }

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.createCommentByPostIdAndReplay = catchAsync(async (req, res, next) => {
    const commentId = req.params.commentId;
    const _body = {
        postId: req.params.postId,
        userId: req.user._id,
        body: req.body.body,
        parent: false
    }

    const doc = await Comment.create(_body);

    if(doc){
        await Topic.findByIdAndUpdate(
            req.params.postId,
            { $inc: { commentsLength: 1 }, lastActivity: Date.now() }
        )
    }

    await Comment.findByIdAndUpdate(
        commentId, 
        { $push: { replies: doc.id }}, 
        { new: true, runValidators: true }
    );

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.updateThumbs = catchAsync(async (req, res, next) => {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const tergetComment = await Comment.findById(commentId);

    const checkIfHaveLiked = await tergetComment.likes.includes(userId); // return false or true
    const checkIfHaveDisliked = await tergetComment.dislikes.includes(userId); // return false or true

    let updateQuery;
    if(req.body.type === 'like'){
        if(checkIfHaveDisliked){
            updateQuery = { $pull: { dislikes: userId }, $push: { likes: userId }};
        }else{
            updateQuery = (checkIfHaveLiked) ? { $pull: { likes: userId }} : { $push: { likes: userId }} ;
        }
    }

    if(req.body.type === 'dislike'){
        if(checkIfHaveLiked){
            updateQuery = { $pull: { likes: userId }, $push: { dislikes: userId }};
        }else{
            updateQuery = (checkIfHaveDisliked) ? { $pull: { dislikes: userId }} : { $push: { dislikes: userId }} ;
        }
    }

    await Comment.findByIdAndUpdate(
        commentId, 
        updateQuery, 
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        message: 'Thumbs Action Updated'
    });
});

exports.deleteAndDecrementCommentsLength = catchAsync(async (req, res, next) => {
    const doc = await Comment.findByIdAndRemove(req.params.id);

    if (!doc) {
      return next(new AppError('no document found with this ID', 404));
    }
    
    await Topic.findByIdAndUpdate(
        req.params.postId,
        { $inc: { commentsLength: -1 } }
    )

    res.status(204).json({
      status: 'success',
      data: null
    });
});

exports.getAllComments = factory.getAll(Comment);
exports.createComment = factory.createOne(Comment);

exports.getComment = factory.getOne(Comment);
exports.updateComment = factory.updateOne(Comment);
exports.deleteComment = factory.deleteOne(Comment);