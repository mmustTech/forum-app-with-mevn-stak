const mongoose = require('mongoose');
const validator = require('validator');

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'The comment or reply is required'],
        trim: true
    },
    postId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'A comment belong to a post']
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A comment belong to a user']
    },
    replies: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Comment'
        }
    ],
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    parent: Boolean
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

commentSchema.pre(/^find/, function(next) {
    this
        .populate({
            path: 'replies',
            options: { sort: {createdAt: -1} },
            select: '-__v'
        })
        .populate({
            path: 'userId',
            select: 'name photo'
        });
  
    next();
});

commentSchema.virtual('repliesLength').get(function(){
    return this.replies.length;
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;