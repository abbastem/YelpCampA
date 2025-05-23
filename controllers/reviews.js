const Campground = require("../models/campgound");
const Review = require("../models/review");


module.exports.updateReview = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id);
        const review = await Review(req.body);
        review.author = req.user._id;
        campground.review.push(review);
        await review.save();
        await campground.save();
        req.flash('success', 'Successfully created review');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        req.flash('error', err.message);
        res.redirect(`/campgrounds/${req.params.id}`);
    }
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { eview: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}