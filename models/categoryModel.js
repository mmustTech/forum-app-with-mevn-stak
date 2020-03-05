const mongoose = require('mongoose');
const slugify = require('slugify');

const validator = require('validator');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plz .. Enter the Category Name.']
    },
    description: String,
    slug: String
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

categorySchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;