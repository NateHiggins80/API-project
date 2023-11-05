const express = require('express');

const { requireAuth, restoreUser, setTokenCookie } = require("../../utils/auth");
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const Sequelize = require('sequelize')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const router = express.Router();

const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check('lat')
    .exists({ checkFalsy: true })
    .withMessage("Latitude is not valid"),
  check('lng')
    .exists({ checkFalsy: true })
    .withMessage("Longitude is not valid"),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50})
    .withMessage("Name must be less than 50 characters"),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check('price')
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors
];
const validateReview = [
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({min:1, max:5})
    .withMessage('Stars must be an integer from 1 to 5'),
    check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  handleValidationErrors
];

const validateQuery = [
  check("page")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Page must be greater than or equal to 1"),
  check("size")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be greater than or equal to 1"),
  check("minLat")
    .optional()
    .isDecimal()
    .withMessage("Minimum latitude is invalid")
    .custom((val) => {
      if (val <= -90 || val >= 90) return false;
      else return true;
    })
    .withMessage("Minimum latitude is invalid"),
  check("maxLat")
    .optional()
    .isDecimal()
    .withMessage("Maximum latitude is invalid")
    .custom((val) => {
      if (val <= -90 || val >= 90) return false;
      else return true;
    })
    .withMessage("Maximum latitude is invalid")
    .custom((val, { req }) => {
      if (req.params.minLat !== undefined) {
        if (req.params.minLat > val) {
          return false;
        }
      }
      return true;
    })
    .withMessage("minLat must be less than or equal to maxLat"),
  check("minLng")
    .optional()
    .isDecimal({ min: -180, max: 180 })
    .withMessage("Minimum longitude is invalid")
    .custom((val) => {
      if (val <= -180 || val >= 180) return false;
      else return true;
    })
    .withMessage("Minimum longitude is invalid"),
  check("maxLng")
    .optional()
    .isDecimal({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid")
    .custom((val) => {
      if (val <= -180 || val >= 180) return false;
      else return true;
    })
    .withMessage("Maximum longitude is invalid")
    .custom((val, { req }) => {
      if (req.params.minLng !== undefined) {
        if (req.params.minLng > val) {
          return false;
        }
      }
      return true;
    })
    .withMessage("minLng must be less than or equal to maxLng"),
  check("minPrice")
    .optional()
    .isDecimal()
    .custom((val) => {
      if (val < 0) return false;
      else return true;
    })
    .withMessage("Minimum price must be greater than or equal to 0"),
  check("maxPrice")
    .optional()
    .isDecimal()
    .custom((val) => {
      if (val < 0) return false;
      else return true;
    })
    .withMessage("Maximum price must be greater than or equal to 0")
    .custom((val, { req }) => {
      if (req.params.minPrice !== undefined) {
        if (req.params.minPrice > val) {
          return false;
        }
      }
      return true;
    })
    .withMessage("Minimum price must be less than or equal to Maximum price"),
  handleValidationErrors,
];

// Get all spots
router.get("/", validateQuery, async (req, res) => {
  const { page, size, maxLat, minLat, maxLng, minLng, minPrice, maxPrice } =
    req.query;
  let queryFilter = {};

  if (size === undefined) {
    queryFilter.limit = 20;
  } else {
    queryFilter.limit = Number(size);
  }

  if (page === undefined) {
    queryFilter.offset = 0;
  } else {
    queryFilter.offset = (page - 1) * queryFilter.limit;
  }

  queryFilter.where = {
    lng: {
      [Op.between]: [
        minLng !== undefined ? minLng : -180,
        maxLng !== undefined ? maxLng : 180,
      ],
    },
    lat: {
      [Op.between]: [
        minLat !== undefined ? minLat : -90,
        maxLat !== undefined ? maxLat : 90,
      ],
    },
    price: {
      [Op.between]: [
        minPrice !== undefined ? minPrice : 0,
        maxPrice !== undefined ? maxPrice : 1000000000,
      ],
    },
  };

  const spots = await Spot.findAll(queryFilter);

  for (let spot of spots) {
    previewImage = await SpotImage.findOne({
      where: {
        spotId: Number(spot.id),
        preview: true,
      },
      attributes: ["url"],
    });
    if (previewImage) {
      spot.dataValues.previewImage = previewImage.dataValues.url;
    } else {
      spot.dataValues.previewImage = null;
    }

    const reviews = await Review.findAndCountAll({
      where: {
        spotId: Number(spot.id),
      },
      attributes: ["stars"],
    });

    const reviewSum = reviews.rows.reduce((accum, curr) => {
      return (accum = accum + curr.dataValues.stars);
    }, 0);
    avgRating = reviewSum / reviews.count;
    spot.dataValues.avgRating = avgRating;
  }

  return res.json({
    Spots: spots,
    page: queryFilter.offset / queryFilter.limit + 1,
    size: queryFilter.limit,
  });
});


//Create a Spot Review
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
  const { review, stars } = req.body;
  const { spotId } = req.params;
  const userId = req.user.id;

  // Check if review text is empty
  if (!review) {
    return res.status(400).json({ message: 'Review text is required' });
  }

  // Check if stars is not an integer between 1 and 5
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ message: 'Stars must be an integer from 1 to 5' });
  }

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Spot couldn\'t be found' });
    }

    // Check if the user already has a review for this spot
    const existingReview = await Review.findOne({
      where: {
        spotId,
        userId,
      }
    });

    if (existingReview) {
      return res.status(403).json({ message: 'User already has a review for this spot' });
    }

    // Create the review
    const createdReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    return res.status(201).json(createdReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Get all Reviews By a Spot's id
router.get("/:spotId/reviews", async (req, res) => {
  try {
    const { spotId } = req.params;


    const reviews = await Review.findAll({
      where: {
        spotId: spotId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ]
    });

    if (reviews.length === 0) {
      return res.status(404).json({
        message: "Spot Couldn't Be Found"
      });
    }

    // Format the response with the Reviews
    const formattedResponse = {
      Reviews: reviews
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/:spotId/bookings', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const bookings = await Booking.findAll({
    where: {
      spotId: spot.id,
    },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
  });

  if (!req.user || req.user.id !== spot.ownerId) {
    const verifiedBookings = bookings.map((booking) => ({
      spotId: booking.spotId,
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));

    return res.status(200).json({ Bookings: verifiedBookings });
  } else {
    // If the user is the owner of the spot, send a detailed response
    return res.status(200).json({ Bookings: bookings });
  }
});

//GET CURRENT
router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;
  const ownerId = user.id;

  const yourSpots = await Spot.findAll({
    where: {
      ownerId,
    },
    include: [
      {
        model: Review,
        attributes: [["stars", "avgRating"]],
      },
      {
        model: SpotImage,
        attributes: [["url", "previewImage"]],
      },
    ],
  });

  const result = [];

  yourSpots.forEach(async (spotObj) => {
    const jsonSpotObject = spotObj.toJSON();

    const spotImages = jsonSpotObject.SpotImages;
    let spotPreviewImage = null;

    if (spotImages && spotImages.length > 0) {
      spotPreviewImage = spotImages[0].previewImage;
    }

    let sumOfRatings = 0;


    jsonSpotObject.Reviews.forEach((review) => {
      sumOfRatings += review.avgRating;
    });


    const reviewsCount = jsonSpotObject.Reviews.length;


    jsonSpotObject.avgRating = reviewsCount > 0 ? sumOfRatings / reviewsCount : null;

    let completeSpotObject = {
      id: spotObj.id,
      ownerId: spotObj.ownerId,
      address: spotObj.address,
      city: spotObj.city,
      state: spotObj.state,
      country: spotObj.country,
      lat: Number(spotObj.lat),
      lng: Number(spotObj.lng),
      name: spotObj.name,
      description: spotObj.description,
      price: Number(spotObj.price),
      createdAt: spotObj.createdAt,
      updatedAt: spotObj.updatedAt,
      avgRating: jsonSpotObject.avgRating,
      previewImage: spotPreviewImage,
    };

    result.push(completeSpotObject);
  });

  if (result[0]) {
    res.json({
      Spots: result,
    });
  } else {
    res.status(404).json({
      message: "No Spots to show",
    });
  }
});




//Get Details of a spot by ID
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



//Create spot image
  router.post('/:spotId/images', requireAuth, async(req, res) => {
    const {user} = req;
    const {url, preview} = req.body;

    // finding spot:
    let spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
    res.status(404);
    return res.json({message: "Spot couldn't be found"})
    }

    // confirming that user owns the spot:
    if (user.id !== spot.ownerId) {
    res.status(403);
    return res.json({message: "Only owner can add an image"})
    }


    // creating a new image in spot:
    if (user.id === spot.ownerId) {
    const image = await spot.createSpotImage({
    url: url,
    preview: preview
    });

    await image.save();

    let response = {};

    response.id = image.id;
    response.url = image.url;
    response.preview = image.preview;


    res.status(200);
    res.json(response);
    }
    })



    //Create a Booking from a Spot based on the Spot's id
    router.post("/:spotId/bookings", requireAuth, async (req, res) => {
      const numSpots = await Spot.count();
      if (isNaN(parseInt(req.params.spotId)) || req.params.spotId < 1 || req.params.spotId > numSpots) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      const { user } = req;
      const { startDate, endDate } = req.body;

      if (startDate >= endDate) {
        return res.status(400).json({
          message: "Bad Request",
          errors: { endDate: "endDate cannot be on or before startDate" }
        });
      }

      const bookings = await Booking.findAll({
        raw: true,
        where: { spotId: req.params.spotId }
      });

      const userEndDate = new Date(endDate).getTime();
      const userStartDate = new Date(startDate).getTime();

      const errorsObject = {};
      bookings.forEach((booking) => {
        const bookedEndDate = new Date(booking.endDate).getTime();
        const bookedStartDate = new Date(booking.startDate).getTime();

        if (userStartDate < bookedStartDate && bookedEndDate < userEndDate) {
          (errorsObject.startDate = "Start date conflicts with an existing booking"),
            (errorsObject.endDate = "End date conflicts with an existing booking");
        }

        if (userEndDate >= bookedStartDate && userEndDate <= bookedEndDate) {
          errorsObject.endDate = "End date conflicts with an existing booking";
        }

        if (userStartDate >= bookedStartDate && userStartDate <= bookedEndDate) {
          errorsObject.startDate = "Start date conflicts with an existing booking";
        }
      });

      if (errorsObject.startDate || errorsObject.endDate) {
        return res.status(403).json({
          message: "Sorry, this spot is already booked for the specified dates",
          errors: { ...errorsObject }
        });
      }

      const currentSpot = await Spot.findByPk(req.params.spotId);

      if (currentSpot.ownerId === user.id) {
        return res.status(403).json({ message: "Owner Cannot Book Their Own Spot" });
      }

      const newBooking = await currentSpot.createBooking({
        userId: user.id,
        startDate,
        endDate
      });

      const bookingObject = {
        id: newBooking.id,
        spotId: newBooking.spotId,
        userId: user.id,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        createdAt: newBooking.createdAt,
        updatedAt: newBooking.updatedAt
      };

      res.status(201).json(bookingObject);
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

  //Edit A Spot
  // Route to edit a spot by ID
router.put('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const updatedSpotData = req.body;


  const spot = await Spot.findByPk(spotId);

  if (!spot) {
      return res.status(404).json({
          message: 'Spot not found'
      });
  }
  if (req.user.id !== spot.ownerId) {
    res.status(403);
    return res.json({message: "Authentication Required"})
  }
  // // confirming that user owns the spot:
  // if (user.id !== spot.ownerId) {
  //   res.status(403);
  //   return res.json({message: "Only owner can add an image"})
  //   }
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

  if (updatedSpotData.price !== undefined && (isNaN(updatedSpotData.price) || updatedSpotData.price < 0)) {
      errors.price = 'Price must be a non-negative number';
  }

  if (updatedSpotData.lat && (isNaN(updatedSpotData.lat) || Math.abs(updatedSpotData.lat) > 90)) {
      errors.lat = 'Latitude is not valid';
  }

  if (updatedSpotData.lng && (isNaN(updatedSpotData.lng) || Math.abs(updatedSpotData.lng) > 180)) {
      errors.lng = 'Longitude is not valid';
  }

  if (Object.keys(errors).length > 0) {
      return res.status(400).json({
          message: 'Bad Request',
          errors
      });
  }

  try {


      // Update the spot with the new data
      await spot.update(updatedSpotData);

      res.status(200).json(spot);
  } catch (error) {
      res.status(500).json({
          message: 'Internal Server Error'
      });
  }
});

//DELETE A SPOT
router.delete('/:spotId', requireAuth, async(req, res) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;
  const deleteSpot = await Spot.findByPk(spotId);
  if(!deleteSpot){
    res.status(404);
    return res.json({message: "Spot couldn't be found"})
  };
  if(deleteSpot.ownerId !== userId){
    res.status(403);
    return res.json({message: 'Not Authorized'})
  }
  await deleteSpot.destroy()
  res.json({message: 'Successfully deleted'})
})



module.exports = router
