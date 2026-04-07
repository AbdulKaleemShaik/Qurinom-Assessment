const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dynamic-products';

// Category seed data
const categories = [
    {
        name: 'Mobile',
        description: 'Smartphones and mobile devices',
        attributes: [
            {
                name: 'RAM',
                key: 'ram',
                type: 'select',
                options: ['4GB', '6GB', '8GB', '12GB', '16GB'],
                required: true,
                filterable: true,
                unit: 'GB'
            },
            {
                name: 'Processor',
                key: 'processor',
                type: 'text',
                required: true,
                filterable: true,
                unit: ''
            },
            {
                name: 'Storage',
                key: 'storage',
                type: 'select',
                options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
                required: true,
                filterable: true,
                unit: 'GB'
            },
            {
                name: 'Color',
                key: 'color',
                type: 'select',
                options: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gold', 'Silver'],
                required: true,
                filterable: true,
                unit: ''
            },
            {
                name: 'Battery',
                key: 'battery',
                type: 'text',
                required: false,
                filterable: false,
                unit: 'mAh'
            },
            {
                name: 'Screen Size',
                key: 'screen_size',
                type: 'text',
                required: false,
                filterable: false,
                unit: 'inches'
            }
        ]
    },
    {
        name: 'Bangles',
        description: 'Traditional and modern bangles',
        attributes: [
            {
                name: 'Color',
                key: 'color',
                type: 'select',
                options: ['Gold', 'Silver', 'Rose Gold', 'Red', 'Green', 'Blue', 'Multi-color'],
                required: true,
                filterable: true,
                unit: ''
            },
            {
                name: 'Size',
                key: 'size',
                type: 'select',
                options: ['2.2', '2.4', '2.6', '2.8', '2.10'],
                required: true,
                filterable: true,
                unit: 'inches'
            },
            {
                name: 'Material',
                key: 'material',
                type: 'select',
                options: ['Gold', 'Silver', 'Brass', 'Copper', 'Glass', 'Lac', 'Kundan', 'Platinum'],
                required: true,
                filterable: true,
                unit: ''
            },
            {
                name: 'Weight',
                key: 'weight',
                type: 'number',
                required: false,
                filterable: true,
                unit: 'grams'
            },
            {
                name: 'Occasion',
                key: 'occasion',
                type: 'select',
                options: ['Wedding', 'Festival', 'Daily Wear', 'Party', 'Casual'],
                required: false,
                filterable: true,
                unit: ''
            }
        ]
    }
];

// Product seed data (will be used after categories are created)
const getProducts = (mobileId, banglesId) => [
    // --- Mobile Products ---
    {
        name: 'iPhone 15 Pro Max',
        category: mobileId,
        price: 159900,
        brand: 'Apple',
        description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and an advanced camera system. Features a 6.7-inch Super Retina XDR display with ProMotion technology.',
        highlights: [
            'A17 Pro chip for console-level gaming',
            'Titanium design - lighter and more durable',
            '48MP main camera with 5x optical zoom',
            'Action button for quick access',
            'USB-C with USB 3 speeds'
        ],
        specifications: {
            ram: '8GB',
            processor: 'A17 Pro',
            storage: '256GB',
            color: 'Black',
            battery: '4441',
            screen_size: '6.7'
        },
        images: []
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        category: mobileId,
        price: 134999,
        brand: 'Samsung',
        description: 'Samsung Galaxy S24 Ultra with built-in S Pen, 200MP camera, and Galaxy AI features. The ultimate productivity and creativity phone.',
        highlights: [
            'Snapdragon 8 Gen 3 for Galaxy',
            '200MP camera with AI processing',
            'Built-in S Pen with Air Actions',
            'Galaxy AI - Circle to Search, Live Translate',
            'Titanium frame with flat display'
        ],
        specifications: {
            ram: '12GB',
            processor: 'Snapdragon 8 Gen 3',
            storage: '512GB',
            color: 'Black',
            battery: '5000',
            screen_size: '6.8'
        },
        images: []
    },
    {
        name: 'OnePlus 12',
        category: mobileId,
        price: 64999,
        brand: 'OnePlus',
        description: 'OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad camera system, and 100W SUPERVOOC charging. A flagship killer with premium features.',
        highlights: [
            'Snapdragon 8 Gen 3 processor',
            '4th Gen Hasselblad Camera System',
            '100W SUPERVOOC Flash Charge',
            '2K 120Hz ProXDR Display',
            '5400mAh battery'
        ],
        specifications: {
            ram: '12GB',
            processor: 'Snapdragon 8 Gen 3',
            storage: '256GB',
            color: 'Green',
            battery: '5400',
            screen_size: '6.82'
        },
        images: []
    },
    {
        name: 'Google Pixel 8 Pro',
        category: mobileId,
        price: 106999,
        brand: 'Google',
        description: 'Google Pixel 8 Pro powered by Google Tensor G3 with advanced AI capabilities, best-in-class camera, and 7 years of OS updates.',
        highlights: [
            'Google Tensor G3 with advanced AI',
            'Best Take and Magic Eraser',
            '50MP main + 48MP ultrawide cameras',
            '7 years of OS and security updates',
            'Temperature sensor'
        ],
        specifications: {
            ram: '12GB',
            processor: 'Google Tensor G3',
            storage: '128GB',
            color: 'Blue',
            battery: '5050',
            screen_size: '6.7'
        },
        images: []
    },
    {
        name: 'Xiaomi 14 Pro',
        category: mobileId,
        price: 49999,
        brand: 'Xiaomi',
        description: 'Xiaomi 14 Pro with Leica optics, Snapdragon 8 Gen 3, and HyperOS. Premium flagship experience at a competitive price.',
        highlights: [
            'Leica Summilux lens system',
            'Snapdragon 8 Gen 3',
            '120W HyperCharge',
            'Xiaomi HyperOS',
            'IP68 water resistance'
        ],
        specifications: {
            ram: '8GB',
            processor: 'Snapdragon 8 Gen 3',
            storage: '256GB',
            color: 'White',
            battery: '4880',
            screen_size: '6.73'
        },
        images: []
    },

    // --- Bangle Products ---
    {
        name: 'Royal Gold Kundan Bangle Set',
        category: banglesId,
        price: 12500,
        brand: 'Tanishq',
        description: 'Exquisite Kundan bangle set with intricate craftsmanship. Perfect for weddings and special occasions. Each bangle is handcrafted with precision.',
        highlights: [
            'Handcrafted Kundan work',
            'Set of 4 bangles',
            'Premium gold plating',
            'Comes with velvet box packaging',
            'Certificate of authenticity included'
        ],
        specifications: {
            color: 'Gold',
            size: '2.6',
            material: 'Kundan',
            weight: 85,
            occasion: 'Wedding'
        },
        images: []
    },
    {
        name: 'Silver Filigree Bangle',
        category: banglesId,
        price: 4500,
        brand: 'Kalyan',
        description: 'Elegant silver filigree bangle with delicate openwork design. A timeless piece that adds sophistication to any outfit.',
        highlights: [
            '925 Sterling Silver',
            'Handmade filigree work',
            'Anti-tarnish coating',
            'Lightweight and comfortable',
            'Suitable for daily wear'
        ],
        specifications: {
            color: 'Silver',
            size: '2.4',
            material: 'Silver',
            weight: 32,
            occasion: 'Daily Wear'
        },
        images: []
    },
    {
        name: 'Traditional Glass Bangles Set',
        category: banglesId,
        price: 850,
        brand: 'Suraj Bangles',
        description: 'Beautiful set of 12 traditional glass bangles in vibrant colors. Made in Firozabad with traditional techniques passed down through generations.',
        highlights: [
            'Set of 12 bangles',
            'Handmade in Firozabad',
            'Vibrant lac coating',
            'Traditional Indian design',
            'Available in multiple sizes'
        ],
        specifications: {
            color: 'Red',
            size: '2.4',
            material: 'Glass',
            weight: 120,
            occasion: 'Festival'
        },
        images: []
    },
    {
        name: 'Rose Gold Bracelet Bangle',
        category: banglesId,
        price: 8999,
        brand: 'Malabar Gold',
        description: 'Modern rose gold plated bangle with contemporary design. Perfect for parties and western outfits. Adjustable clasp for comfortable fit.',
        highlights: [
            'Rose gold plating',
            'Contemporary design',
            'Adjustable clasp',
            'Hypoallergenic material',
            'Gift box included'
        ],
        specifications: {
            color: 'Rose Gold',
            size: '2.4',
            material: 'Brass',
            weight: 28,
            occasion: 'Party'
        },
        images: []
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data');

        // Seed categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`Seeded ${createdCategories.length} categories`);

        const mobileCategory = createdCategories.find(c => c.name === 'Mobile');
        const banglesCategory = createdCategories.find(c => c.name === 'Bangles');

        // Seed products
        const products = getProducts(mobileCategory._id, banglesCategory._id);
        const createdProducts = await Product.insertMany(products);
        console.log(`Seeded ${createdProducts.length} products`);

        console.log('\nSeed completed successfully!');
        console.log('Categories:', createdCategories.map(c => `${c.name} (${c.attributes.length} attributes)`));
        console.log('Products:', createdProducts.map(p => p.name));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();
