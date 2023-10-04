'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, {
        foreignKey: "userId"
      })

      Review.belongsTo(models.Spot, {
        foreignKey: "spotId"
      })

    }
  }




  Review.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    review: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stars: {
      type: DataTypes.INTEGER,

    }
  }, {
    sequelize,
    modelName: 'review',
  });
  return Review;
};
