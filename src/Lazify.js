'use strict';

let chalk = require('chalk');

class Lazify {
  constructor(arr) {
    this.arr      = arr;
    this.actions  = [];
  }

  filter(fn) {
    this.actions.push(['filter', fn]);
    return this;
  }

  map(fn) {
    this.actions.push(['map', fn]);
    return this;
  }

  reduce(fn, initial) {
    /**
     * No idea how this would work yet
     */
  }

  compile() {
    return this._compile();
  }

  _compile() {
    let 
      src    = [
        `'use strict'`
        // eventually contains all lines of the function
      ],
      result = this.actions.map( actionSet => {
        let action  = actionSet[0],
            fn      = actionSet[1],
            result  = {
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

    src = src.concat( result.map( (entry, idx) => {
      let funcName      = `__func__${idx}__`,
          funcSource    = entry.fn.toString(),
          funcIsLambda  = funcSource.indexOf('=>') !== -1;

      entry.funcName = funcName;
      return `let ${funcName} = ${funcSource}; // ${funcIsLambda ? 'lambda' : 'normal'}`;
    }));

    // function (inArray ...) {
    src.push( `      
      let __result_array__ = [];
      const len = inArray.length;
      for (var i=0; i < len; i++) {
        let __current_item__ = inArray[i];
    `);

    src = src.concat( result.map( entry => {
      return entry.src
        .replace(/\$\!/g, entry.funcName)
        .replace(/\$\$/g, '__current_item__');
    }));

    src.push( `
        __result_array__.push(__current_item__);
      }
      return __result_array__;
    `);

    return new Function('inArray', src.join('\n'));
  }
}

module.exports = Lazify;