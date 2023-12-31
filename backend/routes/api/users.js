// backend/routes/api/users.js
const express = require('express')
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Invalid email'),


    check('username')
      .exists({ checkFalsy: true })
      .withMessage('Username is required.'),
    check('firstName')
      .exists({ checkFalsy: true }).withMessage("First Name is required"),
    check('lastName')
      .exists({ checkFalsy: true }).withMessage("Last Name is required"),

    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];

router.post(
    '/',
    validateSignup,
    async (req, res) => {
      const { email, password, username, firstName, lastName } = req.body;
      const hashedPassword = bcrypt.hashSync(password);


      const errors = {};

      if (!firstName) errors.firsName = 'First Name is required';
      if (!lastName) errors.lastname = 'Last Name is required';
      if (!email) errors.email = "Invalid email";
      if (!username) errors.username = 'Username is required';

      if (errors[0]) {
        res.status(400).json(errors)
      }

      const existingUser = await User.findOne({
        where: {
          username,
        },
      });

      if (existingUser) {
        return res.status(500).json({
          message: 'User already exists',
          errors: {
            username: 'User with that username already exists',
          },
        });
      }

      const user = await User.create({ email, username, firstName, lastName, hashedPassword });

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };

      await setTokenCookie(res, safeUser);

      return res.json({
        user: safeUser
      });
    }
  );

module.exports = router;
