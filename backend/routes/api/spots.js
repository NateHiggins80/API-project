const express = require('express');

const { requireAuth } = require("../../utils/auth");
const { Spot } = require('../../db/models');

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const options = {};

const router = express.Router();

router.get('/', async (req, res) => {

    const allSpots = await Spot.findAll()
    res.status(200).json(allSpots)
})

module.exports = router

router.get('/current', requireAuth, async (req, res) => {
    const yourSpots = await Spot.findByPk()
})


router.get('/api/spots/:spotId', async (req, res) => {
  const { spotId } = req.params;

  const ownerSpots = await Spots.findByPk(
    {
        where: {
            spotId
        }
    }
  )
})

let spots = [];
let images = [];

router.post('/api/spots', async (req, res) => {

})
