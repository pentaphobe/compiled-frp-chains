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

/**
 * Actual body of stuff
 */

let happy = ent => ent.happy;
let capitaliseName = ent => { ent.name = ent.name.toUpperCase(); return ent; };
let capitaliseFriends = ent => { ent.friends = ent.friends.map(str => String.prototype.toUpperCase.call('' + str)); return ent; }

let happyCapitals = testData.filter(happy).map(capitaliseName).map(capitaliseFriends);

console.log(chalk.green('\n\n## Normal approach: happy capitals ##\n'));
console.log(happyCapitals);

class Lazify {
	constructor(arr) {
		this.arr = arr;
		this.actions = [];
	}
	filter(fn) {
		this.actions.push(['filter', fn]);
		return this;
	}
	map(fn) {
		this.actions.push(['map', fn]);
		return this;
	}
	run() {
		console.log(chalk.yellow('## running'));
		console.log(this.actions);
		let actionFunc = this._compile();
		console.log(chalk.yellow('## compiled func'));
		console.log(actionFunc.toString());
		console.log(chalk.yellow('## returning result'));
		return actionFunc(this.arr);
	}
	_compile() {
		let result = [];
		result = this.actions.map( actionSet => {
			let action = actionSet[0],
					fn = actionSet[1];
			let result = {
				fn: fn,
				src: ''
			};
			// assumes '$$' is current item, $! is current function
			switch (action) {
				case 'filter': result.src = `
					if (! $!($$) ) { continue; }
				`; break;
				case 'map': result.src = `
					$$ = $!($$);
				`; break;
			}
			return result;
		});

		// predefine functions
		let src = [`'use strict'`];
		src = src.concat( result.map( (entry, idx) => {
			let funcName = `__func__${idx}__`;
			let funcSource = entry.fn.toString();
			let funcIsLambda = funcSource.indexOf('=>') !== -1;
			entry.funcName = funcName;
			return `let ${funcName} = ${funcSource}; // ${funcIsLambda ? 'lambda' : 'normal'}`;
		}));

		// function (inArray)
		src .push( `			
			let __result_array__ = [];
			const len = inArray.length;
			for (var i=0; i < len; i++) {
				let __current_item__ = inArray[i];
		`);

		src = src.concat( result.map( entry => {
			let src = entry.src
				.replace(/\$\!/g, entry.funcName)
				.replace(/\$\$/g, '__current_item__');
			return src;
		}));

		src.push( `
				__result_array__.push(__current_item__);
			}
			return __result_array__;
		`);

		// console.log(chalk.cyan(src.join('\n')));
		return new Function('inArray', src.join('\n'));
	}
}

let lazy = new Lazify(testData)
	.filter(happy)
	.map(capitaliseName)
	.map(capitaliseFriends);

let results = lazy.run();

console.log(chalk.green('## compiled result'));
console.log(results);