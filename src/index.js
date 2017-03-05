'use strict';

const 
	debugMode 	= false,
	chalk 			= require('chalk'),
	array_utils = require('./array_utils'),
	select 			= array_utils.select,
	selectN 		= array_utils.selectN,
	shuffle 		= array_utils.shuffle,
	Lazify 			= require('./Lazify');

const 
	testIterations = 50000;

let 
	debug = debugMode 
		?	function() { console.log.apply(console, arguments); } 
		: () => null;

function main() {
	const testData = generateTestData(10);

	/**
	 * 
	 * More data initialisation
	 * 
	 */
	(function() {
		debug(chalk.red('\n## initial test data ##\n'));
		debug(testData);

		// now (for example) we want to ensure friend lists are symmetrical
		let find = name => testData.filter( ent => ent.name === name ).pop();
		let fixed = testData
			.map( entity => {
				/**
				 * THIS IS NAUGHTY AND MODIFIES IN PLACE
				 */
				let friends = entity.friends.map( friend => find(friend) );
				debug(`entity: ${entity.name}'s friends: ${ JSON.stringify(friends) }`);
				friends.map( friend => {
					if (friend.friends.indexOf(entity.name) === -1) {
						friend.friends.push(entity.name);
					}
				});
				return entity;
			});

		debug(chalk.red('\n\n## test data with fixed friends ##\n'));
		debug(fixed);
	}());

	// some test filters
	let happy = ent => ent.happy;
	let capitaliseName = ent => { ent.name = ent.name.toUpperCase(); return ent; };
	let capitaliseFriends = ent => { ent.friends = ent.friends.map(str => String.prototype.toUpperCase.call('' + str)); return ent; }

	/**
	 * 
	 * Using normal array functions
	 * 
	 */
	(function() {
		let happyCapitals;

		console.time(chalk.magenta('normal'));
		for (var i=0; i < testIterations; i++) {
			happyCapitals = testData.filter(happy).map(capitaliseName).map(capitaliseFriends);
		}
		console.timeEnd(chalk.magenta('normal'));

		debug(chalk.green('\n\n## Normal approach: happy capitals ##\n'));
		debug(happyCapitals);
	}());

	/**
	 * 
	 * using lazy-wrapped array functions
	 * 
	 */
	(function() {
		let lazy = new Lazify(testData)
			.filter(happy)
			.map(capitaliseName)
			.map(capitaliseFriends);

		let results;
		let compiled = lazy.compile();
		console.time(chalk.magenta('compiled'));
		for (var i=0; i < testIterations; i++) {
			results = compiled(testData);
		}
		console.timeEnd(chalk.magenta('compiled'));

		debug(chalk.green('## compiled result'));
		debug(results);	
	}());
}


function generateTestData(count) {
	function generateDatum() {
		return {
			name: 'cvcvcvdv'.replace(/./g, x => 
				x === 'c' ? select('bcdfghjklmnprstvwxz'.split(''))
					: x === 'v' ? select('aeiou'.split('')) 
					: x === 'd' ? select('ts'.split(''))
					: x
				),
			friends: [],
			happy: Math.random() < 0.5 ? true : false
		};
	}

	// create base structure
	var data = (new Array(count)).join(',').split(',')
		.map(generateDatum);

	// generate friends
	data.map( d => {
		const friendCount = ~~(Math.random() * data.length/2);
		const friends = selectN(data, friendCount).map( d => d.name ).filter( friend => friend != d.name );
		d.friends = friends;
	});

	return data;
}

main();
