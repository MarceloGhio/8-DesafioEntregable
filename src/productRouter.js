
const express = require('express');
const productRouter = express.Router();

module.exports = (productManager, io) => {
    // Endpoint para obtener todos los productos
    productRouter.get('/', async (req, res) => {
        const { limit = 10, page = 1, sort, query } = req.query;
    
        try {
            const products = await productManager.getProducts(parseInt(limit), parseInt(page), sort, query);
    
            const totalPages = Math.ceil(products.total / limit);
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
    
            const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null;
            const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null;
    
            res.json({
                status: 'success',
                payload: products.docs,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page: parseInt(page),
                hasPrevPage,
                hasNextPage,
                prevLink,
                nextLink,
            });
        } catch (error) {
            res.status(404).json({ status: 'error', error: error.message });
        }
    });

        // Endpoint para obtener un producto por su ID
        productRouter.get('/:pid', async (req, res) => {
            const productId = parseInt(req.params.pid);
            try {
                const product = await productManager.getProductById(productId);
                res.json(product);
            } catch (error) {
                res.status(404).json({ error: error.message });
            }
        });
    
        // Endpoint para agregar un nuevo producto
        productRouter.post('/', async (req, res) => {
            try {
                const newProduct = req.body;
                productManager.addProduct(newProduct);
    
                // Envía la lista actualizada de productos a través de WebSocket
                io.emit('productsUpdated', await productManager.getProducts());
    
                res.status(201).json(newProduct);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    
        // Endpoint para actualizar un producto por su ID
        productRouter.put('/:pid', async (req, res) => {
            const productId = parseInt(req.params.pid);
            try {
                const updatedProduct = req.body;
                productManager.updateProduct(productId, updatedProduct);
    
                // Envía la lista actualizada de productos a través de WebSocket
                io.emit('productsUpdated', await productManager.getProducts());
    
                res.json(updatedProduct);
            } catch (error) {
                res.status(404).json({ error: error.message });
            }
        });
    
        // Endpoint para eliminar un producto por su ID
        productRouter.delete('/:pid', async (req, res) => {
            const productId = parseInt(req.params.pid);
            try {
                productManager.deleteProduct(productId);
    
                // Envía la lista actualizada de productos a través de WebSocket
                io.emit('productsUpdated', await productManager.getProducts());
    
                res.status(204).end();
            } catch (error) {
                res.status(404).json({ error: error.message });
            }
        });
    
        return productRouter;
    };
    