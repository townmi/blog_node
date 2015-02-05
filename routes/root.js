var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/login', function (req, res) {

	var send = {
		"title"  : "login"
	};

	res.render("index", send);

});

module.exports = router;
