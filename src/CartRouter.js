const express = require('express');
const cartRouter = express.Router();

module.exports = (cartManager, io) => {
    // Endpoint para crear un nuevo carrito
    cartRouter.post('/', (req, res) => {
        try {
            const newCart = req.body;
            const cartId = cartManager.createCart(newCart);
            res.status(201).json({ id: cartId });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // GET api/carts/:cid
    cartRouter.get('/:cid', async (req, res) => {
        const { cid } = req.params;

        try {
            const cart = await cartManager.getCartWithProducts(cid);
            res.json(cart);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    // Endpoint para agregar un producto a un carrito por su ID
    cartRouter.post('/:cid/product/:pid', (req, res) => {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1; 

        try {
            // Validar que quantity sea un número positivo
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error('La cantidad debe ser un número entero positivo.');
            }

            cartManager.addProductToCart(cartId, productId, quantity);

            // Envía la lista actualizada de carritos a través de WebSocket
            io.emit('cartsUpdated', cartManager.carts);

            res.status(204).end();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE api/carts/:cid/products/:pid
    cartRouter.delete('/:cid/products/:pid', (req, res) => {
        const { cid, pid } = req.params;

        try {
            cartManager.removeProductFromCart(cid, pid);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    // PUT api/carts/:cid
    cartRouter.put('/:cid', (req, res) => {
        const { cid } = req.params;
        const products = req.body.products;

        try {
            // Validar que products sea un arreglo válido
            if (!Array.isArray(products)) {
                throw new Error('La lista de productos debe ser un arreglo.');
            }

            cartManager.updateCart(cid, products);
            res.status(204).end();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // PUT api/carts/:cid/products/:pid
    cartRouter.put('/:cid/products/:pid', (req, res) => {
        const { cid, pid } = req.params;
        const quantity = req.body.quantity;

        try {
            // Validar que quantity sea un número positivo
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error('La cantidad debe ser un número entero positivo.');
            }

            cartManager.updateProductQuantity(cid, pid, quantity);
            res.status(204).end();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE api/carts/:cid
    cartRouter.delete('/:cid', (req, res) => {
        const { cid } = req.params;

        try {
            cartManager.clearCart(cid);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    return cartRouter;
};