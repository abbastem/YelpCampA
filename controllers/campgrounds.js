const Campground = require("../models/campgound");
const { cloudinary } = require('../cloudinary');

//-------------------------------------------------
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
//-------------------------------------------------

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    try {
        //-------------------------------------------------
        const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
        //-------------------------------------------------

        const campground = new Campground(req.body);

        //-------------------------------------------------
        campground.geometry = geoData.features[0].geometry;
        //-------------------------------------------------

        campground.image = req.files.map( p => ({ url: p.path, filename: p.filename}))
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully created campground');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/campgrounds/new');
    }
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'review',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', { campground });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect(`/campgrounds`);
    }
}

module.exports.updateCampground = async (req, res) => {
    try {
        const camp = await Campground.findByIdAndUpdate(req.params.id, req.body);

        //-------------------------------------------------
        const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
        camp.geometry = geoData.features[0].geometry;
        //-------------------------------------------------

        const img = req.files.map( p => ({ url: p.path, filename: p.filename}));
        camp.image.push(...img);
        await camp.save();
        if (req.body.deleteImages) {
            for (let image of req.body.deleteImages) {
                cloudinary.uploader.destroy(image);
            }
            await camp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
        }
        req.flash('success', 'Successfully updated campground');
        res.redirect(`/campgrounds/${camp._id}`)
    } catch (err) {
        req.flash('error', err.message);
        res.redirect(`/campgrounds/${req.params.id}/edit`);
    }
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}