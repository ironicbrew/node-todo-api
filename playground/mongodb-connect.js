// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('connected to mongoDB server');

	// db.collection('Todos').insertOne({
	// 	text: 'Something to do',
	// 	completed: false
	// }, (err, result) => {
	// 	if (err) {
	// 		return console.log('Unable to insert todo', err);
	// 	}

	// 	console.log(JSON.stringify(result.ops, undefined, 4))
	// });

	// db.collection('Users').insertOne({
	// 	name: 'Rob',
	// 	age: 27,
	// 	location: 'Canada'
	// }, (err, result) => {
	// 	if (err) {
	// 		return console.log('Unable to add document to database', err);
	// 	}

	// 	console.log('Record added successsfully!!');
	// 	console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 4));
	// });

	db.close();
});