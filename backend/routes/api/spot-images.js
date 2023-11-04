const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth.js');
const { SpotImage, Spot } = require('../../db/models');

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
  const spotImageToDelete = await SpotImage.findByPk(req.params.imageId, { include: Spot });

  if (!spotImageToDelete) {
      return res.status(404).json({
          "message": "Spot Image couldn't be found"
      });
  }

  try {
      const spotImageUserId = spotImageToDelete.Spot.ownerId;
      const { user } = req;


      // authorization check
      if (user.id === spotImageUserId) {
          await spotImageToDelete.destroy();

          res.json({
              "message": "Successfully deleted"
          });
      } else {
          return res.status(403).json({
              "message": "Not Authorized"
          });
      }
      res.json({
          "message": "Successfully deleted"
      });
  } catch (error) {
      res.status(404).json({
          "message": "Spot Image couldn't be found"
      });
  }
});


module.exports = router;
