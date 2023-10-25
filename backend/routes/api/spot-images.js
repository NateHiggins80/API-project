const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth.js');
const { SpotImage, Spot } = require('../../db/models');

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;

    // Check if the spot image exists
    const spotImage = await SpotImage.findByPk(imageId);

    if (!spotImage) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }

    // Check if the authenticated user is the owner of the spot associated with the image
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotImage.spotId);

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this spot image" });
    }

    // Delete the spot image
    await SpotImage.destroy({ where: { id: imageId } });

    return res.status(200).json({ message: 'Successfully deleted' });
  });


module.exports = router;
