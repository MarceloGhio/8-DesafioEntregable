const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  status: { type: Boolean, default: true },
});

const Product = mongoose.model("Product", productSchema);

class ProductManager {
  constructor() {
    // No se inicializan los productos aquí
  }

  async initializeProducts() {
    try {
      const products = await Product.find();
      this.products = products;
      this.updateProductIdCounter();
    } catch (err) {
      this.products = [];
    }
  }

  updateProductIdCounter() {
    if (this.products.length > 0) {
      const maxId = Math.max(...this.products.map((product) => product.id));
      this.productIdCounter = maxId + 1;
    }
  }

  saveProducts() {
    Product.insertMany(this.products)
      .then(() => console.log("Productos guardados en MongoDB"))
      .catch((err) =>
        console.error("Error al guardar productos en MongoDB:", err.message)
      );
  }

  addProduct(product) {
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.thumbnail ||
      !product.code ||
      !product.stock ||
      !product.category
    ) {
      throw new Error("Todos los campos son obligatorios.");
    }

    if (
      this.products.some(
        (existingProduct) => existingProduct.code === product.code
      )
    ) {
      throw new Error("El código del producto ya existe.");
    }

    if (product.status === undefined) {
      product.status = true;
    }

    product.id = this.productIdCounter++;
    this.products.push(product);
    this.saveProducts();
  }

  async getProducts(limit, page, sort, query) {
    let filter = {};

    if (query) {
      filter = { $or: [{ category: query }, { status: query }] };
    }

    let sortQuery = {};

    if (sort === "asc") {
      sortQuery = { price: 1 };
    } else if (sort === "desc") {
      sortQuery = { price: -1 };
    }

    const options = {
      limit,
      page,
      sort: sortQuery,
    };

    try {
      const products = await Product.paginate(filter, options);
      return products;
    } catch (error) {
      throw new Error("Error al obtener productos.");
    }
  }

  async getProductById(id) {
    const product = this.products.find(
      (existingProduct) => existingProduct.id === id
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    return product;
  }

  updateProduct(id, updatedProduct) {
    const productIndex = this.products.findIndex(
      (product) => product.id === id
    );
    if (productIndex === -1) {
      throw new Error("Producto no encontrado.");
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updatedProduct,
    };
    this.saveProducts();
  }

  deleteProduct(id) {
    const productIndex = this.products.findIndex(
      (product) => product.id === id
    );
    if (productIndex === -1) {
      throw new Error("Producto no encontrado.");
    }

    this.products.splice(productIndex, 1);
    this.saveProducts();
  }
}

module.exports = ProductManager;