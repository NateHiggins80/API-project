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
    {
      reviewId: 4,
      url: 'https://pangeabuilders.s3.us-west-2.amazonaws.com/wp-content/uploads/20211202160203/norfolk-earthship-1.jpg'
    },
    {
      reviewId: 5,
      url: 'https://loveincorporated.blob.core.windows.net/contentimages/gallery/194ebd03-e2de-4774-b56a-243811ee1067-eco-friendly-earthship-the-phoenix-2.jpg'
    },
    {
      reviewId: 6,
      url: 'https://loveincorporated.blob.core.windows.net/contentimages/gallery/c9639ccf-7683-4d2b-aac3-9e9f527601f5-earthship-the-greater-community.jpg'
    },
    {
      reviewId: 7,
      url: 'https://loveincorporated.blob.core.windows.net/contentimages/gallery/fbaa5aba-fbd7-41a8-a550-3f81aee219af-earthship-solar-panels.jpg'
    },
    {
      reviewId: 8,
      url: 'https://s3.amazonaws.com/img.kh-labs.com/SYXwdr6401f1cc6a7980.15234848'
    },
    {
      reviewId: 9,
      url: 'https://www.newyorkupstate.com/resizer/zSZIoEU0uNUvos7euq88G32Mbqg=/1280x0/smart/advancelocal-adapter-image-uploads.s3.amazonaws.com/image.newyorkupstate.com/home/nyup-media/width2048/img/northern-ny/photo/2016/08/24/20976974-standard.jpg'
    },
    {
      reviewId: 10,
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Exterior_Jacobsen_House_Earthship_2009.JPG'
    },
    {
      reviewId: 11,
      url: 'https://www.housedigest.com/img/gallery/take-a-tour-of-this-iconic-new-mexico-earthship-home-thats-for-sale/the-exterior-is-just-as-eco-friendly-as-the-inside-1649870676.webp'
    },
    {
      reviewId: 12,
      url: 'https://www.housedigest.com/img/gallery/take-a-tour-of-this-iconic-new-mexico-earthship-home-thats-for-sale/the-basic-necessities-of-this-home-are-equally-appealing-1649870676.webp'
    },
    {
      reviewId: 13,
      url: 'https://www.housedigest.com/img/gallery/take-a-tour-of-this-iconic-new-mexico-earthship-home-thats-for-sale/both-the-living-room-and-kitchens-areas-are-eye-catching-1649870676.webp'
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
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
  };
