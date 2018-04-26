const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const hbs = require('hbs');
const path = require('path');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {Inspection} = require('./models/inspection');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json('application/json'));
app.use(bodyParser.urlencoded({extended: false}, 'application/x-www-form-urlencoded'));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'public/views'))
hbs.registerPartials(__dirname + '/public/views/partials');

app.get('/', (req, res) => {
	res.render('dashboard.hbs');
});

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
})

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos/:id', (req, res) => {
	var id = req.params.id



	if (!ObjectID.isValid(id)) {
		res.status(404).send('404, ID not valid');
	} else {
		Todo.findById(id).then((todo) => {
			if (!todo) {
				res.status(400).send('todo not found');
			} else {
				doc = new PDFDocument

				doc.pipe(fs.createWriteStream('./output.pdf'))

				doc.fontSize(25)
					.text(`${todo.text}`, 100, 100)

				doc.end()
				res.send({todo});
			}
		});
	}
});

app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		res.status(404).send('404, ID not valid');
	} 

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if(!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
});

app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) {
		res.status(404).send('404, ID not valid');
	} else {
		Todo.findByIdAndRemove(id).then((todo) => {
			if (!todo) {
				res.status(400).send('todo not found');
			} else {
				res.send({todo});
			}
		});
	}

});

app.get('/craneinspection', (req, res) => {
	res.render('craneinspectionform.hbs');
});

app.post('/craneinspection', (req, res) => {

	doc = new PDFDocument

	doc.pipe(fs.createWriteStream('./inspection.pdf'))

	doc.fontSize(25)
		.text(`${req.body.name} ${req.body.serial} ${req.body.inspection_status}`, 200, 200)


	doc.end()

	var inspection = new Inspection({
		name: req.body.name,
		serial: req.body.serial,
		inspection_status: req.body.inspection_status
	});

	inspection.save().then((doc) => {
		console.log(doc);
	}, (e) => {
		// res.status(400).send(e);
		console.log('An error occurred');
	});

	res.render('craneinspectionform.hbs', {thanks: "Thank you for your submission!"});
});

app.get('/craneinspections', (req, res) => {

	Inspection.find().then((inspections) => {
		res.render('craneinspections.hbs', {inspections});
	});
});

app.get('/dashboard', (req, res) => {

	res.render('dashboard.hbs');

});


module.exports = {app};




