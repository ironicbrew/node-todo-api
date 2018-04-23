// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('connected to mongoDB server');

	// db.collection('Todos').find({
	// 	_id: new ObjectID('5add5f98b7654ecfaf2202fa')
	// }).toArray().then((docs) => {
	// 	console.log('Todos');
	// 	console.log(JSON.stringify(docs, undefined, 4));
	// }, (err) => {
	// 	console.log('Unable top fetch todos', err);
	// });

	// 	db.collection('Todos').find().count().then((count) => {
	// 	console.log(`Todos count: ${count}`);
	// }, (err) => {
	// 	console.log('Unable top fetch todos', err);
	// });

	db.collection('Users').find({
		name: 'Rob'}).toArray().then((docs) => {
		console.log('Users');
		console.log(JSON.stringify(docs, undefined, 4));
	}, (err) => {
		console.log('Unable to fetch', err);
	});	

	// db.close();
});