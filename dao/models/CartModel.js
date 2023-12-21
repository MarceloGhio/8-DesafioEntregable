const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cartSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4, required: true },
    products: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
        },
    ],
});

const CartModel = mongoose.model('Cart', cartSchema);

module.exports = CartModel;