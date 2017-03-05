'use strict';

const 
			chalk = require('chalk'),
			array_utils = require('./array_utils'),
			select = array_utils.select,
			selectN = array_utils.selectN,
			shuffle = array_utils.shuffle;

function generateTestData(count) {
	function generateDatum() {
		return {
			name: 'cvcvcvdv'.replace(/./g, x => 
				x === 'c' ? select('bcdfghjklmnprstvwxz'.split(''))
					: x === 'v' ? select('aeiou'.split('')) 
					: x === 'd' ? select('ts'.split(''))
					: x
				),
			friends: []
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

const testData = generateTestData(10);

console.log(chalk.red('\n## initial test data ##\n'));
console.log(testData);

// now (for example) we want to ensure friend lists are symmetrical

let find = name => testData.filter( ent => ent.name === name ).pop();
let fixed = testData
	.map( entity => {
		let friends = entity.friends.map( friend => find(friend) );
		// console.log(`entity: ${entity.name}'s friends: ${ JSON.stringify(friends) }`);
		friends.map( friend => {
			if (friend.friends.indexOf(entity.name) === -1) {
				friend.friends.push(entity.name);
			}
		});
		return entity;
	});

console.log(chalk.red('\n\n## test data with fixed friends ##\n'));
console.log(fixed);