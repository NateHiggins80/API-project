'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Spot, {
        foreignKey: 'ownerId',
        onDelete: 'CASCADE'
      })
      User.hasMany(models.Review, {
        foreignKey: "userId"
      })
      User.hasMany(models.Booking, {
        foreignKey: 'userId'
      })
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [4, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error("Cannot be an email");
          }
        }
      }
    },
    email: {
        type: DataTypes.STRING(256),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
    hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
      }
    },
    //schema: 'airbnb',
  });
  return User;
};
