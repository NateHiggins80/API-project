const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, User } = require('../../db/models');
const { Op } = require('sequelize');


const router = express.Router();

// GET all bookings for the current user
router.get('/current', requireAuth, async (req, res) => {
  try {
    const { user } = req;

    const bookings = await Booking.findAll({
      where: { userId: user.id },
      include: [{ model: Spot, attributes: ['id', 'ownerId'] }],
    });

    res.status(200).json({ Bookings: bookings });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Get all bookings by Spot Id
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

  // Edit a Booking
router.put('/:bookingId', requireAuth, async (req, res) => {
    const bookingId = req.params.bookingId;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Check if the booking exists
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the booking belongs to current user
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "You are not authorized to edit this booking" });
    }

    // Check booking date
    const currentDate = new Date();
    if (booking.endDate < currentDate) {
      return res.status(403).json({ message: "Past bookings can't be modified" });
    }

    // Check for booking conflict
    const conflictingBooking = await Booking.findOne({
      where: {
        spotId: booking.spotId,
        [Op.and]: [
          {
            id: { [Op.not]: bookingId }
          },
          {
            [Op.or]: [
              {
                startDate: {
                  [Op.lt]: parsedEndDate
                },
                endDate: {
                  [Op.gt]: parsedStartDate
                }
              },
              {
                startDate: {
                  [Op.eq]: parsedEndDate
                }
              },
              {
                endDate: {
                  [Op.eq]: parsedStartDate
                }
              }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(403).json({
        message: 'Sorry, this spot is already booked for the specified dates',
        errors: {
          startDate: 'Start date conflicts with an existing booking',
          endDate: 'End date conflicts with an existing booking',
        },
      });
    }

    // Update the booking
    await Booking.update(
      {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      {
        where: { id: bookingId },
        returning: true,
      }
    );

    // Fetch the updated booking
    const updatedBooking = await Booking.findByPk(bookingId);

    return res.status(200).json(updatedBooking);
  });

  // Delete a Booking

  router.delete('/:bookingId', async (req, res) => {
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
