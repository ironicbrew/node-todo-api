var projects = [
{
	id: '7342',
	tasks: [
		{name: 'framing', prep: true, material: true, install: true},
		{name: 'rough_in', prep: true, material: true, install: false},
		{name: 'poly', prep: false, material: false, install: false},
		{name: 'sound_gasket', prep: false, material: false, install: false}
		]
	},

{
	id: '1234',
	tasks: [
		{name: 'framing', prep: false, material: false, install: false},
		{name: 'rough_in', prep: false, material: false, install: false},
		{name: 'poly', prep: false, material: false, install: false},
		{name: 'sound_gasket', prep: false, material: false, install: false}
		]
	},

{
	id: '5678',
	tasks: [
		{name: 'framing', prep: false, material: false, install: false},
		{name: 'rough_in', prep: false, material: false, install: false},
		{name: 'poly', prep: false, material: false, install: false},
		{name: 'sound_gasket', prep: false, material: false, install: false}
		]
	}
];

module.exports = {projects};