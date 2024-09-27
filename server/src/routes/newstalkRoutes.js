const express = require('express');
const { postNewsTalkData } = require('../controllers/NewsTalkController');
const router = express.Router();

router.post('/NewsTalk', postNewsTalkData); // POST 요청 추가

module.exports = router;