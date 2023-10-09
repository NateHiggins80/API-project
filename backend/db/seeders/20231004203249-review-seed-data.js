'use strict';

let options ={};
options.tableName = "Reviews";

if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

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
      spotId: 2,
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
      userId: 1,
      review: "My grandma died here during our stay. I will neve be the same",
      stars: 5
    },
    {
      spotId: 1,
      userId: 2,
      review: "Wow this palce sure was cheesey!!!",
      stars: 5
    },
    {
      spotId: 2,
      userId: 1,
      review: "The view from this spot was breathtaking!",
      stars: 4
    },
    {
      spotId: 2,
      userId: 2,
      review: "Had an amazing time at this location!",
      stars: 5
    },
    {
      spotId: 3,
      userId: 1,
      review: "Great spot for a peaceful getaway.",
      stars: 5
    },
    {
      spotId: 1,
      userId: 2,
      review: "A truly unique experience. Loved it!",
      stars: 5
    },
    {
      spotId: 4,
      userId: 3,
      review: "Not as expected. Disappointed.",
      stars: 2
    },
    {
      spotId: 5,
      userId: 4,
      review: "Absolutely gorgeous location!",
      stars: 5
    },
    {
      spotId: 6,
      userId: 5,
      review: "Average spot, nothing extraordinary.",
      stars: 3
    },
    {
      spotId: 7,
      userId: 6,
      review: "Wouldn't recommend. Overpriced for what it offers.",
      stars: 2
    },
    {
      spotId: 8,
      userId: 7,
      review: "Loved the ambiance. Perfect for a romantic getaway.",
      stars: 5
    },
    {
      spotId: 9,
      userId: 8,
      review: "The best spot I've ever been to! Will definitely return.",
      stars: 5
    }
  ], options)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.dropTable(options);
  }
};
