const mongoose = require('mongoose');
const CartModel = require('./models/CartModel');
const ProductModel = require('./models/ProductModel');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://cliente-1:<soycliente>@e-commerce.3hwzoj5.mongodb.net/?retryWrites=true&w=majority');
        console.log('Conectado a MongoDB');
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err.message);
        process.exit(1);
    }
};

const disconnectAndReconnect = () => {
    mongoose.disconnect(() => {
        connectDB();
    });
};

module.exports = { connectDB, CartModel, ProductModel, disconnectAndReconnect };