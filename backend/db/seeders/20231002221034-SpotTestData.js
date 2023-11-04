'use strict';
const { Spot } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await Spot.bulkCreate([
    {
      ownerId: 1,
      address: '123 Rosewood Drive',
      city: 'Appletown',
      state: "GingernSpice",
      country: 'Fruitopia',
      lat: -38.62764,
      lng: 165.73634,
      name: "The Big Apple",
      description: 'We are the best at apples',
      price: 599
    },
    {
      ownerId: 2,
      address: '222 Granite Lane',
      city: 'Mountain Town',
      state: "Big Rock",
      country: "LandORockia",
      lat: -43.02152,
      lng: 60.99279,
      name: "Old Rockie",
      description: "A great place and a lot of rocks",
      price: 250
    },
    {
      ownerId: 3,
      address: '1919 Cheddar Blvd',
      city: 'Cheezwiz',
      state: "TheCheeseRound",
      country: "Cheeserstan",
      lat: -54.72287,
      lng: 38.63181,
      name: "Munster",
      description: "Super cheesey but delicious place",
      price: 99
    },
    {
      ownerId: 1,
      address: '123 Rosewood Drive',
      city: 'Appletown',
      state: 'GingernSpice',
      country: 'Fruitopia',
      lat: -38.62764,
      lng: 165.73634,
      name: 'The Big Apple',
      description: 'We are the best at apples',
      price: 599
    },
    {
      ownerId: 2,
      address: '222 Granite Lane',
      city: 'Mountain Town',
      state: 'Big Rock',
      country: 'LandORockia',
      lat: -43.02152,
      lng: 60.99279,
      name: 'Old Rockie',
      description: 'A great place and a lot of rocks',
      price: 250
    },
    {
      ownerId: 3,
      address: '1919 Cheddar Blvd',
      city: 'Cheezwiz',
      state: 'TheCheeseRound',
      country: 'Cheeserstan',
      lat: -54.72287,
      lng: 38.63181,
      name: 'Munster',
      description: 'Super cheesy but delicious place',
      price: 99
    },
    {
      ownerId: 4,
      address: '432 Orchard Avenue',
      city: 'Fruitville',
      state: 'Citrus',
      country: 'Fruitland',
      lat: 25.37694,
      lng: -80.12872,
      name: 'Citrus Grove',
      description: 'A grove full of citrus trees',
      price: 399
    },
    {
      ownerId: 5,
      address: '543 Pine Street',
      city: 'Woodland',
      state: 'Pineville',
      country: 'Pineasia',
      lat: 34.23612,
      lng: 40.21341,
      name: 'Pine Retreat',
      description: 'Surrounded by beautiful pine trees',
      price: 51
    },
    {
      ownerId: 6,
      address: '777 Maple Lane',
      city: 'Mapletown',
      state: 'Mapleland',
      country: 'Maplania',
      lat: 41.87811,
      lng: -87.62980,
      name: 'Maple Haven',
      description: 'A haven with stunning maple trees',
      price: 449
    },
    {
      ownerId: 7,
      address: '987 Rosemary Avenue',
      city: 'Herbville',
      state: 'Sage',
      country: 'Herbalia',
      lat: 32.71574,
      lng: -117.16108,
      name: 'Herbal Escape',
      description: 'Escape to a world of aromatic herbs',
      price: 499
    },
    {
      ownerId: 8,
      address: '789 Lavender Lane',
      city: 'Floral City',
      state: 'Lavenderland',
      country: 'Floralia',
      lat: 38.89511,
      lng: -77.03637,
      name: 'Lavender Retreat',
      description: 'A peaceful retreat with blooming lavender',
      price: 349
    },
    {
      ownerId: 9,
      address: '654 Sunflower Street',
      city: 'Sunnyville',
      state: 'Sunflowerland',
      country: 'Sunfloweria',
      lat: 34.05223,
      lng: -118.24368,
      name: 'Sunflower Paradise',
      description: 'Paradise surrounded by vibrant sunflowers',
      price: 289
    },
    {
      ownerId: 10,
      address: '876 Oak Avenue',
      city: 'Oakland',
      state: 'Oaklandia',
      country: 'Oakyland',
      lat: 37.80436,
      lng: -122.27111,
      name: 'Oak Oasis',
      description: 'An oasis of mighty oak trees',
      price: 399
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Spots', {}, {});
  }
};
