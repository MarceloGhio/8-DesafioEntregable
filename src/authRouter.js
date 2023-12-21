const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const UserModel = require('../dao/models/UserModel');

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/',
    failureFlash: true,
}));

authRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

authRouter.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/products');
    }
);

module.exports = authRouter;