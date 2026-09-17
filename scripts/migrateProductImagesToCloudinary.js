require('dotenv').config({ path: './.env' });

const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const productModel = require('../models/products');
const dbConnect = require('../config/db');
const { uploadProductImage } = require('../services/cloudinary');

const localImageDirectory = path.join(__dirname, '..', 'public', 'products');

async function migrateProductImages() {
    await dbConnect;
    const products = await productModel.find({ images: { $exists: true, $ne: [] } });
    let migrated = 0;

    for (const product of products) {
        const images = [];
        let changed = false;

        for (const image of product.images) {
            if (/^https?:\/\//i.test(image)) {
                images.push(image);
                continue;
            }

            const filePath = path.join(localImageDirectory, path.basename(image));
            try {
                const buffer = await fs.readFile(filePath);
                const upload = await uploadProductImage({ buffer });
                images.push(upload.secure_url);
                changed = true;
                migrated += 1;
            } catch (error) {
                console.error(`Skipped ${image} for product ${product._id}: ${error.message}`);
                images.push(image);
            }
        }

        if (changed) await productModel.findByIdAndUpdate(product._id, { images });
    }

    console.log(`Migrated ${migrated} product image(s) to Cloudinary.`);
}

if (require.main === module) {
    migrateProductImages()
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        })
        .finally(() => mongoose.connection.close());
}

module.exports = migrateProductImages;
