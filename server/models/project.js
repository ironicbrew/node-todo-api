var mongoose = require('mongoose');

var Project = mongoose.model('Project', {
	id: {
		type: String,
	},
	tasks: [
		{name: String, shop: String, prep: Boolean, material: Boolean, install: Boolean},
	]
	});


module.exports = {Project};
