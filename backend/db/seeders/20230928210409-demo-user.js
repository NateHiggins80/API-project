'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

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
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        firstName: 'Demo',
        lastName: 'Lition',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        firstName: 'FakeMan',
        lastName: 'Buttershanks',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        firstName: 'Meat',
        lastName: 'Ball',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        email: 'user3@example.com',
        username: 'TestUser3',
        firstName: 'John',
        lastName: 'Doe',
        hashedPassword: bcrypt.hashSync('testpassword3')
      },
      {
        email: 'user4@example.com',
        username: 'TestUser4',
        firstName: 'Alice',
        lastName: 'Smith',
        hashedPassword: bcrypt.hashSync('testpassword4')
      },
      {
        email: 'user5@example.com',
        username: 'TestUser5',
        firstName: 'Bob',
        lastName: 'Johnson',
        hashedPassword: bcrypt.hashSync('testpassword5')
      },
      {
        email: 'user6@example.com',
        username: 'TestUser6',
        firstName: 'Eve',
        lastName: 'Brown',
        hashedPassword: bcrypt.hashSync('testpassword6')
      },
      {
        email: 'user7@example.com',
        username: 'TestUser7',
        firstName: 'Sarah',
        lastName: 'Clark',
        hashedPassword: bcrypt.hashSync('testpassword7')
      },
      {
        email: 'user8@example.com',
        username: 'TestUser8',
        firstName: 'Michael',
        lastName: 'Davis',
        hashedPassword: bcrypt.hashSync('testpassword8')
      },
      {
        email: 'user9@example.com',
        username: 'TestUser9',
        firstName: 'Laura',
        lastName: 'Hill',
        hashedPassword: bcrypt.hashSync('testpassword9')
      },
      {
        email: 'user10@example.com',
        username: 'TestUser10',
        firstName: 'Kevin',
        lastName: 'Turner',
        hashedPassword: bcrypt.hashSync('testpassword10')
      },
      {
        email: 'user11@example.com',
        username: 'TestUser11',
        firstName: 'Oliver',
        lastName: 'Adams',
        hashedPassword: bcrypt.hashSync('testpassword11')
      },
      {
        email: 'user12@example.com',
        username: 'TestUser12',
        firstName: 'Sophia',
        lastName: 'Wright',
        hashedPassword: bcrypt.hashSync('testpassword12')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};
