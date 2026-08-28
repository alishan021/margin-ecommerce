require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const adminModel = require('./models/admin');

// db.js automatically attempts to connect when required.
const db_connect = require('./config/db');

async function seedAdmin() {
    try {
        await db_connect; // Wait for the DB connection

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const newAdmin = new adminModel({ email, password });
            await newAdmin.save();
            console.log('Admin created successfully.');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedAdmin();
