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
