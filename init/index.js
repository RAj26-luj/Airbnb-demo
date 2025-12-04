const mongoose = require('mongoose');
const express = require('express');
const Listing = require('../models/listing.js');
const initData = require('./data.js');
const { init } = require('../models/review.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/airbnb';

main().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
};

const inititDb = async () => {
  await Listing.deleteMany({});

  const OWNER_ID = '692eca1a90f6c1935e3fd688';

  const listingsWithExtras = initData.data.map(item => {
    return {
      ...item,
      owner: OWNER_ID,
      city: item.location
    };
  });

  await Listing.insertMany(listingsWithExtras);
  console.log("Database initialized with sample data");
};

inititDb();