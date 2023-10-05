const express = require('express');

const { requireAuth } = require("../../utils/auth");
const { Spot, User, SpotImage, Review } = require('../../db/models');

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const options = {};

const router = express.Router();


router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

        const yourSpots = await Spot.findAll({
            where: {
                ownerId: user.id
            }
        });

        res.status(200).json(yourSpots);
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

    const allSpots = await Spot.findAll()
    res.status(200).json(allSpots)
})

router.post("/:spotId/images", requireAuth, async (req, res) => {
    const { url, preview } = req.body;

    try {
    const spotImages = await SpotImage.create({
        url,
        preview
    });

    res.status(200).json(spotImages);
    } catch (error) {
        res.status(404).json({
            message: "Spot couldn't be found"
        })
    }
})


router.post('/', requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  const { user } = req;
 try {
  const newSpot = await Spot.create({
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
  });

  res.status(201).json(newSpot);
} catch (error) {
    res.status(400).json({
        "message": "Bad Request",
        "errors": {
          "address": "Street address is required",
          "city": "City is required",
          "state": "State is required",
          "country": "Country is required",
          "lat": "Latitude is not valid",
          "lng": "Longitude is not valid",
          "name": "Name must be less than 50 characters",
          "description": "Description is required",
          "price": "Price per day is required"
        }
    })
}
})

router.put('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const updatedSpotData = req.body;
    try {
    const spot = await Spot.findByPk(spotId);

      // Update the spot with the new data
      await spot.update(updatedSpotData);

    res.status(200).json(spot);
} catch (error) {
    res.status(404).json ({
        "message": "Bad Request",
    "errors": {
    "address": "Street address is required",
    "city": "City is required",
    "state": "State is required",
    "country": "Country is required",
    "lat": "Latitude is not valid",
    "lng": "Longitude is not valid",
    "name": "Name must be less than 50 characters",
    "description": "Description is required",
    "price": "Price per day is required"
    }
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
