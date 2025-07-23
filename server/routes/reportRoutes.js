const express = require('express');
const router = express.Router();
const { addReport, getReports } = require('../controllers/reportController');

router.post('/api/report', addReport);
router.get('/reports', getReports);

module.exports = router;
