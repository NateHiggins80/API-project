'use strict';
const { Booking } = require('../models');
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
   await Booking.bulkCreate([
    {
      spotId: 3,
      userId: 2,
      startDate: '2022-12-27',
      endDate: '2023-01-05'
    },
    {
      spotId: 1,
      userId: 3,
      startDate: '2023-03-10',
      endDate: '2023-03-17'
    },
    {
      spotId: 2,
      userId: 1,
      startDate: '2023-06-13',
      endDate: '2023-07-02'
    },
    {
      spotId: 1,
      userId: 4,
      startDate: '2023-10-28',
      endDate: '2023-11-06'
    },
    {
      spotId: 2,
      userId: 1,
      startDate: '2024-09-21',
      endDate: '2024-10-11'
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
