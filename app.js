if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const expressError = require('./utils/expressError');
const ejs_mate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');

// const dbUrl = process.env.DB_URL2 || 'mongodb://localhost:27017/yelp-camp';
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const campgroundRouter = require('./routes/camp');
const reviewRouter = require('./routes/review');
const userRouter = require('./routes/user');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database Connected'));

const app = express();

app.engine('ejs', ejs_mate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/bootstrapStyle' ,express.static(path.join(__dirname, 'bootstrapStyle')));
app.use('/public' ,express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const sessionOptions = {
    name: 'session',
    secret: 'key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    // "https://api.tiles.mapbox.com",
    // "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    // "https://api.mapbox.com",
    // "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    // "https://api.mapbox.com",
    // "https://*.tiles.mapbox.com",
    // "https://events.mapbox.com",
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dksnhksnk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    newUrl = req.session.returnTo;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

app.use('/', userRouter);
app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/review', reviewRouter);

app.all('/:id', (req, res, next) => {
    next(new expressError('Page Not Found', 404));
})

app.use( (err, req, res, next) => {
    const { message = 'Something wont error !!!', statusCode = 500 } = err;
    res.status(statusCode).render('allError', { err })
})

app.listen(3000, () => {
    console.log('Server running on port 3000');
})
