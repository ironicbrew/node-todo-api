const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('./../server');
var {Todo} = require('./../models/todo');
var {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test todo text';

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => done(e));
			});
	});	

	it('should not create todo with invalid body data', (done) => {

		request(app)
			.post('/todos')
			.send()
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find().then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((e) => done(e));
			});

	});
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should get a specific todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {

		var hexID = new ObjectID().toHexString();

		request(app)
			.get(`/todos/${hexID}`)
			.expect(400)
			.end(done);
	});

	it('should return 400 for non-object IDs', (done) => {
		request(app)
			.get(`/todos/123`)
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should delete a specific todo doc', (done) => {
		var deletedDocument = todos[0].text;
		request(app)
			.delete(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(deletedDocument);
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {

		var hexID = new ObjectID().toHexString();

		request(app)
			.delete(`/todos/${hexID}`)
			.expect(400)
			.end(done);
	});

	it('should return 400 for non-object IDs', (done) => {
		request(app)
			.delete(`/todos/123`)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should patch a specific todo doc', (done) => {
		var patchJSON = {
						_id: new ObjectID(),
						text: 'Second test todo',
						completed: true
						};
		request(app)
			.patch(`/todos/${todos[1]._id.toHexString()}`)
			.send(patchJSON)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.completed).toBe(true);
			})
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {

		var hexID = new ObjectID().toHexString();

		request(app)
			.patch(`/todos/${hexID}`)
			.expect(404)
			.end(done);
	});

	it('should return 400 for non-object IDs', (done) => {
		request(app)
			.patch(`/todos/5ae13cf8135cc11400e7bb84444`)
			.send({goobs: 'goobers'})
			.expect(404)
			.end(done);
	});
});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = 'example@example.com';
		var password = '123mnb!';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if (err) {
					return done(err);
				}

				User.findOne({email}).then((user) => {
					expect(user).toExist();
					expect(user.password).toNotBe(password);
					done();
				});
			});
	});

	it('should return validation errors if request invalid', (done) => {
		var email = 'gooberface';
		var password = 'xxx';

		request(app)
			.post('/users')
			.send({email,password})
			.expect(400)
			.end(done)
	});

	it('should not create user if email in use', (done) => {
		var email = 'rabbiebutts@example.com';
		var password = 'xxx';

		request(app)
			.post('/users')
			.send({email,password})
			.expect(400)
			.end(done)

	});
});