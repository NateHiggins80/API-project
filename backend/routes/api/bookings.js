const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, User, SpotImage, Review, ReviewImage } = require('../../db/models');
const { Op } = require('sequelize');


const router = express.Router();

// GET all bookings for the current user

router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;
  const allUserBookings = await Booking.findAll({
      where: {
          userId: user.id
      },
      attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"],
      include: [
          {
              model: Spot,
              attributes: {
                  exclude: ["description", "createdAt", "updatedAt"]
              }
          }
      ]
  });

  const allImages = await SpotImage.findAll();
  let allBookingsObject = allUserBookings.map((booking) => booking.toJSON());

  for (let i = 0; i < allBookingsObject.length; i++) {
      for (let j = 0; j < allImages.length; j++) {
          if (allImages[j].spotId === allBookingsObject[i].spotId) {
              if (allImages[j].preview === true) {
                  allBookingsObject[i].Spot.previewImage = allImages[j].url;
                  break;
              } else {
                  allBookingsObject[i].Spot.previewImage = "No preview available";
              }
          } else {
              allBookingsObject[i].Spot.previewImage = "No preview available";
          }
      }
      allBookingsObject[i].endDate = allBookingsObject[i].endDate;
      allBookingsObject[i].startDate = allBookingsObject[i].startDate;
  }

  res.json({ Bookings: allBookingsObject });
});

  // Edit a Booking
  router.put('/:bookingId', requireAuth, async(req,res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.id;
    const {startDate, endDate} = req.body
    let errors = {}
    const updatedBooking = await Booking.findByPk(bookingId);
    if(!updatedBooking){
        res.status(404);
        return res.json({message: "Booking couldn't be found"})
    }
    if(updatedBooking.userId !== userId){
        res.status(403);
        return res.json({message: 'Forbidden'})
    }
    const startTime = new Date(startDate).getTime();
    const endTime =  new Date(endDate).getTime();
    if(startTime >= endTime) {
      res.status(400);
      return res.json({
        "message": "Bad Request",
        "errors": {
          "endDate": "endDate cannot be on or before startDate"
        }
      })
    }
    const checkEnd = updatedBooking.endDate.getTime()
    let rightNow = Date.now();
    if(checkEnd < rightNow){
        res.status(403);
        return res.json({message: "Past bookings can't be modified"})
    }
    let bookings = await Booking.findAll({
        where: {spotId: updatedBooking.spotId}
      })
      let bookingsList = [];
      bookings.forEach((booking) => {
        bookingsList.push(booking.toJSON())
      });
      bookingsList.forEach((booking) => {
        let bookingStartTime = booking.startDate.getTime();


        let bookingEndTime = booking.endDate.getTime();
        if(startTime >= bookingStartTime && startTime <= bookingEndTime){
          errors.startDate = "Start date conflicts with an existing booking"
        }
        if(endTime >= bookingStartTime && endTime <= bookingEndTime){
          errors.endDate = "End date conflicts with an existing booking"
        }

      })
      if(Object.keys(errors).length > 0){
        res.status(403);
        return res.json({
          message: 'Sorry, this spot is already booked for the specified dates',
          errors: errors
        })
      }
      if(startDate) updatedBooking.startDate = new Date(startDate);
      if(endDate) updatedBooking.endDate = new Date(endDate);
      await updatedBooking.save();
      res.json(updatedBooking)
})

  // Delete a Booking

  router.delete('/:bookingId', requireAuth, async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking couldn\'t be found' });
    }

    const currentDate = new Date();
    const bookingStartDate = new Date(booking.startDate);
    if (currentDate >= bookingStartDate) {
      return res.status(403).json({ message: 'Bookings that have been started can\'t be deleted' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this booking' });
    }

    await booking.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });
  });



module.exports = router;
