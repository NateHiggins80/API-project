const express = require('express');
const { ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router();


router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    // Check if the review image exists
    const reviewImage = await ReviewImage.findByPk(imageId);

    // Check if the review image exists and belongs to the current user
    if (!reviewImage || reviewImage.userId !== userId) {
      return res.status(404).json({ message: "Review image couldn't be found" });
    }

    // Delete the review image
    await reviewImage.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  });

  module.exports = router;
