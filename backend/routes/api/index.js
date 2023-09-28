// backend/routes/api/index.js
const router = require('express').Router();


const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
const { restoreUser, requireAuth } = require('../../utils/auth.js');

router.use(restoreUser);

router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);
  }
);

  router.get('/set-token-cookie', async (_req, res) => {
    const user = await User.findOne({
      where: {
        username: 'Demo-lition'
      }
    });
    setTokenCookie(res, user);
    return res.json({ user: user });
  });

  router.get("/require-auth", requireAuth, (req, res) => {
    return res.json(req.user);
});

  router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
  });
// backend/routes/index.js
// ...
// Add a XSRF-TOKEN cookie





module.exports = router
