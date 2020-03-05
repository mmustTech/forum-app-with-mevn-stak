const mongoose = require('mongoose');
const slugify = require('slugify');

const validator = require('validator');

const topicScheme = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A topic must have a title']
    },
    body: {
        type: String,
        required: [true, 'A topic must have a description']
    },
    slug: String,
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A topic must belong to a category']
    },
    categoryId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'A topic must belong to a category']
    },
    commentsLength: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    liked: {
        type: Number,
        default: 0
    },
    disliked: {
        type: Number,
        default: 0
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

topicScheme.virtual('comments', {
    ref: 'Comment',
    foreignField: 'postId',
    localField: '_id'
});

topicScheme.virtual('intro').get(function(){
    const string = this.body.replace(/&lt;[^>]*>?/gm, ''); //&lt;>
    const ellipsis = (string.length > 150) ? '..' : '';
    let result = `${string.substring(0, 150)}${ellipsis}`;

    return result;
});

topicScheme.pre('save', function(next) {
    this.slug = slugify(this.title, { remove: /[*+~.()'"!:@]/g, lower: true });
    next();
});

topicScheme.pre(/^find/, function(next) {
    this.populate({
        path: 'comments',
        match: { parent: { $ne: false } },
        select: '-__v'
    }).populate({
        path: 'userId',
        select: 'name photo'
    }).populate({
        path: 'categoryId',
        select: '-__v'
    });

    next();
});

// topicScheme.pre('save', function(next) {
//     const string = "Singer, songwriter, artist, poet, philosopher, actress, guitarist, pianist, harmonium player…and the list goes on. Born into a musically and artistically inclined family, Leena Culhane started playing the piano at the ripe old age of four, when she also wrote her first song.";
//     const ellipsis = (string.length > 100) ? '..' : '';
//     let result = `${string.substring(0, 100)}${ellipsis}`;

//     next();
// });

const Topic = mongoose.model('Topic', topicScheme);

module.exports = Topic;