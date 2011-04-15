/*
 * Copyright 2011 Markus Pielmeier
 *
 * This file is part of jsUnit.
 *
 * jsUnit is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * jsUnit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with jsUnit.  If not, see <http://www.gnu.org/licenses/>.
 */

jsUnit = function(){
    var testTimeout = 10 * 1000;

    var assertCount = 0;

    var TestRun = function(testConfig, callback){
	var running = true;

	function logFail(msg){
	    console.error(msg);

	    return msg;
	}

	function fail(msg){
	    var error = logFail(msg);

	    endTest();

	    throw 'AssertionError';
	}

	function assertTrue(value, msg){
	    ++assertCount;
	
	    if(value === true){
		return;
	    }

	    fail(msg);
	}

	function assertEqual(expected, actual){
	    assertTrue(expected === actual, 'Expected ' + expected + ' but was ' + actual);
	}

	function assertNotEqual(expected, actual){
	    assertTrue(expected !== actual, 'Not expected ' + expected + ' but was ' + actual);
	}

	function endTest(){
	    if(running === false){
		console.warn('Duplicate endTest call for test ' + testConfig.name);

		return;
	    }

	    running = false;

	    console.groupEnd();

	    setTimeout(callback, 0);
	}

	function timeoutTestCallback(){
	    if(running === false){
		// already terminated => no timeout required
		return;
	    }

	    fail('timeout');
	}

	var testApi = {
	    success: function(){
		endTest();
	    },

	    fail: fail,

	    assertTrue: assertTrue,

	    assertEqual: assertEqual,

	    assertNotEqual: assertNotEqual
	};

	return {
	    start: function(){
		console.group(testConfig.name);

		try{
		    var result = testConfig.func(testApi);

		    if(result === undefined){
			endTest();
		    }
		    else{
			setTimeout(timeoutTestCallback, testTimeout);
		    }
		} catch(e){
		    if(e !== 'AssertionError'){
			logFail(e);
		    }
		    else{
			endTest();
		    }
		}
	    }
	};
    };

    function runTest(tests, index){
	if(index >= tests.length){
	    console.log('Executed ' + tests.length + ' tests with ' + assertCount + ' assertions');
	    
	    return;
	}

	var test = TestRun(tests[index], function(){
			       runTest(tests, index + 1);
			   });

	test.start();
    }

    return {
	run: function(tests){
	    assertCount = 0;

	    runTest(tests, 0);
	}
    };
}();

/*
 * this is some example test code:

testSuite = [
    {
	name: 'parse date strings',
	func: function(test){
	    var date = Date.parse('Tue Mar 29 23:42:03 +0000 2011');
	    
	    test.assertEqual(1301442123000, date);
	}
    },
    {
	name: 'add operator',
	func: function(test){
	    test.assertEqual(2, 1 + 1);
	}
    }
];

jsUnit.run(testSuite);
 */
