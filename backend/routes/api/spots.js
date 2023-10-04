const express = require('express');

const { requireAuth } = require("../../utils/auth");
const { Spot, User } = require('../../db/models');

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const options = {};

const router = express.Router();



router.get('/:spotId', async (req, res) => {
    const { spotId } = req.params;

    const spotDetails = await Spot.findByPk(spotId);

      res.status(200).json(spotDetails);
  });



router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

    try {
        const yourSpots = await Spot.findAll({
            where: {
                ownerId: user.id
            }
        });

        res.status(200).json(yourSpots);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/', async (req, res) => {

    const allSpots = await Spot.findAll()
    res.status(200).json(allSpots)
})


router.post('/', requireAuth, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  const { user } = req;

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
})

router.put('/:spotId', requireAuth, async (req, res) => {
    const { spotId } = req.params;

    updateSpot = await 
})

module.exports = router
