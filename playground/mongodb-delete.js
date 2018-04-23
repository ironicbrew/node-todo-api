// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/myFirstDb', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('connected to mongoDB server');

	// db.collection('myFirstDb').deleteMany({firstName: "Rob"}).then((result) => {
	// 	console.log(result.result);
	// });

	db.collection('myFirstDb').findOneAndDelete({_id: ObjectID("5ab1cbfd18519900fc172219")}).then((result) => {
		console.log(result);
	});

	// db.close();
});