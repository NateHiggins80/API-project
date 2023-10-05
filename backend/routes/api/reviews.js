const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

router.get("/current", requireAuth, async (req, res) => {
    try {
        const { user } = req;

        const reviewId = user.id;
        const allReviews = await Review.findAll({
            where: {
                spotId: reviewId
            }
        })
        res.json(allReviews);
    } catch (error) {
        res.status(404).json({
            "message": "Spot couldn't be found"
        });
    }
    });



    module.exports = router
