const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render('campgrounds/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp.');
            res.redirect('/campgrounds');
        })
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('campgrounds/login');
}

module.exports.login = (req, res) => {
    try {
        req.flash('success', 'Welcome to YelpCamp.');
        const redirectUrl = newUrl || '/campgrounds';
        newUrl = undefined;
        res.redirect(redirectUrl);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/login');
    }
}

module.exports.logout = (req, res, next) => {
    req.logout( err => { if (err) return next(err);});
    req.flash('success', 'Goodbye!');
    res.redirect(`/campgrounds`);
}