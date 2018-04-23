// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/myFirstDb', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('connected to mongoDB server');

	db.collection('myFirstDb').findOneAndUpdate({
		firstName: 'Rabbiebutts'
	},{
		$inc: {
			age: 10
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result);
	});

	// db.close();
});