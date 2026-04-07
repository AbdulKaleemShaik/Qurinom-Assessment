const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
    name: String,
    key: String,
    type: String,
    options: [String],
    required: Boolean,
    filterable: Boolean,
    unit: String
}, { _id: false });

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: String,
    attributes: [attributeSchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
