const express = require('express');
const router = express.Router();
const campground = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const { storage } = require('../cloudinary');

const multer  = require('multer')
const upload = multer({ storage })

router.route('/')
    .get(campground.index)
    .post(isLoggedIn, upload.array('image'), validateCampground, campground.createCampground);

router.get('/new', isLoggedIn, campground.renderNewForm);

router.route('/:id')
    .get(campground.showCampground)
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, campground.updateCampground)
    .delete(isLoggedIn, isAuthor, campground.deleteCampground);

router.get('/:id/edit', isLoggedIn, isAuthor, campground.renderEditForm);

module.exports = router;