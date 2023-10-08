'use strict';
const { ReviewImage } = require('../models');
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
   await ReviewImage.bulkCreate([
    {
      reviewId: 1,
      url: 'https://www.arch2o.com/wp-content/uploads/2015/12/Arch2O-earthship-homes-michael-reynolds-17-1536x1024.jpg'
    },
    {
      reviewId: 2,
      url: 'https://images.trvl-media.com/lodging/56000000/55170000/55168500/55168429/2fe4b474.jpg?impolicy=resizecrop&rw=1200&ra=fit'
    },
    {
      reviewId: 3,
      url: 'https://files.holidaycottages.co.uk/FCImages/55935/55935-RPM-01.jpg?width=770'
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
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
  };
