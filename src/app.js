const express = require('express');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB, disconnectAndReconnect: _ } = require('../dao');
const ProductManager = require('../dao/models/ProductModel');
const CartManager = require('../dao/models/CartModel');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const UserModel = require('../dao/models/UserModel');

connectDB();

const app = express();
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'home',
}));
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.use(session({
    secret: 'miClaveSecreta',
    resave: false,
    saveUninitialized: true,
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, done) => {
        try {
            const user = await UserModel.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'Email o contraseña incorrectos' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Email o contraseña incorrectos' });
            }
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new GitHubStrategy(
    {
        clientID: 'TU_CLIENT_ID',
        clientSecret: 'TU_CLIENT_SECRET',
        callbackURL: 'http://localhost:8899/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await UserModel.findOne({ githubId: profile.id });

            if (!user) {
                user = await UserModel.create({
                    githubId: profile.id,
                    displayName: profile.displayName,
                    username: profile.username,
                    
                });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/products');
    } else {
        res.render('login');
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/',
    failureFlash: true,
}));

app.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.use(express.json());

const productManager = new ProductManager();
const cartManager = new CartManager();

app.get('/products', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('products', { user: req.user, products: productManager.getProducts() });
    } else {
        res.redirect('/');
    }
});

// Socket.io setup
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('getRealTimeProducts', () => {
        const realTimeProducts = productManager.getProducts();
        io.emit('updateRealTimeProducts', realTimeProducts);
    });

    socket.on('updateProduct', (productId, updatedProduct) => {
        productManager.updateProduct(productId, updatedProduct);
        io.emit('updateRealTimeProducts', productManager.getProducts());
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(8899, () => {
    console.log('Express server running on port 8899');
});