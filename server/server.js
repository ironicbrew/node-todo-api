require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const hbs = require('hbs');
const path = require('path');
const http = require('http');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const socketIO = require('socket.io');
const request = require('request');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
var {Inspection} = require('./models/inspection');
var {Atcoinspection} = require('./models/atco-inspection');
var {Project} = require('./models/project');
var {cranes} = require('./models/cranes');
var {globalLocations} = require('./models/work-locations');
var {projects} = require('./models/projects')

var app = express();
const port = process.env.PORT;
var server = http.createServer(app);
var io = socketIO(server);

app.use(bodyParser.json('application/json'));
// app.use(bodyParser.urlencoded({extended: false}, 'application/x-www-form-urlencoded'));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'public/views'))
hbs.registerPartials(__dirname + '/public/views/partials');

io.on('connection', (socket) => {
	console.log('new user connected');
});

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

server.listen(port, () => {
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

	// doc = new PDFDocument

	// doc.pipe(fs.createWriteStream('./inspection.pdf'))

	// doc.fontSize(25)
	// 	.text(`${req.body.name} ${req.body.serial} ${req.body.inspection_status}`, 200, 200)


	// doc.end()

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

app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then((user) => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	})
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		console.log(e);
		res.status(400).send();
	});

	// User.findOne({email: req.body.email}).then((user) => {
	// 	bcrypt.compare(req.body.password, user.password, (err, res) => {
	// 		console.log(res);
	// 	});
	// });

});

app.post('/webhook/craneinspections', (req, res) => {

	var today = new Date();
	var id = req.body["Crane ID#"];
	var type = "Crane Inspection";

	var options = {
		method: 'POST',
		uri: 'https://api.powerbi.com/beta/f1e31150-57dd-4b78-9208-3c24b9366a23/datasets/a7123003-8343-45ac-80a5-000245b02135/rows?key=wByWRSyXTUIBj%2F13kNef3HPX2wZRapNieID9FGXbcjN%2FNgc3y1Z10KLWn4tC7yL18ZWXEhIfgWZE4E5c6%2BRpnA%3D%3D',
		json: true,
		body: [{"CraneID": id, "Type": type}],
	};

	console.log(options.body);


	var atcoInspection = Atcoinspection({
		id: req.body["Crane ID#"],
		type: "Crane Inspection"
	});

	request(options, (err, message, body) => {
			if (!err) {
				// console.log(message);
				console.log('success');
				// console.log(body);
	} else {
		console.log(err);
	}

});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/monthlyhsestewardshipreport', (req, res) => {

	var today = new Date();
	var workLocation = req.body["Work Location"];
	var type = "HSE-monthlystewardshipreport";
	var personReporting = req.body["Person Reporting"];
	var reportingPeriod = req.body["Reporting Period"];
	var totalNumberOfEmployees = req.body["Total Number of Employees"];
	var totalHoursWorkedByASLMfg = req.body["Total Hours Worked By ASL Mfg."];
	var totalHoursWorkedByOffice = req.body["Total Hours Worked By Office"];
	var totalHoursWorkedByContractors = req.body["Total Hours Worked By Contractors"];
	var restrictedWorkInjuries = req.body["Restricted Work Injuries"];
	var totalDaysOnRestrictedWork = req.body["Total Days on Restricted Work"];
	var lostTimeInjuries = req.body["Lost Time Injuries"];
	var totalDaysLostTime = req.body["Total Days Lost Time"];
	var conductedFieldLevelHazardAnalysis = req.body["Conducted Field Level Hazard Analysis (FLHA)/Field Level Risk Assessment (FLRA)"];
	var conductedToolboxOrTailboardMeetings = req.body["Conducted Toolbox or Tailboard Meetings"];
	var reviewOrDevelopment = req.body["Review or Development – Safe Work Practices (SWP) or Safe Job Procedure (SJP) or Job Safety Analysis (JSA) or Job Hazard Analysis (JHA)"];
	var conductedSafetyMeetings = req.body["Conducted Safety Meetings"];
	var observations = req.body["Observations"];
	var documentedSafetyFocusedASLandClientManagementTours = req.body["Documented Safety Focused ASL and Client Management Tours"];
	var equipmentAndBuildingInspections = req.body["Equipment and Building Inspections"];
	var JHSCMeetings = req.body["Joint Health & Safety Committee Meetings (JHSC)"];
	var orientations = req.body["Site/Facility HSE Orientations"];
	var totalDocumentedTrainingHours  = req.body["Total Documented HSE Training Hours"];
	var employeeSafetyRecognitionPrograms = req.body["Employee Safety Recognition Programs"];


	var options = {
		method: 'POST',
		uri: 'https://api.powerbi.com/beta/f1e31150-57dd-4b78-9208-3c24b9366a23/datasets/e0f79bc7-9f09-44e9-a0ef-30ff1540e96f/rows?key=NNrZNqLP7wx6HPB9TPDb0Hx1I0u%2FFtFWO%2F%2FeAVkRSM4WJtPxKM7PRrK4POgFYYmWi%2FZg5Ky81t7wwVjP6AXM6w%3D%3D',
		json: true,
		body: [{"workLocation": workLocation,
		"dateSubmitted": today,
		"type": type,
		"personReporting": personReporting,
		"reportingPeriod": reportingPeriod,
		"totalNumberOfEmployees": totalNumberOfEmployees,
		"totalHoursWorkedByASLMfg": totalHoursWorkedByASLMfg,
		"totalHoursWorkedByOffice": totalHoursWorkedByOffice,
		"totalHoursWorkedByContractors": totalHoursWorkedByContractors,
		"restrictedWorkInjuries": restrictedWorkInjuries,
		"totalDaysOnRestrictedWork": totalDaysOnRestrictedWork,
		"lostTimeInjuries": lostTimeInjuries,
		"totalDaysLostTime": totalDaysLostTime,
		"conductedFieldLevelHazardAnalysis": conductedFieldLevelHazardAnalysis,
		"conductedToolboxOrTailboardMeetings": conductedToolboxOrTailboardMeetings,
		"reviewOrDevelopment": reviewOrDevelopment,
		"conductedSafetyMeetings": conductedSafetyMeetings,
		"observations": observations,
		"documentedSafetyFocusedASLandClientManagementTours": documentedSafetyFocusedASLandClientManagementTours,
		"equipmentAndBuildingInspections": equipmentAndBuildingInspections,
		"JHSCMeetings": JHSCMeetings,
		"orientations": orientations,
		"totalDocumentedTrainingHours": totalDocumentedTrainingHours,
		"employeeSafetyRecognitionPrograms": employeeSafetyRecognitionPrograms,
		}],
	};

	var CorporateForm = Atcoinspection({
		name: req.body["Work Location"],
		type: "HSE-monthlystewardshipreport"
	});

	request(options, (err, message, body) => {
			if (!err) {
				// console.log(message);
				console.log('success');
				// console.log(body);
	} else {
		console.log(err);
	}

});

	io.emit('newCorporateForm', CorporateForm);

	CorporateForm.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/carrierinspections', (req, res) => {

	var atcoInspection = Atcoinspection({
		id: req.body["Carrier ID#"],
		type: "Carrier Inspection"
	});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/forkliftinspections', (req, res) => {

	var atcoInspection = Atcoinspection({
		id: req.body["Forklift ID#"],
		type: "Forklift Inspection"
	});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/powerpalletinspections', (req, res) => {

	var atcoInspection = Atcoinspection({
		id: req.body["Power Pallet ID#"],
		type: "Power Pallet Inspection"
	});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/scissorliftinspections', (req, res) => {

	var atcoInspection = Atcoinspection({
		id: req.body["Scissor Lift ID#"],
		type: "Scissor Lift Inspection"
	});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/toolbox', (req, res) => {

	toolboxId = req.body["Shop"].replace(/\s/g, '');

	var atcoInspection = Atcoinspection({
		id: toolboxId,
		type: "Toolbox"
	});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/flha', (req, res) => {

	var atcoInspection = Atcoinspection({
		id: 'flha',
		type: 'flha'
	});

	io.emit('newInspection', atcoInspection);

	atcoInspection.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/webhook/taskcomplete', (req, res) => {

	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	var options = {
		method: 'POST',
		uri: 'https://api.powerbi.com/beta/f1e31150-57dd-4b78-9208-3c24b9366a23/datasets/b9aba7dc-23f1-466e-b72f-1bae6a843d24/rows?key=aN%2BbhmsiT7oujtEak5pjsX5UCszbi6DFplxUWK2bw%2FQdEoqk4DgtzUKqG8bUV0%2Foyj0r74B%2BDW%2BMl4D7W6xhmQ%3D%3D',
		json: true,
		body: [{"Unit": req.body["Unit"],
		"Task": req.body["Task"],
		"Step": req.body["Step"],
		"Status": req.body["Status"],
		"Time": today
	}],
	};



	request(options, (err, message, body) => {
			if (!err) {
				// console.log(message);
				console.log('success');
				// console.log(body);
	} else {
		console.log(err);
	}

});




	var status = undefined;
	var taskStatus = req.body["Status"];

	if (taskStatus === "In_Progress") {
		status = false
	} else {
		status = true
	}

	var newTask = {
		id: req.body["Unit"],
		task: req.body["Task"],
		taskStep: req.body["Task Step"],
		status: status
	};

	if (taskStatus === "Complete") {
		Project.findOne({id: req.body["Unit"]}).then((projectToUpdate) => {
			var taskToUpdate = req.body["Task"];
			var taskStepToUpdate = req.body["Task Step"];

	// Sorts through the tasks in the project, finds the one the webhook is refering to and marks it as true
			for (i = 0; i < projectToUpdate.tasks.length ; i++) {
				if (projectToUpdate.tasks[i].name === taskToUpdate) {
					projectToUpdate.tasks[i][taskStepToUpdate] = true;
				}
			}

			projectToUpdate.save();

		}), (e) => {
			res.status(400).send(e);
		}
	}



	io.emit('newTask', newTask);

	res.send('success!');

});

module.exports = {app};

app.get('/atcoinspections', (req, res) => {
	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	Atcoinspection.find({date: {$gte: today}}).then((atcoinspections) => {
		var completed = atcoinspections.length;
		var notCompleted = cranes.length - completed;

		for (i = 0; i < atcoinspections.length ; i++) {
			for (j = 0; j < cranes.length ; j++) {
				if (atcoinspections[i].id === cranes[j].id) {
				cranes[j]['status'] = true;
				}
			}
		}

		res.render('atcodashboard.hbs', {cranes, completed, notCompleted});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/corpdashboard', (req, res) => {
	var now = new Date();
	var thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	Atcoinspection.find({date: {$gte: thisMonth}}).then((atcoinspections) => {

		for (i = 0; i < atcoinspections.length ; i++) {
			for (j = 0; j < globalLocations.length ; j++) {
				if (atcoinspections[i].name === globalLocations[j].name) {
				globalLocations[j]['status'] = true;
				}
			}
		}

		res.render('corpdashboard.hbs', {globalLocations});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/atcoinspections/leadingindicators', (req, res) => {

	var now = new Date();
	var thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		Atcoinspection.find({date: {$gte: thisMonth}}).then((inspectionArray) => {

    var currentToolboxes = inspectionArray.filter(inspection => inspection.type === 'Toolbox' ).length;
		var currentCraneInspection = inspectionArray.filter(inspection => inspection.type === 'Crane Inspection' ).length;
		var currentCarrierInspection = inspectionArray.filter(inspection => inspection.type === 'Carrier Inspection' ).length;
		var currentForkliftInspection = inspectionArray.filter(inspection => inspection.type === 'Forklift Inspection' ).length;
		var currentPowerPalletInspection = inspectionArray.filter(inspection => inspection.type === 'Power Pallet Inspection' ).length;
		var currentScissorLiftInspection = inspectionArray.filter(inspection => inspection.type === 'Scissor Lift Inspection' ).length;
		var currentflha = inspectionArray.filter(inspection => inspection.type === 'flha' ).length;

		console.log(inspectionTotals)


		var inspectionTotals = {
			currentCraneInspection,
			currentCarrierInspection,
			currentForkliftInspection,
			currentPowerPalletInspection,
			currentScissorLiftInspection,
			currentToolboxes,
			currentflha
		}

		res.render('leadingindicators.hbs', {inspectionTotals});

		}, (e) => {
			res.status(400).send(e);
		});

});

app.get('/atcoprojects', (req, res) => {


		Project.find().then((projects) => {
			res.render('projectdashboard.hbs', {projects});
		}), (e) => {
			res.status(400).send(e);
		}

});

// app.get('/atcoprojects/:shop', (req, res) => {
//
// 		var shop = req.params.shop
//
// 		Project.find({tasks[]}).then((projects) => {
// 			res.render('projectdashboard.hbs', {projects});
// 		}), (e) => {
// 			res.status(400).send(e);
// 		}
//
// });

module.exports = {app};
