const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'usuario' },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;