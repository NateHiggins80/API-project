const express = require('express');

const { requireAuth } = require("../../utils/auth");
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { validationResult ,check } = require('express-validator');
const Sequelize = require('sequelize')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Create a Booking from a Spot based on the Spot's id
router.post('/:spotId/bookings', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.body;
  const spotId = parseInt(req.params.spotId, 10); // Parse spotId as an integer with base 10
  const userId = req.user.id;

  // // Check if the parsed spotId is a valid integer
  // if (isNaN(spotId)) {
  //   return res.status(400).json({
  //     message: 'Bad Request',
  //     errors: {
  //       spotId: 'Invalid spotId format',
  //     },
  //   });
  // }

  // Parse the date strings into Date objects
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  // Check if start date is before end date
  if (parsedStartDate >= parsedEndDate) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        endDate: 'endDate cannot be on or before startDate',
      },
    });
  }

  // Check if the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: 'Spot couldn\'t be found' });
  }

  // Check for conflicts in booking request
  const conflictBooking = await Booking.findOne({
    where: {
      spotId,
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [parsedStartDate, parsedEndDate],
          },
        },
        {
          endDate: {
            [Op.between]: [parsedStartDate, parsedEndDate],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: parsedStartDate } },
            { endDate: { [Op.gte]: parsedEndDate } },
          ],
        },
      ],
    },
  });

  if (conflictBooking) {
    return res.status(403).json({
      message: 'Sorry, this spot is already booked for the specified dates',
      errors: {
        startDate: 'Start date conflicts with an existing booking',
        endDate: 'End date conflicts with an existing booking',
      },
    });
  }

  // All conflicts handled, create the booking
  const newBooking = await Booking.create({
    userId,
    spotId,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  });

  return res.status(200).json(newBooking);
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

    // Query the database to retrieve reviews for the specified spot
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
        message: "Spot couldn't be found"
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

router.get('/current', requireAuth, async (req, res) => {
  const { user } = req;

  const spots = await Spot.findAll({
    where: {
      ownerId: user.id
    },
    attributes: [
      'id',
      'ownerId',
      'address',
      'city',
      'state',
      'country',
      'lat',
      'lng',
      'name',
      'description',
      'price',
      'createdAt',
      'updatedAt',
    ],
    include: [

    ],
  });

  const formattedSpots = spots.map(spot => ({
    id: spot.id,
    ownerId: spot.ownerId,
    address: spot.address,
    city: spot.city,
    state: spot.state,
    country: spot.country,
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    price: spot.price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
    avgRating: 4.5,
    previewImage: 'image url',
  }));

  res.status(200).json({ Spots: formattedSpots });
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

// Get all spots with query filters
router.get('/spots', async (req, res) => {
  const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

  // Validate query parameters
  const errors = {};
  if (isNaN(+page) || +page < 1 || +page > 10) {
    errors.page = 'Page must be an integer between 1 and 10';
  }
  if (isNaN(+size) || +size < 1 || +size > 20) {
    errors.size = 'Size must be an integer between 1 and 20';
  }
  if (minLat && isNaN(+minLat)) {
    errors.minLat = 'Minimum latitude is invalid';
  }
  if (maxLat && isNaN(+maxLat)) {
    errors.maxLat = 'Maximum latitude is invalid';
  }
  if (minLng && isNaN(+minLng)) {
    errors.minLng = 'Minimum longitude is invalid';
  }
  if (maxLng && isNaN(+maxLng)) {
    errors.maxLng = 'Maximum longitude is invalid';
  }
  if (minPrice && isNaN(+minPrice) || +minPrice < 0) {
    errors.minPrice = 'Minimum price must be greater than or equal to 0';
  }
  if (maxPrice && isNaN(+maxPrice) || +maxPrice < 0) {
    errors.maxPrice = 'Maximum price must be greater than or equal to 0';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Bad Request', errors });
  }

  const spots = await Spot.findAll({
    where: {
      ...(minLat && { lat: { [Op.gte]: +minLat } }),
      ...(maxLat && { lat: { [Op.lte]: +maxLat } }),
      ...(minLng && { lng: { [Op.gte]: +minLng } }),
      ...(maxLng && { lng: { [Op.lte]: +maxLng } }),
      ...(minPrice && { price: { [Op.gte]: +minPrice } }),
      ...(maxPrice && { price: { [Op.lte]: +maxPrice } }),
    },
    limit: +size,
    offset: (+page - 1) * +size,
  });

  const totalSpots = await Spot.count();

  return res.status(200).json({
    Spots: spots,
    page: +page,
    size: +size,
    totalSpots,
  });
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

  // router.post("/:spotId/images", requireAuth, async (req, res) => {
  //   const { url, preview } = req.body;
  //   const spotId = req.params.spotId;
  //   const userId = req.user.id;  // Assuming user id is in req.user.id

  //   // Check if the spot exists and belongs to the current user
  //   const spot = await Spot.findOne({
  //     where: {
  //       id: spotId,
  //       ownerId: userId
  //     }
  //   });

  //   if (!spot) {
  //     return res.status(404).json({
  //       message: "Spot couldn't be found"
  //     });
  //   }

  //   // Create the spot image
  //   try {
  //     const spotImage = await SpotImage.create({
  //       url,
  //       preview,
  //       spotId
  //     });

  //     // Return the image data including id, url, and preview
  //     res.status(200).json({
  //       id: spotImage.id,
  //       url: spotImage.url,
  //       preview: spotImage.preview
  //     });
  //   } catch (error) {
  //     console.error('Error adding image:', error);
  //     res.status(500).json({
  //       message: "An error occurred while adding the image"
  //     });
  //   }
  // });
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

// // confirming that user owns the spot:
// if (user.id !== spot.ownerId) {
//   res.status(403);
//   return res.json({message: "Only owner can add an image"})
//   }


//DELETE A SPOT
// router.delete('/:spotId/', requireAuth, async (req, res) => {
//   const { spotId, imageId } = req.params;



//   const spot = await Spot.findByPk(spotId);
//   if (!spot) {
//     return res.status(404).json({ message: 'Spot not found' });
//   }

//   if (spot.ownerId !== req.user.id) {
//     return res.status(403).json({ message: 'You are not authorized to delete this image' });
//   }

//   const deletedImage = await SpotImage.destroy({ where: { id: imageId } });

//   if (!deletedImage) {
//     return res.status(404).json({ message: 'Image not found' });
//   }

//   return res.status(200).json({ message: 'Image successfully deleted' });
// });

router.delete('/:spotId', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const spotToDelete = await Spot.findByPk(req.params.spotId);

    if (!spotToDelete) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const ownerId = spotToDelete.dataValues.ownerId;

    // Authorization check
    if (user.id === ownerId) {
      await spotToDelete.destroy();
      res.status(200).json({
        message: "Successfully deleted",
      });
    } else {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
  } catch (error) {
    console.error('Error deleting spot:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router
