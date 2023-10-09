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
    {
      spotId: 1,
      url: 'https://media.tenor.com/n3jzz4VgdY4AAAAC/apple-emotion-terrified.gif',
      preview: false
    },
    {
      spotId: 2,
      url: 'https://preview.redd.it/w9efjf45swb21.jpg?width=960&crop=smart&auto=webp&s=701089f3bbad4168b1b12325b3844e9e3dbca35a',
      preview: false
    },
    {
      spotId: 3,
      url: 'https://img.freepik.com/premium-photo/city-made-cheese-generative-ai_384720-4723.jpg?w=1060',
      preview: false
    },
    {
      spotId: 4,
      url: 'https://pangeabuilders.s3.us-west-2.amazonaws.com/wp-content/uploads/20210715105145/arca-house-marko-brajovic-earthship-2.jpeg',
      preview: true
    },
    {
      spotId: 5,
      url: 'https://images2.dwell.com/photos/6063391372700811264/6940704240449138688/original.jpg?auto=format&q=35&w=1920',
      preview: true
    },
    {
      spotId: 6,
      url: 'https://images.squarespace-cdn.com/content/v1/58824edc2994ca063b15fc1f/1498085025754-CZLOFAX21YOJ13MXZF59/Phoenix+ext+flowers.JPG?format=2500w',
      preview: true
    },
    {
      spotId: 7,
      url: 'https://cdn-fhofj.nitrocdn.com/YLARnxovRxHnoSTcLUnkvhePKVxPqkls/assets/images/source/rev-75d86f4/www.ecowatch.com/wp-content/uploads/2021/09/359568504-origin.jpg',
      preview: true
    },
    {
      spotId: 8,
      url: 'https://i0.wp.com/zenbird.media/wp-content/uploads/2022/01/earthshipMIMA-1.jpg?w=1000&ssl=1',
      preview: true
    },
    {
      spotId: 9,
      url: 'https://ogden_images.s3.amazonaws.com/www.motherearthnews.com/images/1991/10/22142841/128-040-01i5.jpg',
      preview: true
    },
    {
      spotId: 10,
      url: 'https://www.housedigest.com/img/gallery/take-a-tour-of-this-iconic-new-mexico-earthship-home-thats-for-sale/intro-1649870676.webp',
      preview: true
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
    await queryInterface.bulkDelete("SpotImages");
  }
};
