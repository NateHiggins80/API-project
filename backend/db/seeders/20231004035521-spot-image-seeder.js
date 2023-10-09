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
      preview: true
    },
    {
      spotId: 2,
      url: 'https://preview.redd.it/w9efjf45swb21.jpg?width=960&crop=smart&auto=webp&s=701089f3bbad4168b1b12325b3844e9e3dbca35a',
      preview: true
    },
    {
      spotId: 3,
      url: 'https://img.freepik.com/premium-photo/city-made-cheese-generative-ai_384720-4723.jpg?w=1060',
      preview: true
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
      url: 'https://bloximages.newyork1.vip.townnews.com/santafenewmexican.com/content/tncms/assets/v3/editorial/3/d2/3d2d7019-a1d1-5e06-90ac-69ae8ebabad3/57a3ace7934de.image.jpg?resize=667%2C500',
      preview: true
    },
    {
      spotId: 10,
      url: 'https://cdn.greatlifepublishing.net/wp-content/uploads/sites/2/2023/01/23111025/1200x628-template-4-2023-01-23T111011.281.png',
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
