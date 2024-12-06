const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.put('/new', function(req, res, next) {
  try {
    user = userController.createUser(req, res)
  } catch (error) {
    console.log(error)
  }

  if (user) {
    res.send("User create!")
  } else {
    res.send("User creation failed.")
  }
})

module.exports = router;
