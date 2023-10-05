'use strict';
const { Review } = require('../models');
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
   await Review.bulkCreate([
    {
      spotId: 1,
      userId: 1,
      review: "I seen better",
      stars: 1
    },
    {
      spotId: 2,
      userId: 2,
      review: "This palce was the bee's knees",
      stars: 4
    },
    {
      spotId: 3,
      userId: 3,
      review: "My grandma died here during our stay. I will neve be the same",
      stars: 5
    },
    {
      spotId: 1,
      userId: 1,
      review: "Wow this palce sure was cheesey!!!",
      stars: 5
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
    await queryInterface.bulkDelete("Reviews");
  }
};
