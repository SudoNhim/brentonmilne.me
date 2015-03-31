var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {menu: ['about', 'image-code', 'minecraft'], testcontent: 'some content' });
});

module.exports = router;