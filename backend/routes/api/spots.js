const express = require('express');

const { requireAuth } = require("../../utils/auth");
const { Spot, User, SpotImage, Review } = require('../../db/models');
const Sequelize = require('sequelize')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const options = {};

const router = express.Router();


router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

    const spots = await Spot.findAll({
      where: {
        ownerId: user.id
      },
      include: [
        {
          model: Review,
          attributes: [['stars', 'avgRating']]
        },
        {
          model: SpotImage,
          attributes: [['url', 'previewImage']]
        }
      ],
      group: ['Spot.id']
    });

    const formattedSpots = [];
    for (const spot of spots) {
      const spotJson = spot.toJSON();
      let avgRating = null;
      let previewImage = null;

      if (spotJson.Reviews.length > 0) {
        avgRating = spotJson.Reviews[0].avgRating;
      }

      if (spotJson.SpotImages.length > 0) {
        previewImage = spotJson.SpotImages[0].previewImage;
      }

      const formattedSpot = {
        id: spotJson.id,
        ownerId: spotJson.ownerId,
        address: spotJson.address,
        city: spotJson.city,
        state: spotJson.state,
        country: spotJson.country,
        lat: spotJson.lat,
        lng: spotJson.lng,
        name: spotJson.name,
        description: spotJson.description,
        price: spotJson.price,
        createdAt: spotJson.createdAt,
        updatedAt: spotJson.updatedAt,
        avgRating,
        previewImage
      };

      formattedSpots.push(formattedSpot);
    }

    res.status(200).json({ Spots: formattedSpots });
  });


router.get('/:spotId', async(req, res) => {
    const { spotId } = req.params

    const spot = await Spot.findByPk( spotId, {
        include:
        [
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview'],
            },
            {
                model: User,
                as: 'Owner',
                attributes: ['id', 'firstName', 'lastName']
            },

        ],
    });

    if (!spot) {
        res.status(404);
        res.json(
            {
            "message": "Spot couldn't be found"
            }
        )
    };

    const result = spot.toJSON();

    const reviews = await Review.count({
         where: {
            spotId: spotId
         }
    });

    const sumReview = await Review.sum( 'stars', {
        where: {
                spotId: spot.id
            }
    });
   result.numReviews = reviews;
   result.avgRating = sumReview / reviews;

    res.json(result);
});

//GET ALL SPOTS
router.get('/:spotId', async (req, res) => {
    try {
    const { spotId } = req.params;

    const spotDetails = await Spot.findByPk(spotId,
        {
            include: [
                { model: SpotImage },
                { model: User, as: 'Owner' }
            ]
        }
    );

      res.status(200).json(spotDetails);
    } catch (error) {
        res.status(404).json({
            message: "Spot couldn't be found"
        })
    }
  });

  router.get('/', async (req, res) => {
    const spots = await Spot.findAll({
      include: [
        {
          model: Review,
          attributes: [['stars', 'avgRating']]
        },
        {
          model: SpotImage,
          attributes: [['url', 'previewImage']]
        }
      ]
    });

    const formattedSpots = [];
    for (const spot of spots) {
      const spotJson = spot.toJSON();

      let avgRating = null;
      if (spotJson.Reviews.length > 0) {
        avgRating = spotJson.Reviews[0].avgRating;
      }

      let previewImage = null;
      if (spotJson.SpotImages.length > 0) {
        previewImage = spotJson.SpotImages[0].previewImage;
      }

      const formattedSpot = {
        id: spotJson.id,
        ownerId: spotJson.ownerId,
        address: spotJson.address,
        city: spotJson.city,
        state: spotJson.state,
        country: spotJson.country,
        lat: spotJson.lat,
        lng: spotJson.lng,
        name: spotJson.name,
        description: spotJson.description,
        price: spotJson.price,
        createdAt: spotJson.createdAt,
        updatedAt: spotJson.updatedAt,
        avgRating,
        previewImage
      };

      formattedSpots.push(formattedSpot);
    }

    res.status(200).json({ Spots: formattedSpots });
  });


  //ADD IMAGE TO SPOT BASED ON ID

  router.post("/:spotId/images", requireAuth, async (req, res) => {
    const { url, preview } = req.body;
    const spotId = req.params.spotId;
    const userId = req.user.id;  // Assuming user id is in req.user.id

    // Check if the spot exists and belongs to the current user
    const spot = await Spot.findOne({
      where: {
        id: spotId,
        ownerId: userId
      }
    });

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found"
      });
    }

    try {
      const spotImage = await SpotImage.create({
        url,
        preview,
        spotId  // Assign the spot ID to the image
      });

      // Return the image data including id, url, and preview
      res.status(200).json({
        id: spotImage.id,
        url: spotImage.url,
        preview: spotImage.preview
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while adding the image"
      });
    }
  });


// CREATE SPOT
router.post('/', requireAuth, async (req, res) => {
    const requiredFields = ['address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price'];
    const errors = {};

    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }

    if (req.body.name && req.body.name.length > 50) {
        errors.name = 'Name must be less than or equal to 50 characters';
      }

    if (req.body.lat && (isNaN(req.body.lat) || Math.abs(req.body.lat) > 90)) {
        errors.lat = 'Latitude is not valid';
      }

    if (req.body.lng && (isNaN(req.body.lng) || Math.abs(req.body.lng) > 180)) {
        errors.lng = 'Longitude is not valid';
      }

    if (!req.body.price) {
        errors.price = 'Price per day is required';
      }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Bad Request',
        errors
      });
    }

    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const { user } = req;

    Spot.create({
      ownerId: user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    })
      .then((newSpot) => {
        res.status(201).json(newSpot);
      })
      .catch((error) => {
        console.error('Error creating spot:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      });
  });

  router.put('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const updatedSpotData = req.body;

    // Validate the data
    const errors = {};

    const requiredFields = ['address', 'city', 'state', 'country'];
    requiredFields.forEach(field => {
        if (!updatedSpotData[field]) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
    });

    if (!updatedSpotData.name || updatedSpotData.name.length > 50) {
        errors.name = 'Name must be less than 50 characters';
    }

    if (req.body.lat && (isNaN(req.body.lat) || Math.abs(req.body.lat) > 90)) {
        errors.lat = 'Latitude is not valid';
    }

    if (req.body.lng && (isNaN(req.body.lng) || Math.abs(req.body.lng) > 180)) {
        errors.lng = 'Longitude is not valid';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: 'Bad Request',
            errors
        });
    }

    try {
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({
                message: 'Spot not found'
            });
        }

        // Update the spot with the new data
        await spot.update(updatedSpotData);

        res.status(200).json(spot);
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});


router.delete('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;

    try {
        const spot = await Spot.findByPk(spotId);

        await spot.destroy();

        res.status(200).json({
            message: 'Successfully deleted'
        })
    }catch (error) {
        res.status(404).json({ 'message': "Spot couldn't be found"})
    }
})


module.exports = router
