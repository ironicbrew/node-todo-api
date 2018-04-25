const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');
const{ObjectID} = require('mongodb');

// var id = '5adff0390b7acf6427c0067c';

// if (!ObjectID.isValid(id)) {
// 	console.log('ID not valid');
// }

// Todo.find({
// 	_id: id
// }).then((todos) => {
// 	console.log('Todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then((todo) => {
// 	console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
// 	if(!todo) {
// 		return console.log('Id not found');
// 	}
// 	console.log('Todo by id', todo);
// }).catch((e) => console.log(e));

User.findById('5ade50f995331ec81d37d1d2').then((user) => {
	if (!user) {
		console.log('user not found');
	}

	console.log ('User by id', user);
}).catch((e) => console.log(e));
