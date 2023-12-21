const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, unique: true, required: true },
    age: { type: Number },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    role: { type: String, default: 'user' },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;