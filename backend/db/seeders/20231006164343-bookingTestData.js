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
      userId: 3,
      startDate: '2023-10-28',
      endDate: '2023-11-06'
    },
    {
      spotId: 2,
      userId: 1,
      startDate: '2024-09-21',
      endDate: '2024-10-11'
    },
    {
      spotId: 1,
      userId: 4,
      startDate: '2023-12-01',
      endDate: '2023-12-05'
    },
    {
      spotId: 2,
      userId: 5,
      startDate: '2024-01-15',
      endDate: '2024-01-25'
    },
    {
      spotId: 3,
      userId: 6,
      startDate: '2024-02-20',
      endDate: '2024-02-25'
    },
    {
      spotId: 1,
      userId: 7,
      startDate: '2024-03-10',
      endDate: '2024-03-15'
    },
    {
      spotId: 2,
      userId: 8,
      startDate: '2024-04-05',
      endDate: '2024-04-10'
    },
    {
      spotId: 3,
      userId: 9,
      startDate: '2024-05-12',
      endDate: '2024-05-18'
    },
    {
      spotId: 1,
      userId: 10,
      startDate: '2024-06-21',
      endDate: '2024-06-27'
    },
    {
      spotId: 2,
      userId: 11,
      startDate: '2024-07-10',
      endDate: '2024-07-15'
    },
    {
      spotId: 3,
      userId: 12,
      startDate: '2024-08-05',
      endDate: '2024-08-12'
    },
    {
      spotId: 1,
      userId: 4,
      startDate: '2024-09-17',
      endDate: '2024-09-24'
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
    await queryInterface.bulkDelete("Reviews");
  }
};
