const express = require('express');

const router = express.Router();

const {
  getExperts,
  getExpertDetails
} = require('../controllers/expertController');


router.get('/', getExperts);

router.get('/:id/details', getExpertDetails);

module.exports = router;