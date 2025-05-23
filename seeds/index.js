const mongoose = require('mongoose');
const Campground = require('../models/campgound');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database Connected'));

const sample = (data) => Math.floor(Math.random() * data.length);

const addData = async () => {
    await Campground.deleteMany();
    for (let i = 0; i < 300 ; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 1;
        const city = new Campground({
            author: '682a225c455478ea02d4b08b',
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${descriptors[sample(descriptors)]} ${places[sample(places)]}`,
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores atque corporis eaque eos facere impedit modi nam nihil odio odit, officiis praesentium, quas quia recusandae soluta suscipit ut. Doloribus, quo.',
            image: [
                {
                    url: 'https://res.cloudinary.com/dksnhksnk/image/upload/v1747669608/YelpCamp/ruwomdxdnwhgndhbds4h.jpg',
                    filename: 'YelpCamp/ruwomdxdnwhgndhbds4h'
                },
                {
                    url: 'https://res.cloudinary.com/dksnhksnk/image/upload/v1747669610/YelpCamp/b8pmo5fnuwjv6nvr6qbk.jpg',
                    filename: 'YelpCamp/b8pmo5fnuwjv6nvr6qbk'
                }
            ]
        })
        await city.save();
    }
}

addData().then( () => {
    mongoose.connection.close();
})
