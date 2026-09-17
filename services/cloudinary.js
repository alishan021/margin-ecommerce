const { v2: cloudinary } = require('cloudinary');

const productFolder = process.env.CLOUDINARY_PRODUCT_FOLDER || 'margin/products';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

function assertCloudinaryConfigured() {
    const hasIndividualCredentials = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
    if (!process.env.CLOUDINARY_URL && !hasIndividualCredentials) {
        throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }
}

function uploadProductImage(file) {
    assertCloudinaryConfigured();

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: productFolder,
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
    });
}

function publicIdFromUrl(imageUrl) {
    if (typeof imageUrl !== 'string' || !/^https?:\/\//i.test(imageUrl)) return null;

    const match = imageUrl.match(/\/upload\/(?:[^/]+\/)*v\d+\/(.+)$/);
    if (!match) return null;

    return match[1].replace(/\.[^/.]+$/, '');
}

async function deleteProductImage(imageUrl) {
    const publicId = publicIdFromUrl(imageUrl);
    if (!publicId || !publicId.startsWith(`${productFolder}/`)) return;

    assertCloudinaryConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

module.exports = { uploadProductImage, deleteProductImage };
