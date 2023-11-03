const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Review, User, Spot, ReviewImage, SpotImage } = require('../../db/models');

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
  // reviewsJson.forEach(review => {

  // review.Spot.SpotImages.forEach(spot => {
  // if(spot.preview) {
  // review.Spot.previewImage = spot.url
  // }
  // })
  // })
  // delete review.Spot.SpotImages
  // })

  reviewsJson.forEach(review => {
    review.Spot.SpotImages.forEach(spot => {
      if (spot.preview) {
        review.Spot.previewImage = spot.url;
      }
    });

    delete review.Spot.SpotImages;
  });

  if(reviewsJson.length === 0) {
  res.status(404)
  return res.json({message: 'No reviews found.'})
  }

  res.status(200);
  return res.json({Reviews: reviewsJson})
  })


//CREATE REVIEW IMAGE
router.post('/:reviewId/images', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const { user } = req.user;

  try {
    // Check if the review exists
    const review = await Review.findByPk(reviewId);
console.log(userId);
        if (user.id === review.userId) {
            //aggregate count on review.images
            const allReviewImages = await ReviewImage.count({
                where: {
                    reviewId
                }
            });

            if (allReviewImages >= 10) {
                return res.status(403).json({
                    "message": "Maximum number of images for this resource was reached"
                });
            }
            const newImage = await ReviewImage.create({
                reviewId,
                url
            });

            const newImageObject = newImage.toJSON();

            res.json({
                "id": newImageObject.id,
                "url": newImageObject.url
            });
        } else {
            res.status(403).json({
                "message": "Forbidden"
            });
        }
  } catch (error) {
    console.error('Error adding image to review:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


//EDIT REVIEW
router.put('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id; // Use req.user.id to get the authenticated user's ID

  try {
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    const errors = {};

    if (!review) {
      errors.review = "Review text is required";
    }

    if (!stars || stars < 1 || stars > 5) {
      errors.stars = "Stars must be an integer from 1 to 5";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    if (userId === existingReview.userId) {
      await existingReview.update({
        review,
        stars,
      });
      return res.status(200).json(existingReview);
    } else {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



  //DELETE REVIEW
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
