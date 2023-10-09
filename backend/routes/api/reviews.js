const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Review, User, Spot, ReviewImage } = require('../../db/models');

const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

router.get('/current', requireAuth, async(req, res) => {
  const {user} = req;

  const reviews = await Review.findAll({
  where: {
  userId: user.id
  },
  include: [
  {
  model: User,
  attributes: ['id', 'firstName', 'lastName']
  },
  {
  model: Spot,
  attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
  include: {
  model: SpotImage
  }
  },
  {
  model: ReviewImage,
  attributes: ['id', 'url']
  }
  ]
  })

  let reviewsJson = [];
  reviews.forEach(review => {
  reviewsJson.push(review.toJSON())
  });

  // add reviewImage:
  reviewsJson.forEach(review => {
  for(let key in review.Spot) {
  review.Spot.SpotImages.forEach(spot => {
  if(spot.preview) {
  review.Spot.previewImage = spot.url
  }
  })
  }
  delete review.Spot.SpotImages
  })

  if(reviewsJson.length === 0) {
  res.status(404)
  return res.json({message: 'No reviews found.'})
  }

  res.status(200);
  return res.json({Reviews: reviewsJson})
  })



router.post('/:reviewId/images', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  try {
    // Check if the review exists
    const review = await Review.findOne({
      where: {
        id: reviewId,
        userId: userId,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    const imageCount = await ReviewImage.count({
      where: { reviewId },
    });

    if (imageCount >= 10) {
      return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
    }

    // Create the image
    const createdImage = await ReviewImage.create({
      reviewId,
      url,
    });

    return res.status(200).json(createdImage);
  } catch (error) {
    console.error('Error adding image to review:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { review, stars } = req.body;
    const userId = req.user.id;

    try {

      const existingReview = await Review.findOne({
        where: {
          id: reviewId,
          userId,
        },
      });

      if (!existingReview) {
        return res.status(404).json({ message: "Review couldn't be found" });
      }

      // Update the review
      await existingReview.update({
        review,
        stars,
      });

      // Fetch the updated review
      const updatedReview = await Review.findOne({
        where: { id: reviewId },
      });

      return res.status(200).json(updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.delete('/:reviewId', requireAuth, (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if the review exists and belongs to the current user
    Review.findOne({
      where: {
        id: reviewId,
        userId,
      },
    })
      .then((review) => {
        if (!review) {
          return res.status(404).json({ message: "Review couldn't be found" });
        }

        // Delete the review
        return review.destroy().then(() => {
          return res.status(200).json({ message: 'Successfully deleted' });
        });
      })
      .catch((error) => {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      });
  });

module.exports = router;
