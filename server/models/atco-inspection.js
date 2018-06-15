const mongoose = require('mongoose');
const _ = require('lodash');

// var AtcoinspectionSchema = new mongoose.Schema({
// 	id: {type: String},
// 	date: {type: Date, default: Date.now}
// });


// var Atcoinspection = mongoose.model('Inspection', AtcoinspectionSchema);

var Atcoinspection = mongoose.model('Atcoinspection', {
	id: {type: String},
	date: {type: Date, default: Date.now},
	type: {type: String}
});

module.exports = {Atcoinspection};
