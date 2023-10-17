
const passport = require('passport')
// const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(new JwtStrategy(opts, async  function(jwt_payload, done) {
    // console.log( jwt_payload) // { payload: 'hamza', iat: 1697575620, exp: 1697590020 }
        // User.findOne({ username : jwt_payload.payload }, function (err, user) {
        //     if (err) { return done(err); } //When some error occurs

        //     if (!user) {  //When username is invalid
        //         return done(null, false, { message: 'Incorrect username.' });
        //     }

        //     if (password!== user.password) { //When password is invalid 
        //         return done(null, false, { message: 'Incorrect password.' });
        //     }

        //     return done(null, user); //When user is valid
        // });

        try {
            const user = await User.findOne({ username: jwt_payload.payload });
            console.log(user)
    
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
    
            // if (password !== user.password) {
            //     return done(null, false, { message: 'Incorrect password.' });
            // }
    
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }
));

// //Persists user data inside session
// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });

// //Fetches session details using session id
// passport.deserializeUser(function (id, done) {
//     UserModel.findById(id, function (err, user) {
//         done(err, user);
//     });
// });