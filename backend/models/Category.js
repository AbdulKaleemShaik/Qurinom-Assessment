const mongoose = require('mongoose');

// Schema for individual attribute definitions within a category
const attributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Attribute name is required'],
        trim: true
    },
    key: {
        type: String,
        required: [true, 'Attribute key is required'],
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        required: [true, 'Attribute type is required'],
        enum: {
            values: ['text', 'number', 'select', 'multiselect', 'boolean'],
            message: '{VALUE} is not a valid attribute type'
        }
    },
    options: {
        type: [String],
        default: []
    },
    required: {
        type: Boolean,
        default: false
    },
    filterable: {
        type: Boolean,
        default: false
    },
    unit: {
        type: String,
        default: ''
    }
}, { _id: false });

// Main Category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    attributes: {
        type: [attributeSchema],
        validate: {
            validator: function(attrs) {
                // Ensure attribute keys are unique within a category
                const keys = attrs.map(a => a.key);
                return keys.length === new Set(keys).size;
            },
            message: 'Attribute keys must be unique within a category'
        }
    }
}, {
    timestamps: true
});

// Auto-generate slug from name before validation
categorySchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
