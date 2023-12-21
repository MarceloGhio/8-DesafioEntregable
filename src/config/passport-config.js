const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../../dao/models/UserModel');

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