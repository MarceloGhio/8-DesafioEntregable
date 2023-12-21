const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const cartSchema = new Schema({
    id: { type: String, default: uuidv4, required: true },
    products: [
        {
            id: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
});

const Cart = mongoose.model('Cart', cartSchema);

class CartManager {
    constructor() {
        // No se inicializan los carritos aquí
    }

    async initializeCarts() {
        try {
            const carts = await Cart.find();
            this.carts = carts;
            this.updateCartIdCounter();
        } catch (err) {
            this.carts = [];
        }
    }

    updateCartIdCounter() {
        if (this.carts.length > 0) {
            const maxId = Math.max(...this.carts.map((cart) => cart.id));
            this.cartIdCounter = maxId + 1;
        }
    }

    saveCarts() {
        Cart.insertMany(this.carts)
            .then(() => console.log('Carritos guardados en MongoDB'))
            .catch((err) => console.error('Error al guardar carritos en MongoDB:', err.message));
    }

    createCart(cart) {
        const cartId = this.generateUniqueId();
        cart.id = cartId;
        cart.products = [];
        this.carts.push(cart);
        this.saveCarts();
        return cartId;
    }

    async getCartById(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado.");
            }
            return cart;
        } catch (error) {
            throw new Error("Error al obtener el carrito por ID.");
        }
    }

    addProductToCart(cartId, productId, quantity) {
        const cartIndex = this.carts.findIndex((cart) => cart.id === cartId);

        if (cartIndex !== -1) {
            const productIndex = this.carts[cartIndex].products.findIndex((product) => product.id === productId);

            if (productIndex !== -1) {
                this.carts[cartIndex].products[productIndex].quantity += quantity;
            } else {
                this.carts[cartIndex].products.push({ id: productId, quantity });
            }

            this.saveCarts();
        } else {
            throw new Error("Carrito no encontrado.");
        }
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

module.exports = CartManager;