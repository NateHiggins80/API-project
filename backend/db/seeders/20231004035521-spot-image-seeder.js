'use strict';
const { SpotImage } = require('../models');
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
   await SpotImage.bulkCreate([
    {
      spotId: 1,
      url: "https://media.tenor.com/n3jzz4VgdY4AAAAC/apple-emotion-terrified.gif",
      preview: true
    },
    {
      spotId: 2,
      url: "https://preview.redd.it/w9efjf45swb21.jpg?width=960&crop=smart&auto=webp&s=701089f3bbad4168b1b12325b3844e9e3dbca35a",
      preview: true
    },
    {
      spotId: 3,
      url: "https://img.freepik.com/premium-photo/city-made-cheese-generative-ai_384720-4723.jpg?w=1060",
      preview: true
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
    await queryInterface.bulkDelete("SpotImages");
  }
};
