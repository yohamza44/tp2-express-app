const express = require('express');
const User = require('./models/user');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());
app.use(morgan("tiny"));


app.set('view engine', 'pug');
app.set('views','./views');



require('./config/passport');

app.use(passport.initialize())


//************************************** */
app.get("/", function (req, res) {
  
   res.redirect("home");
  });

app.get("/login", function (req, res) {
  const token = req.cookies.jwt; 

  if (token) {
    const books = require('./constants/data.json');
    
    res.redirect('home');
  }

  else res.render("login");
});

app.post('/login', async (req, res) => {
  const {username,password} = req.body;  
      try {
        const existingUser = await User.findOne({ username })
       
        if (!existingUser) return res.status(404).json({ message: "User not found" });
        const isPasswordCorrect = password === existingUser.password
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credential !" });
        const token = jwt.sign({
           payload: username
        },
           process.env.SECRET,
           {
              expiresIn: '4h'
           })
            res.cookie('jwt', 'Bearer '+ token);
            
            res.redirect('home');
      } catch (error) {
         res.status(500).json({ "message": error.message })
      }
});



app.get("/register", function (req, res) {
  const token = req.cookies.jwt; // Assuming 'jwt' is the name of your cookie

  if (token) {
    const books = require('./constants/data.json');
    
    res.redirect('home');
  }

  else res.render("register");
  });

// Handle the registration form submission (POST request)
app.post('/register', async (req, res) => {
    const {username,password} = req.body;  
        try {
           const existingUser = await User.findOne({ username })
           if (existingUser) return res.status(400).json({ message: "User already exists" });
          
            await User.create(
              { username, password  }
           )
           const token = jwt.sign({
              payload :username
           },
           process.env.SECRET,
              {
                 expiresIn: '4h'
              })

              res.cookie('jwt',  'Bearer '+ token);

              // Redirigez l'utilisateur vers la page d'accueil
              res.redirect('home');

              // res.render('home', { token });
              // // Redirect to a success page or perform other actions
              // // req.session.username = username;
              // res.redirect('/home');
        //    res.status(200).json(  token );
     
        } catch (error) {
           res.status(500).json({ "message": error.message })
        }
  });


  app.get('/home', (req, res, next) => {
    // Extract the token from the cookie
    const token = req.cookies.jwt; // Assuming 'jwt' is the name of your cookie

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Set the token as a bearer token in the request headers
    req.headers.authorization = `${token}`;

    // Now, you can use the 'passport.authenticate' middleware
    passport.authenticate('jwt', { session: false })(req, res, next);
}, (req, res) => {
    // This part of the code will execute if authentication is successful
    const books = require('./constants/data.json');
    
    res.render('home', {  books : books });
});




// mongodb connect
const MONGOOSE_URL = process.env.MONGOOSE_URL;

const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGOOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running from port ${PORT}`))
  )
  .catch((err) => console.log(err.message));
