const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const UserModel = require('../../dao/models/UserModel');

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await UserModel.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }

            if (!await bcrypt.compare(password, user.password)) {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use(new GitHubStrategy(
    {
        clientID: 'YOUR_GITHUB_CLIENT_ID',
        clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
        callbackURL: 'http://localhost:8899/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Busca un usuario en tu base de datos por el ID de GitHub
            const existingUser = await UserModel.findOne({ githubId: profile.id });

            if (existingUser) {
                // Si el usuario existe, devuélvelo
                return done(null, existingUser);
            }

            // Si el usuario no existe, créalo con la información de GitHub
            const newUser = await UserModel.create({
                githubId: profile.id,
                displayName: profile.displayName,
                username: profile.username,
                
            });

            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
));