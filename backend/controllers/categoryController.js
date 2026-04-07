const Category = require('../models/Category');
const Product = require('../models/Product');

const createCategory = async (req, res, next) => {
    try {
        const { name, description, attributes } = req.body;

        // Check if category already exists
        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = await Category.create({
            name,
            description,
            attributes: attributes || []
        });

        res.status(201).json({
            success: true,
            data: category,
            message: 'Category created successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { name, description, attributes } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Update fields
        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (attributes) category.attributes = attributes;

        await category.save();

        res.json({
            success: true,
            data: category,
            message: 'Category updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if products exist under this category
        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productCount} product(s) are associated with it.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
