var mongoose = require('mongoose');

var Inspection = mongoose.model('Inspection', {
	name: {
		type: String,
	},
	serial: {
		type: String,
		default: null
	},
	inspection_status: {
		type: String,
		default: null
	}
});


module.exports = {Inspection};