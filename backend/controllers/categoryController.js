const Category = require('../models/Category');
const Product = require('../models/Product');

const createCategory = async (req, res, next) => {
    try {
        const { name, description, attributes } = req.body;


        const existing = await Category.exists({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const category = await Category.create({
            name,
            slug,
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
        const categories = await Category.find({ deleteStatus: { $ne: true } }).sort({ name: 1 });

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

        if (!category || category.deleteStatus) {
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
        if (!category || category.deleteStatus) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }


        if (name) {
            category.name = name;
            category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
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
        if (!category || category.deleteStatus) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }


        const productCount = await Product.countDocuments({ category: req.params.id, deleteStatus: { $ne: true } });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productCount} product(s) are associated with it.`
            });
        }

        category.deleteStatus = true;
        await category.save();

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
