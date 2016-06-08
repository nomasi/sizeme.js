/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );
/*!
 * jQuery UI Core 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */
(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.9.2",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,'position')) && (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,'overflow')+$.css(this,'overflow-y')+$.css(this,'overflow-x'));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().andSelf().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	// access offsetHeight before setting the style to prevent a layout bug
	// in IE 9 which causes the element to continue to take up space even
	// after it is removed from the DOM (#8026)
	div.offsetHeight;

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated

(function() {
	var uaMatch = /msie ([\w.]+)/.exec( navigator.userAgent.toLowerCase() ) || [];
	$.ui.ie = uaMatch.length ? true : false;
	$.ui.ie6 = parseFloat( uaMatch[ 1 ], 10 ) === 6;
})();

$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	contains: $.contains,

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );

/*!
 * jQuery UI Widget 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( $.isFunction( value ) ) {
			prototype[ prop ] = (function() {
				var _super = function() {
						return base.prototype[ prop ].apply( this, arguments );
					},
					_superApply = function( args ) {
						return base.prototype[ prop ].apply( this, args );
					};
				return function() {
					var __super = this._super,
						__superApply = this._superApply,
						returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			})();
		}
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
	}, prototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		// TODO remove widgetBaseClass, see #8155
		widgetBaseClass: fullName,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			// 1.9 BC for #7810
			// TODO remove dual storage
			$.data( element, this.widgetName, this );
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( value === undefined ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( value === undefined ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && ( $.effects.effect[ effectName ] || $.uiBackCompat !== false && $.effects[ effectName ] ) ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

// DEPRECATED
if ( $.uiBackCompat !== false ) {
	$.Widget.prototype._getCreateOptions = function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	};
}

})( jQuery );

/*!
 * jQuery UI Mouse 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function( e ) {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	version: "1.9.2",
	options: {
		cancel: 'input,textarea,button,select,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + '.preventClickEvent')) {
					$.removeData(event.target, that.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
				.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
			$.removeData(event.target, this.widgetName + '.preventClickEvent');
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && !(document.documentMode >= 9) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + '.preventClickEvent', true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);

/*!
 * jQuery UI Position 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseInt( offsets[ 0 ], 10 ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseInt( offsets[ 1 ], 10 ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}
function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow ? "" : within.element.css( "overflow-x" ),
			overflowY = within.isWindow ? "" : within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowX ? $.position.scrollbarWidth() : 0,
			height: hasOverflowY ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] );
		return {
			element: withinElement,
			isWindow: isWindow,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: isWindow ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		targetElem = target[0],
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	if ( targetElem.nodeType === 9 ) {
		targetWidth = target.width();
		targetHeight = target.height();
		targetOffset = { top: 0, left: 0 };
	} else if ( $.isWindow( targetElem ) ) {
		targetWidth = target.width();
		targetHeight = target.height();
		targetOffset = { top: target.scrollTop(), left: target.scrollLeft() };
	} else if ( targetElem.preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
		targetWidth = targetHeight = 0;
		targetOffset = { top: targetElem.pageY, left: targetElem.pageX };
	} else {
		targetWidth = target.outerWidth();
		targetHeight = target.outerHeight();
		targetOffset = target.offset();
	}
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !$.support.offsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem : elem
				});
			}
		});

		if ( $.fn.bgiframe ) {
			elem.bgiframe();
		}

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			}
			else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
			else if ( overBottom > 0 ) {
				newOverTop = position.top -  data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function () {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	$.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

// DEPRECATED
if ( $.uiBackCompat !== false ) {
	// offset option
	(function( $ ) {
		var _position = $.fn.position;
		$.fn.position = function( options ) {
			if ( !options || !options.offset ) {
				return _position.call( this, options );
			}
			var offset = options.offset.split( " " ),
				at = options.at.split( " " );
			if ( offset.length === 1 ) {
				offset[ 1 ] = offset[ 0 ];
			}
			if ( /^\d/.test( offset[ 0 ] ) ) {
				offset[ 0 ] = "+" + offset[ 0 ];
			}
			if ( /^\d/.test( offset[ 1 ] ) ) {
				offset[ 1 ] = "+" + offset[ 1 ];
			}
			if ( at.length === 1 ) {
				if ( /left|center|right/.test( at[ 0 ] ) ) {
					at[ 1 ] = "center";
				} else {
					at[ 1 ] = at[ 0 ];
					at[ 0 ] = "center";
				}
			}
			return _position.call( this, $.extend( options, {
				at: at[ 0 ] + offset[ 0 ] + " " + at[ 1 ] + offset[ 1 ],
				offset: undefined
			} ) );
		};
	}( jQuery ) );
}

}( jQuery ) );

/*!
 * jQuery UI Draggable 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	version: "1.9.2",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false
	},
	_create: function() {

		if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
			this.element[0].style.position = 'relative';

		(this.options.addClasses && this.element.addClass("ui-draggable"));
		(this.options.disabled && this.element.addClass("ui-draggable-disabled"));

		this._mouseInit();

	},

	_destroy: function() {
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
			return false;

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle)
			return false;

		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css("position");
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);


		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) $.ui.ddmanager.dragStart(this, event);

		return true;
	},

	_mouseDrag: function(event, noPropagation) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger('drag', event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			dropped = $.ui.ddmanager.drop(this, event);

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		//if the original element is no longer in the DOM don't bother to continue (see #8269)
		var element = this.element[0], elementInDom = false;
		while ( element && (element = element.parentNode) ) {
			if (element == document ) {
				elementInDom = true;
			}
		}
		if ( !elementInDom && this.options.helper === "original" )
			return false;

		if((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			var that = this;
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function(event) {
		//Remove frame helpers
		$("div.ui-draggable-iframeFix").each(function() {
			this.parentNode.removeChild(this);
		});

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.ui.ddmanager ) $.ui.ddmanager.dragStop(this, event);

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {

		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function() {
				if(this == event.target) handle = true;
			});

		return handle;

	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element);

		if(!helper.parents('body').length)
			helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));

		if(helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
			helper.css("position", "absolute");

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			o.containment == 'document' ? 0 : $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
			o.containment == 'document' ? 0 : $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top,
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
			var c = $(o.containment);
			var ce = c[0]; if(!ce) return;
			var co = c.offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				(parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0),
				(parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0),
				(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right,
				(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top  - this.margins.bottom
			];
			this.relative_container = c;

		} else if(o.containment.constructor == Array) {
			this.containment = o.containment;
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
			var containment;
			if(this.containment) {
			if (this.relative_container){
				var co = this.relative_container.offset();
				containment = [ this.containment[0] + co.left,
					this.containment[1] + co.top,
					this.containment[2] + co.left,
					this.containment[3] + co.top ];
			}
			else {
				containment = this.containment;
			}

				if(event.pageX - this.offset.click.left < containment[0]) pageX = containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < containment[1]) pageY = containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > containment[2]) pageX = containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > containment[3]) pageY = containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				var top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? (!(top - this.offset.click.top < containment[1] || top - this.offset.click.top > containment[3]) ? top : (!(top - this.offset.click.top < containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? (!(left - this.offset.click.left < containment[0] || left - this.offset.click.left > containment[2]) ? left : (!(left - this.offset.click.left < containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
		//if($.ui.ddmanager) $.ui.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		if(type == "drag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function(event) {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, 'sortable');
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
				if(this.shouldRevert) this.instance.options.revert = true;

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper == 'original')
					this.instance.currentItem.css({ top: 'auto', left: 'auto' });

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), that = this;

		var checkPos = function(o) {
			var dyClick = this.offset.click.top, dxClick = this.offset.click.left;
			var helperTop = this.positionAbs.top, helperLeft = this.positionAbs.left;
			var itemHeight = o.height, itemWidth = o.width;
			var itemTop = o.top, itemLeft = o.left;

			return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
		};

		$.each(inst.sortables, function(i) {

			var innermostIntersecting = false;
			var thisSortable = this;
			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;

			if(this.instance._intersectsWith(this.instance.containerCache)) {
				innermostIntersecting = true;
				$.each(inst.sortables, function () {
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;
					if  (this != thisSortable
						&& this.instance._intersectsWith(this.instance.containerCache)
						&& $.ui.contains(thisSortable.instance.element[0], this.instance.element[0]))
						innermostIntersecting = false;
						return innermostIntersecting;
				});
			}


			if(innermostIntersecting) {
				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(that).clone().removeAttr('id').appendTo(this.instance.element).data("sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) this.instance._mouseDrag(event);

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;

					//Prevent reverting on this forced stop
					this.instance.options.revert = false;

					// The out event needs to be triggered independently
					this.instance._trigger('out', event, this.instance._uiHash(this.instance));

					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) this.instance.placeholder.remove();

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			};

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function(event, ui) {
		var t = $('body'), o = $(this).data('draggable').options;
		if (t.css("cursor")) o._cursor = t.css("cursor");
		t.css("cursor", o.cursor);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if (o._cursor) $('body').css("cursor", o._cursor);
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data('draggable').options;
		if(t.css("opacity")) o._opacity = t.css("opacity");
		t.css('opacity', o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if(o._opacity) $(ui.helper).css('opacity', o._opacity);
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function(event, ui) {
		var i = $(this).data("draggable");
		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
	},
	drag: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {

			if(!o.axis || o.axis != 'x') {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
			}

			if(!o.axis || o.axis != 'y') {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
			}

		} else {

			if(!o.axis || o.axis != 'x') {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
			}

			if(!o.axis || o.axis != 'y') {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(i, event);

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options;
		i.snapElements = [];

		$(o.snap.constructor != String ? ( o.snap.items || ':data(draggable)' ) : o.snap).each(function() {
			var $t = $(this); var $o = $t.offset();
			if(this != i.element[0]) i.snapElements.push({
				item: this,
				width: $t.outerWidth(), height: $t.outerHeight(),
				top: $o.top, left: $o.left
			});
		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options;
		var d = o.snapTolerance;

		var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (var i = inst.snapElements.length - 1; i >= 0; i--){

			var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

			//Yes, I know, this is insane ;)
			if(!((l-d < x1 && x1 < r+d && t-d < y1 && y1 < b+d) || (l-d < x1 && x1 < r+d && t-d < y2 && y2 < b+d) || (l-d < x2 && x2 < r+d && t-d < y1 && y1 < b+d) || (l-d < x2 && x2 < r+d && t-d < y2 && y2 < b+d))) {
				if(inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode != 'inner') {
				var ts = Math.abs(t - y2) <= d;
				var bs = Math.abs(b - y1) <= d;
				var ls = Math.abs(l - x2) <= d;
				var rs = Math.abs(r - x1) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
			}

			var first = (ts || bs || ls || rs);

			if(o.snapMode != 'outer') {
				var ts = Math.abs(t - y1) <= d;
				var bs = Math.abs(b - y2) <= d;
				var ls = Math.abs(l - x1) <= d;
				var rs = Math.abs(r - x2) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		};

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function(event, ui) {

		var o = $(this).data("draggable").options;

		var group = $.makeArray($(o.stack)).sort(function(a,b) {
			return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
		});
		if (!group.length) { return; }

		var min = parseInt(group[0].style.zIndex) || 0;
		$(group).each(function(i) {
			this.style.zIndex = min + i;
		});

		this[0].style.zIndex = min + group.length;

	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("draggable").options;
		if(t.css("zIndex")) o._zIndex = t.css("zIndex");
		t.css('zIndex', o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("draggable").options;
		if(o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
	}
});

})(jQuery);

/*!
 * jQuery UI Resizable 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/resizable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.resizable", $.ui.mouse, {
	version: "1.9.2",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		zIndex: 1000
	},
	_create: function() {

		var that = this, o = this.options;
		this.element.addClass("ui-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || 'ui-resizable-helper' : null
		});

		//Wrap the element if it cannot hold child nodes
		if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			//Create a wrapper element and set the wrapper to the new current internal element
			this.element.wrap(
				$('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
					position: this.element.css('position'),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css('top'),
					left: this.element.css('left')
				})
			);

			//Overwrite the original this.element
			this.element = this.element.parent().data(
				"resizable", this.element.data('resizable')
			);

			this.elementIsWrapper = true;

			//Move margins to the wrapper
			this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
			this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0});

			//Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css('resize');
			this.originalElement.css('resize', 'none');

			//Push the actual element to our proportionallyResize internal array
			this._proportionallyResizeElements.push(this.originalElement.css({ position: 'static', zoom: 1, display: 'block' }));

			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css('margin') });

			// fix handlers offset
			this._proportionallyResize();

		}

		this.handles = o.handles || (!$('.ui-resizable-handle', this.element).length ? "e,s,se" : { n: '.ui-resizable-n', e: '.ui-resizable-e', s: '.ui-resizable-s', w: '.ui-resizable-w', se: '.ui-resizable-se', sw: '.ui-resizable-sw', ne: '.ui-resizable-ne', nw: '.ui-resizable-nw' });
		if(this.handles.constructor == String) {

			if(this.handles == 'all') this.handles = 'n,e,s,w,se,sw,ne,nw';
			var n = this.handles.split(","); this.handles = {};

			for(var i = 0; i < n.length; i++) {

				var handle = $.trim(n[i]), hname = 'ui-resizable-'+handle;
				var axis = $('<div class="ui-resizable-handle ' + hname + '"></div>');

				// Apply zIndex to all handles - see #7960
				axis.css({ zIndex: o.zIndex });

				//TODO : What's going on here?
				if ('se' == handle) {
					axis.addClass('ui-icon ui-icon-gripsmall-diagonal-se');
				};

				//Insert into internal handles object and append to element
				this.handles[handle] = '.ui-resizable-'+handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			target = target || this.element;

			for(var i in this.handles) {

				if(this.handles[i].constructor == String)
					this.handles[i] = $(this.handles[i], this.element).show();

				//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					var axis = $(this.handles[i], this.element), padWrapper = 0;

					//Checking the correct pad and border
					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					//The padding type i have to apply...
					var padPos = [ 'padding',
						/ne|nw|n/.test(i) ? 'Top' :
						/se|sw|s/.test(i) ? 'Bottom' :
						/^e$/.test(i) ? 'Right' : 'Left' ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				//TODO: What's that good for? There's not anything to be executed left
				if(!$(this.handles[i]).length)
					continue;

			}
		};

		//TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $('.ui-resizable-handle', this.element)
			.disableSelection();

		//Matching axis name
		this._handles.mouseover(function() {
			if (!that.resizing) {
				if (this.className)
					var axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				//Axis, default = se
				that.axis = axis && axis[1] ? axis[1] : 'se';
			}
		});

		//If we want to auto hide the elements
		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("ui-resizable-autohide")
				.mouseenter(function() {
					if (o.disabled) return;
					$(this).removeClass("ui-resizable-autohide");
					that._handles.show();
				})
				.mouseleave(function(){
					if (o.disabled) return;
					if (!that.resizing) {
						$(this).addClass("ui-resizable-autohide");
						that._handles.hide();
					}
				});
		}

		//Initialize the mouse interaction
		this._mouseInit();

	},

	_destroy: function() {

		this._mouseDestroy();

		var _destroy = function(exp) {
			$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
				.removeData("resizable").removeData("ui-resizable").unbind(".resizable").find('.ui-resizable-handle').remove();
		};

		//TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			var wrapper = this.element;
			this.originalElement.css({
				position: wrapper.css('position'),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css('top'),
				left: wrapper.css('left')
			}).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css('resize', this.originalResizeStyle);
		_destroy(this.originalElement);

		return this;
	},

	_mouseCapture: function(event) {
		var handle = false;
		for (var i in this.handles) {
			if ($(this.handles[i])[0] == event.target) {
				handle = true;
			}
		}

		return !this.options.disabled && handle;
	},

	_mouseStart: function(event) {

		var o = this.options, iniPos = this.element.position(), el = this.element;

		this.resizing = true;
		this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

		// bugfix for http://dev.jquery.com/ticket/1749
		if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
			el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
		}

		this._renderProxy();

		var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

		var cursor = $('.ui-resizable-' + this.axis).css('cursor');
		$('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		//Increase performance, avoid regex
		var el = this.helper, o = this.options, props = {},
			that = this, smp = this.originalMousePosition, a = this.axis;

		var dx = (event.pageX-smp.left)||0, dy = (event.pageY-smp.top)||0;
		var trigger = this._change[a];
		if (!trigger) return false;

		// Calculate the attrs that will be change
		var data = trigger.apply(this, [event, dx, dy]);

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey)
			data = this._updateRatio(data, event);

		data = this._respectSize(data, event);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		el.css({
			top: this.position.top + "px", left: this.position.left + "px",
			width: this.size.width + "px", height: this.size.height + "px"
		});

		if (!this._helper && this._proportionallyResizeElements.length)
			this._proportionallyResize();

		this._updateCache(data);

		// calling the user callback at the end
		this._trigger('resize', event, this.ui());

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var o = this.options, that = this;

		if(this._helper) {
			var pr = this._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
				soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : that.sizeDiff.height,
				soffsetw = ista ? 0 : that.sizeDiff.width;

			var s = { width: (that.helper.width()  - soffsetw), height: (that.helper.height() - soffseth) },
				left = (parseInt(that.element.css('left'), 10) + (that.position.left - that.originalPosition.left)) || null,
				top = (parseInt(that.element.css('top'), 10) + (that.position.top - that.originalPosition.top)) || null;

			if (!o.animate)
				this.element.css($.extend(s, { top: top, left: left }));

			that.helper.height(that.size.height);
			that.helper.width(that.size.width);

			if (this._helper && !o.animate) this._proportionallyResize();
		}

		$('body').css('cursor', 'auto');

		this.element.removeClass("ui-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) this.helper.remove();
		return false;

	},

	_updateVirtualBoundaries: function(forceAspectRatio) {
		var o = this.options, pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b;

		b = {
			minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
			maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
			minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
			maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
		};

		if(this._aspectRatio || forceAspectRatio) {
			// We want to create an enclosing box whose aspect ration is the requested one
			// First, compute the "projected" size for each dimension based on the aspect ratio and other dimension
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if(pMinWidth > b.minWidth) b.minWidth = pMinWidth;
			if(pMinHeight > b.minHeight) b.minHeight = pMinHeight;
			if(pMaxWidth < b.maxWidth) b.maxWidth = pMaxWidth;
			if(pMaxHeight < b.maxHeight) b.maxHeight = pMaxHeight;
		}
		this._vBoundaries = b;
	},

	_updateCache: function(data) {
		var o = this.options;
		this.offset = this.helper.offset();
		if (isNumber(data.left)) this.position.left = data.left;
		if (isNumber(data.top)) this.position.top = data.top;
		if (isNumber(data.height)) this.size.height = data.height;
		if (isNumber(data.width)) this.size.width = data.width;
	},

	_updateRatio: function(data, event) {

		var o = this.options, cpos = this.position, csize = this.size, a = this.axis;

		if (isNumber(data.height)) data.width = (data.height * this.aspectRatio);
		else if (isNumber(data.width)) data.height = (data.width / this.aspectRatio);

		if (a == 'sw') {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a == 'nw') {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function(data, event) {

		var el = this.helper, o = this._vBoundaries, pRatio = this._aspectRatio || event.shiftKey, a = this.axis,
				ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
					isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height);

		if (isminw) data.width = o.minWidth;
		if (isminh) data.height = o.minHeight;
		if (ismaxw) data.width = o.maxWidth;
		if (ismaxh) data.height = o.maxHeight;

		var dw = this.originalPosition.left + this.originalSize.width, dh = this.position.top + this.size.height;
		var cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

		if (isminw && cw) data.left = dw - o.minWidth;
		if (ismaxw && cw) data.left = dw - o.maxWidth;
		if (isminh && ch)	data.top = dh - o.minHeight;
		if (ismaxh && ch)	data.top = dh - o.maxHeight;

		// fixing jump error on top/left - bug #2330
		var isNotwh = !data.width && !data.height;
		if (isNotwh && !data.left && data.top) data.top = null;
		else if (isNotwh && !data.top && data.left) data.left = null;

		return data;
	},

	_proportionallyResize: function() {

		var o = this.options;
		if (!this._proportionallyResizeElements.length) return;
		var element = this.helper || this.element;

		for (var i=0; i < this._proportionallyResizeElements.length; i++) {

			var prel = this._proportionallyResizeElements[i];

			if (!this.borderDif) {
				var b = [prel.css('borderTopWidth'), prel.css('borderRightWidth'), prel.css('borderBottomWidth'), prel.css('borderLeftWidth')],
					p = [prel.css('paddingTop'), prel.css('paddingRight'), prel.css('paddingBottom'), prel.css('paddingLeft')];

				this.borderDif = $.map(b, function(v, i) {
					var border = parseInt(v,10)||0, padding = parseInt(p[i],10)||0;
					return border + padding;
				});
			}

			prel.css({
				height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
				width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
			});

		};

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if(this._helper) {

			this.helper = this.helper || $('<div style="overflow:hidden;"></div>');

			// fix ie6 offset TODO: This seems broken
			var ie6offset = ($.ui.ie6 ? 1 : 0),
			pxyoffset = ( $.ui.ie6 ? 2 : -1 );

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() + pxyoffset,
				height: this.element.outerHeight() + pxyoffset,
				position: 'absolute',
				left: this.elementOffset.left - ie6offset +'px',
				top: this.elementOffset.top - ie6offset +'px',
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx, dy) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx, dy) {
			var o = this.options, cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var o = this.options, cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [event, this.ui()]);
		(n != "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "alsoResize", {

	start: function (event, ui) {
		var that = $(this).data("resizable"), o = that.options;

		var _store = function (exp) {
			$(exp).each(function() {
				var el = $(this);
				el.data("resizable-alsoresize", {
					width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
					left: parseInt(el.css('left'), 10), top: parseInt(el.css('top'), 10)
				});
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0]; _store(o.alsoResize); }
			else { $.each(o.alsoResize, function (exp) { _store(exp); }); }
		}else{
			_store(o.alsoResize);
		}
	},

	resize: function (event, ui) {
		var that = $(this).data("resizable"), o = that.options, os = that.originalSize, op = that.originalPosition;

		var delta = {
			height: (that.size.height - os.height) || 0, width: (that.size.width - os.width) || 0,
			top: (that.position.top - op.top) || 0, left: (that.position.left - op.left) || 0
		},

		_alsoResize = function (exp, c) {
			$(exp).each(function() {
				var el = $(this), start = $(this).data("resizable-alsoresize"), style = {},
					css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ['width', 'height'] : ['width', 'height', 'top', 'left'];

				$.each(css, function (i, prop) {
					var sum = (start[prop]||0) + (delta[prop]||0);
					if (sum && sum >= 0)
						style[prop] = sum || null;
				});

				el.css(style);
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function (exp, c) { _alsoResize(exp, c); });
		}else{
			_alsoResize(o.alsoResize);
		}
	},

	stop: function (event, ui) {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "animate", {

	stop: function(event, ui) {
		var that = $(this).data("resizable"), o = that.options;

		var pr = that._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
					soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : that.sizeDiff.height,
						soffsetw = ista ? 0 : that.sizeDiff.width;

		var style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
					left = (parseInt(that.element.css('left'), 10) + (that.position.left - that.originalPosition.left)) || null,
						top = (parseInt(that.element.css('top'), 10) + (that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css('width'), 10),
						height: parseInt(that.element.css('height'), 10),
						top: parseInt(that.element.css('top'), 10),
						left: parseInt(that.element.css('left'), 10)
					};

					if (pr && pr.length) $(pr[0]).css({ width: data.width, height: data.height });

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add("resizable", "containment", {

	start: function(event, ui) {
		var that = $(this).data("resizable"), o = that.options, el = that.element;
		var oc = o.containment,	ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
		if (!ce) return;

		that.containerElement = $(ce);

		if (/document/.test(oc) || oc == document) {
			that.containerOffset = { left: 0, top: 0 };
			that.containerPosition = { left: 0, top: 0 };

			that.parentData = {
				element: $(document), left: 0, top: 0,
				width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
			};
		}

		// i'm a node, so compute top, left, right, bottom
		else {
			var element = $(ce), p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function(i, name) { p[i] = num(element.css("padding" + name)); });

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

			var co = that.containerOffset, ch = that.containerSize.height,	cw = that.containerSize.width,
						width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw ), height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);

			that.parentData = {
				element: ce, left: co.left, top: co.top, width: width, height: height
			};
		}
	},

	resize: function(event, ui) {
		var that = $(this).data("resizable"), o = that.options,
				ps = that.containerSize, co = that.containerOffset, cs = that.size, cp = that.position,
				pRatio = that._aspectRatio || event.shiftKey, cop = { top:0, left:0 }, ce = that.containerElement;

		if (ce[0] != document && (/static/).test(ce.css('position'))) cop = co;

		if (cp.left < (that._helper ? co.left : 0)) {
			that.size.width = that.size.width + (that._helper ? (that.position.left - co.left) : (that.position.left - cop.left));
			if (pRatio) that.size.height = that.size.width / that.aspectRatio;
			that.position.left = o.helper ? co.left : 0;
		}

		if (cp.top < (that._helper ? co.top : 0)) {
			that.size.height = that.size.height + (that._helper ? (that.position.top - co.top) : that.position.top);
			if (pRatio) that.size.width = that.size.height * that.aspectRatio;
			that.position.top = that._helper ? co.top : 0;
		}

		that.offset.left = that.parentData.left+that.position.left;
		that.offset.top = that.parentData.top+that.position.top;

		var woset = Math.abs( (that._helper ? that.offset.left - cop.left : (that.offset.left - cop.left)) + that.sizeDiff.width ),
					hoset = Math.abs( (that._helper ? that.offset.top - cop.top : (that.offset.top - co.top)) + that.sizeDiff.height );

		var isParent = that.containerElement.get(0) == that.element.parent().get(0),
			isOffsetRelative = /relative|absolute/.test(that.containerElement.css('position'));

		if(isParent && isOffsetRelative) woset -= that.parentData.left;

		if (woset + that.size.width >= that.parentData.width) {
			that.size.width = that.parentData.width - woset;
			if (pRatio) that.size.height = that.size.width / that.aspectRatio;
		}

		if (hoset + that.size.height >= that.parentData.height) {
			that.size.height = that.parentData.height - hoset;
			if (pRatio) that.size.width = that.size.height * that.aspectRatio;
		}
	},

	stop: function(event, ui){
		var that = $(this).data("resizable"), o = that.options, cp = that.position,
				co = that.containerOffset, cop = that.containerPosition, ce = that.containerElement;

		var helper = $(that.helper), ho = helper.offset(), w = helper.outerWidth() - that.sizeDiff.width, h = helper.outerHeight() - that.sizeDiff.height;

		if (that._helper && !o.animate && (/relative/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

		if (that._helper && !o.animate && (/static/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function(event, ui) {

		var that = $(this).data("resizable"), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({ opacity: .25, display: 'block', position: 'relative', height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass('ui-resizable-ghost')
			.addClass(typeof o.ghost == 'string' ? o.ghost : '');

		that.ghost.appendTo(that.helper);

	},

	resize: function(event, ui){
		var that = $(this).data("resizable"), o = that.options;
		if (that.ghost) that.ghost.css({ position: 'relative', height: that.size.height, width: that.size.width });
	},

	stop: function(event, ui){
		var that = $(this).data("resizable"), o = that.options;
		if (that.ghost && that.helper) that.helper.get(0).removeChild(that.ghost.get(0));
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function(event, ui) {
		var that = $(this).data("resizable"), o = that.options, cs = that.size, os = that.originalSize, op = that.originalPosition, a = that.axis, ratio = o._aspectRatio || event.shiftKey;
		o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
		var ox = Math.round((cs.width - os.width) / (o.grid[0]||1)) * (o.grid[0]||1), oy = Math.round((cs.height - os.height) / (o.grid[1]||1)) * (o.grid[1]||1);

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = os.width + ox;
			that.size.height = os.height + oy;
		}
		else if (/^(ne)$/.test(a)) {
			that.size.width = os.width + ox;
			that.size.height = os.height + oy;
			that.position.top = op.top - oy;
		}
		else if (/^(sw)$/.test(a)) {
			that.size.width = os.width + ox;
			that.size.height = os.height + oy;
			that.position.left = op.left - ox;
		}
		else {
			that.size.width = os.width + ox;
			that.size.height = os.height + oy;
			that.position.top = op.top - oy;
			that.position.left = op.left - ox;
		}
	}

});

var num = function(v) {
	return parseInt(v, 10) || 0;
};

var isNumber = function(value) {
	return !isNaN(parseInt(value, 10));
};

})(jQuery);

/*!
 * jQuery UI Button 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/button/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var lastActive, startXPos, startYPos, clickDragged,
	baseClasses = "ui-button ui-widget ui-state-default ui-corner-all",
	stateClasses = "ui-state-hover ui-state-active ",
	typeClasses = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",
	formResetHandler = function() {
		var buttons = $( this ).find( ":ui-button" );
		setTimeout(function() {
			buttons.button( "refresh" );
		}, 1 );
	},
	radioGroup = function( radio ) {
		var name = radio.name,
			form = radio.form,
			radios = $( [] );
		if ( name ) {
			if ( form ) {
				radios = $( form ).find( "[name='" + name + "']" );
			} else {
				radios = $( "[name='" + name + "']", radio.ownerDocument )
					.filter(function() {
						return !this.form;
					});
			}
		}
		return radios;
	};

$.widget( "ui.button", {
	version: "1.9.2",
	defaultElement: "<button>",
	options: {
		disabled: null,
		text: true,
		label: null,
		icons: {
			primary: null,
			secondary: null
		}
	},
	_create: function() {
		this.element.closest( "form" )
			.unbind( "reset" + this.eventNamespace )
			.bind( "reset" + this.eventNamespace, formResetHandler );

		if ( typeof this.options.disabled !== "boolean" ) {
			this.options.disabled = !!this.element.prop( "disabled" );
		} else {
			this.element.prop( "disabled", this.options.disabled );
		}

		this._determineButtonType();
		this.hasTitle = !!this.buttonElement.attr( "title" );

		var that = this,
			options = this.options,
			toggleButton = this.type === "checkbox" || this.type === "radio",
			activeClass = !toggleButton ? "ui-state-active" : "",
			focusClass = "ui-state-focus";

		if ( options.label === null ) {
			options.label = (this.type === "input" ? this.buttonElement.val() : this.buttonElement.html());
		}

		this._hoverable( this.buttonElement );

		this.buttonElement
			.addClass( baseClasses )
			.attr( "role", "button" )
			.bind( "mouseenter" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				if ( this === lastActive ) {
					$( this ).addClass( "ui-state-active" );
				}
			})
			.bind( "mouseleave" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				$( this ).removeClass( activeClass );
			})
			.bind( "click" + this.eventNamespace, function( event ) {
				if ( options.disabled ) {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			});

		this.element
			.bind( "focus" + this.eventNamespace, function() {
				// no need to check disabled, focus won't be triggered anyway
				that.buttonElement.addClass( focusClass );
			})
			.bind( "blur" + this.eventNamespace, function() {
				that.buttonElement.removeClass( focusClass );
			});

		if ( toggleButton ) {
			this.element.bind( "change" + this.eventNamespace, function() {
				if ( clickDragged ) {
					return;
				}
				that.refresh();
			});
			// if mouse moves between mousedown and mouseup (drag) set clickDragged flag
			// prevents issue where button state changes but checkbox/radio checked state
			// does not in Firefox (see ticket #6970)
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function( event ) {
					if ( options.disabled ) {
						return;
					}
					clickDragged = false;
					startXPos = event.pageX;
					startYPos = event.pageY;
				})
				.bind( "mouseup" + this.eventNamespace, function( event ) {
					if ( options.disabled ) {
						return;
					}
					if ( startXPos !== event.pageX || startYPos !== event.pageY ) {
						clickDragged = true;
					}
			});
		}

		if ( this.type === "checkbox" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled || clickDragged ) {
					return false;
				}
				$( this ).toggleClass( "ui-state-active" );
				that.buttonElement.attr( "aria-pressed", that.element[0].checked );
			});
		} else if ( this.type === "radio" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled || clickDragged ) {
					return false;
				}
				$( this ).addClass( "ui-state-active" );
				that.buttonElement.attr( "aria-pressed", "true" );

				var radio = that.element[ 0 ];
				radioGroup( radio )
					.not( radio )
					.map(function() {
						return $( this ).button( "widget" )[ 0 ];
					})
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			});
		} else {
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).addClass( "ui-state-active" );
					lastActive = this;
					that.document.one( "mouseup", function() {
						lastActive = null;
					});
				})
				.bind( "mouseup" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).removeClass( "ui-state-active" );
				})
				.bind( "keydown" + this.eventNamespace, function(event) {
					if ( options.disabled ) {
						return false;
					}
					if ( event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER ) {
						$( this ).addClass( "ui-state-active" );
					}
				})
				.bind( "keyup" + this.eventNamespace, function() {
					$( this ).removeClass( "ui-state-active" );
				});

			if ( this.buttonElement.is("a") ) {
				this.buttonElement.keyup(function(event) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						// TODO pass through original event correctly (just as 2nd argument doesn't work)
						$( this ).click();
					}
				});
			}
		}

		// TODO: pull out $.Widget's handling for the disabled option into
		// $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
		// be overridden by individual plugins
		this._setOption( "disabled", options.disabled );
		this._resetButton();
	},

	_determineButtonType: function() {
		var ancestor, labelSelector, checked;

		if ( this.element.is("[type=checkbox]") ) {
			this.type = "checkbox";
		} else if ( this.element.is("[type=radio]") ) {
			this.type = "radio";
		} else if ( this.element.is("input") ) {
			this.type = "input";
		} else {
			this.type = "button";
		}

		if ( this.type === "checkbox" || this.type === "radio" ) {
			// we don't search against the document in case the element
			// is disconnected from the DOM
			ancestor = this.element.parents().last();
			labelSelector = "label[for='" + this.element.attr("id") + "']";
			this.buttonElement = ancestor.find( labelSelector );
			if ( !this.buttonElement.length ) {
				ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
				this.buttonElement = ancestor.filter( labelSelector );
				if ( !this.buttonElement.length ) {
					this.buttonElement = ancestor.find( labelSelector );
				}
			}
			this.element.addClass( "ui-helper-hidden-accessible" );

			checked = this.element.is( ":checked" );
			if ( checked ) {
				this.buttonElement.addClass( "ui-state-active" );
			}
			this.buttonElement.prop( "aria-pressed", checked );
		} else {
			this.buttonElement = this.element;
		}
	},

	widget: function() {
		return this.buttonElement;
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-helper-hidden-accessible" );
		this.buttonElement
			.removeClass( baseClasses + " " + stateClasses + " " + typeClasses )
			.removeAttr( "role" )
			.removeAttr( "aria-pressed" )
			.html( this.buttonElement.find(".ui-button-text").html() );

		if ( !this.hasTitle ) {
			this.buttonElement.removeAttr( "title" );
		}
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "disabled" ) {
			if ( value ) {
				this.element.prop( "disabled", true );
			} else {
				this.element.prop( "disabled", false );
			}
			return;
		}
		this._resetButton();
	},

	refresh: function() {
		//See #8237 & #8828
		var isDisabled = this.element.is( "input, button" ) ? this.element.is( ":disabled" ) : this.element.hasClass( "ui-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOption( "disabled", isDisabled );
		}
		if ( this.type === "radio" ) {
			radioGroup( this.element[0] ).each(function() {
				if ( $( this ).is( ":checked" ) ) {
					$( this ).button( "widget" )
						.addClass( "ui-state-active" )
						.attr( "aria-pressed", "true" );
				} else {
					$( this ).button( "widget" )
						.removeClass( "ui-state-active" )
						.attr( "aria-pressed", "false" );
				}
			});
		} else if ( this.type === "checkbox" ) {
			if ( this.element.is( ":checked" ) ) {
				this.buttonElement
					.addClass( "ui-state-active" )
					.attr( "aria-pressed", "true" );
			} else {
				this.buttonElement
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			}
		}
	},

	_resetButton: function() {
		if ( this.type === "input" ) {
			if ( this.options.label ) {
				this.element.val( this.options.label );
			}
			return;
		}
		var buttonElement = this.buttonElement.removeClass( typeClasses ),
			buttonText = $( "<span></span>", this.document[0] )
				.addClass( "ui-button-text" )
				.html( this.options.label )
				.appendTo( buttonElement.empty() )
				.text(),
			icons = this.options.icons,
			multipleIcons = icons.primary && icons.secondary,
			buttonClasses = [];

		if ( icons.primary || icons.secondary ) {
			if ( this.options.text ) {
				buttonClasses.push( "ui-button-text-icon" + ( multipleIcons ? "s" : ( icons.primary ? "-primary" : "-secondary" ) ) );
			}

			if ( icons.primary ) {
				buttonElement.prepend( "<span class='ui-button-icon-primary ui-icon " + icons.primary + "'></span>" );
			}

			if ( icons.secondary ) {
				buttonElement.append( "<span class='ui-button-icon-secondary ui-icon " + icons.secondary + "'></span>" );
			}

			if ( !this.options.text ) {
				buttonClasses.push( multipleIcons ? "ui-button-icons-only" : "ui-button-icon-only" );

				if ( !this.hasTitle ) {
					buttonElement.attr( "title", $.trim( buttonText ) );
				}
			}
		} else {
			buttonClasses.push( "ui-button-text-only" );
		}
		buttonElement.addClass( buttonClasses.join( " " ) );
	}
});

$.widget( "ui.buttonset", {
	version: "1.9.2",
	options: {
		items: "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(button)"
	},

	_create: function() {
		this.element.addClass( "ui-buttonset" );
	},

	_init: function() {
		this.refresh();
	},

	_setOption: function( key, value ) {
		if ( key === "disabled" ) {
			this.buttons.button( "option", key, value );
		}

		this._super( key, value );
	},

	refresh: function() {
		var rtl = this.element.css( "direction" ) === "rtl";

		this.buttons = this.element.find( this.options.items )
			.filter( ":ui-button" )
				.button( "refresh" )
			.end()
			.not( ":ui-button" )
				.button()
			.end()
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-all ui-corner-left ui-corner-right" )
				.filter( ":first" )
					.addClass( rtl ? "ui-corner-right" : "ui-corner-left" )
				.end()
				.filter( ":last" )
					.addClass( rtl ? "ui-corner-left" : "ui-corner-right" )
				.end()
			.end();
	},

	_destroy: function() {
		this.element.removeClass( "ui-buttonset" );
		this.buttons
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-left ui-corner-right" )
			.end()
			.button( "destroy" );
	}
});

}( jQuery ) );

/*!
 * jQuery UI Dialog 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
(function( $, undefined ) {

var uiDialogClasses = "ui-dialog ui-widget ui-widget-content ui-corner-all ",
	sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	};

$.widget("ui.dialog", {
	version: "1.9.2",
	options: {
		autoOpen: true,
		buttons: {},
		closeOnEscape: true,
		closeText: "close",
		dialogClass: "",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: false,
		maxWidth: false,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			// ensure that the titlebar is never outside the document
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		stack: true,
		title: "",
		width: 300,
		zIndex: 1000
	},

	_create: function() {
		this.originalTitle = this.element.attr( "title" );
		// #5742 - .attr() might return a DOMElement
		if ( typeof this.originalTitle !== "string" ) {
			this.originalTitle = "";
		}
		this.oldPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.options.title = this.options.title || this.originalTitle;
		var that = this,
			options = this.options,

			title = options.title || "&#160;",
			uiDialog,
			uiDialogTitlebar,
			uiDialogTitlebarClose,
			uiDialogTitle,
			uiDialogButtonPane;

			uiDialog = ( this.uiDialog = $( "<div>" ) )
				.addClass( uiDialogClasses + options.dialogClass )
				.css({
					display: "none",
					outline: 0, // TODO: move to stylesheet
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				.attr( "tabIndex", -1)
				.keydown(function( event ) {
					if ( options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
							event.keyCode === $.ui.keyCode.ESCAPE ) {
						that.close( event );
						event.preventDefault();
					}
				})
				.mousedown(function( event ) {
					that.moveToTop( false, event );
				})
				.appendTo( "body" );

			this.element
				.show()
				.removeAttr( "title" )
				.addClass( "ui-dialog-content ui-widget-content" )
				.appendTo( uiDialog );

			uiDialogTitlebar = ( this.uiDialogTitlebar = $( "<div>" ) )
				.addClass( "ui-dialog-titlebar  ui-widget-header  " +
					"ui-corner-all  ui-helper-clearfix" )
				.bind( "mousedown", function() {
					// Dialog isn't getting focus when dragging (#8063)
					uiDialog.focus();
				})
				.prependTo( uiDialog );

			uiDialogTitlebarClose = $( "<a href='#'></a>" )
				.addClass( "ui-dialog-titlebar-close  ui-corner-all" )
				.attr( "role", "button" )
				.click(function( event ) {
					event.preventDefault();
					that.close( event );
				})
				.appendTo( uiDialogTitlebar );

			( this.uiDialogTitlebarCloseText = $( "<span>" ) )
				.addClass( "ui-icon ui-icon-closethick" )
				.text( options.closeText )
				.appendTo( uiDialogTitlebarClose );

			uiDialogTitle = $( "<span>" )
				.uniqueId()
				.addClass( "ui-dialog-title" )
				.html( title )
				.prependTo( uiDialogTitlebar );

			uiDialogButtonPane = ( this.uiDialogButtonPane = $( "<div>" ) )
				.addClass( "ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" );

			( this.uiButtonSet = $( "<div>" ) )
				.addClass( "ui-dialog-buttonset" )
				.appendTo( uiDialogButtonPane );

		uiDialog.attr({
			role: "dialog",
			"aria-labelledby": uiDialogTitle.attr( "id" )
		});

		uiDialogTitlebar.find( "*" ).add( uiDialogTitlebar ).disableSelection();
		this._hoverable( uiDialogTitlebarClose );
		this._focusable( uiDialogTitlebarClose );

		if ( options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._createButtons( options.buttons );
		this._isOpen = false;

		if ( $.fn.bgiframe ) {
			uiDialog.bgiframe();
		}

		// prevent tabbing out of modal dialogs
		this._on( uiDialog, { keydown: function( event ) {
			if ( !options.modal || event.keyCode !== $.ui.keyCode.TAB ) {
				return;
			}

			var tabbables = $( ":tabbable", uiDialog ),
				first = tabbables.filter( ":first" ),
				last  = tabbables.filter( ":last" );

			if ( event.target === last[0] && !event.shiftKey ) {
				first.focus( 1 );
				return false;
			} else if ( event.target === first[0] && event.shiftKey ) {
				last.focus( 1 );
				return false;
			}
		}});
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_destroy: function() {
		var next,
			oldPosition = this.oldPosition;

		if ( this.overlay ) {
			this.overlay.destroy();
		}
		this.uiDialog.hide();
		this.element
			.removeClass( "ui-dialog-content ui-widget-content" )
			.hide()
			.appendTo( "body" );
		this.uiDialog.remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = oldPosition.parent.children().eq( oldPosition.index );
		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			oldPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	close: function( event ) {
		var that = this,
			maxZ, thisZ;

		if ( !this._isOpen ) {
			return;
		}

		if ( false === this._trigger( "beforeClose", event ) ) {
			return;
		}

		this._isOpen = false;

		if ( this.overlay ) {
			this.overlay.destroy();
		}

		if ( this.options.hide ) {
			this._hide( this.uiDialog, this.options.hide, function() {
				that._trigger( "close", event );
			});
		} else {
			this.uiDialog.hide();
			this._trigger( "close", event );
		}

		$.ui.dialog.overlay.resize();

		// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
		if ( this.options.modal ) {
			maxZ = 0;
			$( ".ui-dialog" ).each(function() {
				if ( this !== that.uiDialog[0] ) {
					thisZ = $( this ).css( "z-index" );
					if ( !isNaN( thisZ ) ) {
						maxZ = Math.max( maxZ, thisZ );
					}
				}
			});
			$.ui.dialog.maxZ = maxZ;
		}

		return this;
	},

	isOpen: function() {
		return this._isOpen;
	},

	// the force parameter allows us to move modal dialogs to their correct
	// position on open
	moveToTop: function( force, event ) {
		var options = this.options,
			saveScroll;

		if ( ( options.modal && !force ) ||
				( !options.stack && !options.modal ) ) {
			return this._trigger( "focus", event );
		}

		if ( options.zIndex > $.ui.dialog.maxZ ) {
			$.ui.dialog.maxZ = options.zIndex;
		}
		if ( this.overlay ) {
			$.ui.dialog.maxZ += 1;
			$.ui.dialog.overlay.maxZ = $.ui.dialog.maxZ;
			this.overlay.$el.css( "z-index", $.ui.dialog.overlay.maxZ );
		}

		// Save and then restore scroll
		// Opera 9.5+ resets when parent z-index is changed.
		// http://bugs.jqueryui.com/ticket/3193
		saveScroll = {
			scrollTop: this.element.scrollTop(),
			scrollLeft: this.element.scrollLeft()
		};
		$.ui.dialog.maxZ += 1;
		this.uiDialog.css( "z-index", $.ui.dialog.maxZ );
		this.element.attr( saveScroll );
		this._trigger( "focus", event );

		return this;
	},

	open: function() {
		if ( this._isOpen ) {
			return;
		}

		var hasFocus,
			options = this.options,
			uiDialog = this.uiDialog;

		this._size();
		this._position( options.position );
		uiDialog.show( options.show );
		this.overlay = options.modal ? new $.ui.dialog.overlay( this ) : null;
		this.moveToTop( true );

		// set focus to the first tabbable element in the content area or the first button
		// if there are no tabbable elements, set focus on the dialog itself
		hasFocus = this.element.find( ":tabbable" );
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
			if ( !hasFocus.length ) {
				hasFocus = uiDialog;
			}
		}
		hasFocus.eq( 0 ).focus();

		this._isOpen = true;
		this._trigger( "open" );

		return this;
	},

	_createButtons: function( buttons ) {
		var that = this,
			hasButtons = false;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( typeof buttons === "object" && buttons !== null ) {
			$.each( buttons, function() {
				return !(hasButtons = true);
			});
		}
		if ( hasButtons ) {
			$.each( buttons, function( name, props ) {
				var button, click;
				props = $.isFunction( props ) ?
					{ click: props, text: name } :
					props;
				// Default to a non-submitting button
				props = $.extend( { type: "button" }, props );
				// Change the context for the click callback to be the main element
				click = props.click;
				props.click = function() {
					click.apply( that.element[0], arguments );
				};
				button = $( "<button></button>", props )
					.appendTo( that.uiButtonSet );
				if ( $.fn.button ) {
					button.button();
				}
			});
			this.uiDialog.addClass( "ui-dialog-buttons" );
			this.uiDialogButtonPane.appendTo( this.uiDialog );
		} else {
			this.uiDialog.removeClass( "ui-dialog-buttons" );
		}
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this )
					.addClass( "ui-dialog-dragging" );
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				options.position = [
					ui.position.left - that.document.scrollLeft(),
					ui.position.top - that.document.scrollTop()
				];
				$( this )
					.removeClass( "ui-dialog-dragging" );
				that._trigger( "dragStop", event, filteredUi( ui ) );
				$.ui.dialog.overlay.resize();
			}
		});
	},

	_makeResizable: function( handles ) {
		handles = (handles === undefined ? this.options.resizable : handles);
		var that = this,
			options = this.options,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css( "position" ),
			resizeHandles = typeof handles === 'string' ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-resizing" );
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				$( this ).removeClass( "ui-dialog-resizing" );
				options.height = $( this ).height();
				options.width = $( this ).width();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
				$.ui.dialog.overlay.resize();
			}
		})
		.css( "position", position )
		.find( ".ui-resizable-se" )
			.addClass( "ui-icon ui-icon-grip-diagonal-se" );
	},

	_minHeight: function() {
		var options = this.options;

		if ( options.height === "auto" ) {
			return options.minHeight;
		} else {
			return Math.min( options.minHeight, options.height );
		}
	},

	_position: function( position ) {
		var myAt = [],
			offset = [ 0, 0 ],
			isVisible;

		if ( position ) {
			// deep extending converts arrays to objects in jQuery <= 1.3.2 :-(
	//		if (typeof position == 'string' || $.isArray(position)) {
	//			myAt = $.isArray(position) ? position : position.split(' ');

			if ( typeof position === "string" || (typeof position === "object" && "0" in position ) ) {
				myAt = position.split ? position.split( " " ) : [ position[ 0 ], position[ 1 ] ];
				if ( myAt.length === 1 ) {
					myAt[ 1 ] = myAt[ 0 ];
				}

				$.each( [ "left", "top" ], function( i, offsetPosition ) {
					if ( +myAt[ i ] === myAt[ i ] ) {
						offset[ i ] = myAt[ i ];
						myAt[ i ] = offsetPosition;
					}
				});

				position = {
					my: myAt[0] + (offset[0] < 0 ? offset[0] : "+" + offset[0]) + " " +
						myAt[1] + (offset[1] < 0 ? offset[1] : "+" + offset[1]),
					at: myAt.join( " " )
				};
			}

			position = $.extend( {}, $.ui.dialog.prototype.options.position, position );
		} else {
			position = $.ui.dialog.prototype.options.position;
		}

		// need to show the dialog to get the actual offset in the position plugin
		isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resizableOptions = {},
			resize = false;

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
		}
		if ( this.uiDialog.is( ":data(resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		switch ( key ) {
			case "buttons":
				this._createButtons( value );
				break;
			case "closeText":
				// ensure that we always pass a string
				this.uiDialogTitlebarCloseText.text( "" + value );
				break;
			case "dialogClass":
				uiDialog
					.removeClass( this.options.dialogClass )
					.addClass( uiDialogClasses + value );
				break;
			case "disabled":
				if ( value ) {
					uiDialog.addClass( "ui-dialog-disabled" );
				} else {
					uiDialog.removeClass( "ui-dialog-disabled" );
				}
				break;
			case "draggable":
				isDraggable = uiDialog.is( ":data(draggable)" );
				if ( isDraggable && !value ) {
					uiDialog.draggable( "destroy" );
				}

				if ( !isDraggable && value ) {
					this._makeDraggable();
				}
				break;
			case "position":
				this._position( value );
				break;
			case "resizable":
				// currently resizable, becoming non-resizable
				isResizable = uiDialog.is( ":data(resizable)" );
				if ( isResizable && !value ) {
					uiDialog.resizable( "destroy" );
				}

				// currently resizable, changing handles
				if ( isResizable && typeof value === "string" ) {
					uiDialog.resizable( "option", "handles", value );
				}

				// currently non-resizable, becoming resizable
				if ( !isResizable && value !== false ) {
					this._makeResizable( value );
				}
				break;
			case "title":
				// convert whatever was passed in o a string, for html() to not throw up
				$( ".ui-dialog-title", this.uiDialogTitlebar )
					.html( "" + ( value || "&#160;" ) );
				break;
		}

		this._super( key, value );
	},

	_size: function() {
		/* If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		 * divs will both have width and height set, so we need to reset them
		 */
		var nonContentHeight, minContentHeight, autoHeight,
			options = this.options,
			isVisible = this.uiDialog.is( ":visible" );

		// reset content sizing
		this.element.show().css({
			width: "auto",
			minHeight: 0,
			height: 0
		});

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );

		if ( options.height === "auto" ) {
			// only needed for IE6 support
			if ( $.support.minHeight ) {
				this.element.css({
					minHeight: minContentHeight,
					height: "auto"
				});
			} else {
				this.uiDialog.show();
				autoHeight = this.element.css( "height", "auto" ).height();
				if ( !isVisible ) {
					this.uiDialog.hide();
				}
				this.element.height( Math.max( autoHeight, minContentHeight ) );
			}
		} else {
			this.element.height( Math.max( options.height - nonContentHeight, 0 ) );
		}

		if (this.uiDialog.is( ":data(resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	}
});

$.extend($.ui.dialog, {
	uuid: 0,
	maxZ: 0,

	getTitleId: function($el) {
		var id = $el.attr( "id" );
		if ( !id ) {
			this.uuid += 1;
			id = this.uuid;
		}
		return "ui-dialog-title-" + id;
	},

	overlay: function( dialog ) {
		this.$el = $.ui.dialog.overlay.create( dialog );
	}
});

$.extend( $.ui.dialog.overlay, {
	instances: [],
	// reuse old instances due to IE memory leak with alpha transparency (see #5185)
	oldInstances: [],
	maxZ: 0,
	events: $.map(
		"focus,mousedown,mouseup,keydown,keypress,click".split( "," ),
		function( event ) {
			return event + ".dialog-overlay";
		}
	).join( " " ),
	create: function( dialog ) {
		if ( this.instances.length === 0 ) {
			// prevent use of anchors and inputs
			// we use a setTimeout in case the overlay is created from an
			// event that we're going to be cancelling (see #2804)
			setTimeout(function() {
				// handle $(el).dialog().dialog('close') (see #4065)
				if ( $.ui.dialog.overlay.instances.length ) {
					$( document ).bind( $.ui.dialog.overlay.events, function( event ) {
						// stop events if the z-index of the target is < the z-index of the overlay
						// we cannot return true when we don't want to cancel the event (#3523)
						if ( $( event.target ).zIndex() < $.ui.dialog.overlay.maxZ ) {
							return false;
						}
					});
				}
			}, 1 );

			// handle window resize
			$( window ).bind( "resize.dialog-overlay", $.ui.dialog.overlay.resize );
		}

		var $el = ( this.oldInstances.pop() || $( "<div>" ).addClass( "ui-widget-overlay" ) );

		// allow closing by pressing the escape key
		$( document ).bind( "keydown.dialog-overlay", function( event ) {
			var instances = $.ui.dialog.overlay.instances;
			// only react to the event if we're the top overlay
			if ( instances.length !== 0 && instances[ instances.length - 1 ] === $el &&
				dialog.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
				event.keyCode === $.ui.keyCode.ESCAPE ) {

				dialog.close( event );
				event.preventDefault();
			}
		});

		$el.appendTo( document.body ).css({
			width: this.width(),
			height: this.height()
		});

		if ( $.fn.bgiframe ) {
			$el.bgiframe();
		}

		this.instances.push( $el );
		return $el;
	},

	destroy: function( $el ) {
		var indexOf = $.inArray( $el, this.instances ),
			maxZ = 0;

		if ( indexOf !== -1 ) {
			this.oldInstances.push( this.instances.splice( indexOf, 1 )[ 0 ] );
		}

		if ( this.instances.length === 0 ) {
			$( [ document, window ] ).unbind( ".dialog-overlay" );
		}

		$el.height( 0 ).width( 0 ).remove();

		// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
		$.each( this.instances, function() {
			maxZ = Math.max( maxZ, this.css( "z-index" ) );
		});
		this.maxZ = maxZ;
	},

	height: function() {
		var scrollHeight,
			offsetHeight;
		// handle IE
		if ( $.ui.ie ) {
			scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);

			if ( scrollHeight < offsetHeight ) {
				return $( window ).height() + "px";
			} else {
				return scrollHeight + "px";
			}
		// handle "good" browsers
		} else {
			return $( document ).height() + "px";
		}
	},

	width: function() {
		var scrollWidth,
			offsetWidth;
		// handle IE
		if ( $.ui.ie ) {
			scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);

			if ( scrollWidth < offsetWidth ) {
				return $( window ).width() + "px";
			} else {
				return scrollWidth + "px";
			}
		// handle "good" browsers
		} else {
			return $( document ).width() + "px";
		}
	},

	resize: function() {
		/* If the dialog is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the overlay. If the user then drags the
		 * dialog back to the left, the document will become narrower,
		 * so we need to shrink the overlay to the appropriate size.
		 * This is handled by shrinking the overlay before setting it
		 * to the full document size.
		 */
		var $overlays = $( [] );
		$.each( $.ui.dialog.overlay.instances, function() {
			$overlays = $overlays.add( this );
		});

		$overlays.css({
			width: 0,
			height: 0
		}).css({
			width: $.ui.dialog.overlay.width(),
			height: $.ui.dialog.overlay.height()
		});
	}
});

$.extend( $.ui.dialog.overlay.prototype, {
	destroy: function() {
		$.ui.dialog.overlay.destroy( this.$el );
	}
});

}( jQuery ) );

;(function($, undefined) {
/*
 * jQuery UI dialogOptions v1.0
 * @desc extending jQuery Ui Dialog - Responsive, click outside, class handling
 * @author Jason Day
 *
 * Dependencies:
 *		jQuery: http://jquery.com/
 *		jQuery UI: http://jqueryui.com/
 *		Modernizr: http://modernizr.com/
 *
 * MIT license:
 *              http://www.opensource.org/licenses/mit-license.php
 *
 * (c) Jason Day 2014
 *
 * New Options:
 *  clickOut: true          // closes dialog when clicked outside
 *  responsive: true        // fluid width & height based on viewport
 *                          // true: always responsive
 *                          // false: never responsive
 *                          // "touch": only responsive on touch device
 *  scaleH: 0.8             // responsive scale height percentage, 0.8 = 80% of viewport
 *  scaleW: 0.8             // responsive scale width percentage, 0.8 = 80% of viewport
 *  showTitleBar: true      // false: hide titlebar
 *  showCloseButton: true   // false: hide close button
 *
 * Added functionality:
 *  add & remove dialogClass to .ui-widget-overlay for scoping styles
 *	patch for: http://bugs.jqueryui.com/ticket/4671
 *	recenter dialog - ajax loaded content
 */

// add new options with default values
$.ui.dialog.prototype.options.clickOut = true;
$.ui.dialog.prototype.options.responsive = true;
$.ui.dialog.prototype.options.scaleH = 0.8;
$.ui.dialog.prototype.options.scaleW = 0.8;
$.ui.dialog.prototype.options.showTitleBar = true;
$.ui.dialog.prototype.options.showCloseButton = true;


// extend _init
var _init = $.ui.dialog.prototype._init;
$.ui.dialog.prototype._init = function () {
    var self = this;

    // apply original arguments
    _init.apply(this, arguments);

    //patch
    if ($.ui && $.ui.dialog && $.ui.dialog.overlay) {
        $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function (event) {
           return event + '.dialog-overlay';
       }).join(' ');
    }
};
// end _init


// extend open function
var _open = $.ui.dialog.prototype.open;
$.ui.dialog.prototype.open = function () {
    var self = this;

    // apply original arguments
    _open.apply(this, arguments);

    // get dialog original size on open
    var oHeight = self.element.parent().outerHeight(),
        oWidth = self.element.parent().outerWidth(),
        isTouch = $("html").hasClass("touch");

    // responsive width & height
    var resize = function () {

        // check if responsive
        // dependent on modernizr for device detection / html.touch
        if (self.options.responsive === true || (self.options.responsive === "touch" && isTouch)) {
            var elem = self.element,
                wHeight = $(window).height(),
                wWidth = $(window).width(),
                dHeight = elem.parent().outerHeight(),
                dWidth = elem.parent().outerWidth(),
                setHeight = Math.min(wHeight * self.options.scaleH, oHeight),
                setWidth = Math.min(wWidth * self.options.scaleW, oWidth);

            // check & set height
            if ((oHeight + 100) > wHeight || elem.hasClass("resizedH")) {
                elem.dialog("option", "height", setHeight).parent().css("max-height", setHeight);
                elem.addClass("resizedH");
            }

            // check & set width
            if ((oWidth + 100) > wWidth || elem.hasClass("resizedW")) {
                elem.dialog("option", "width", setWidth).parent().css("max-width", setWidth);
                elem.addClass("resizedW");
            }

            // only recenter & add overflow if dialog has been resized
            if (elem.hasClass("resizedH") || elem.hasClass("resizedW")) {
                elem.dialog("option", "position", "center");
                elem.css("overflow", "auto");
            }
        }

        // add webkit scrolling to all dialogs for touch devices
        if (isTouch) {
            elem.css("-webkit-overflow-scrolling", "touch");
        }
    };

    // call resize()
    resize();

    // resize on window resize
    $(window).on("resize", function () {
        resize();
    });

    // resize on orientation change
     if (window.addEventListener) {  // Add extra condition because IE8 doesn't support addEventListener (or orientationchange)
        window.addEventListener("orientationchange", function () {
            resize();
        });
    }

    // hide titlebar
    if (!self.options.showTitleBar) {
        self.uiDialogTitlebar.css({
            "height": 0,
            "padding": 0,
            "background": "none",
            "border": 0
        });
        self.uiDialogTitlebar.find(".ui-dialog-title").css("display", "none");
    }

    //hide close button
    if (!self.options.showCloseButton) {
        self.uiDialogTitlebar.find(".ui-dialog-titlebar-close").css("display", "none");
    }

    // close on clickOut
    if (self.options.clickOut && !self.options.modal) {
        // use transparent div - simplest approach (rework)
        $('<div id="dialog-overlay"></div>').insertBefore(self.element.parent());
        $('#dialog-overlay').css({
            "position": "fixed",
            "top": 0,
            "right": 0,
            "bottom": 0,
            "left": 0,
            "background-color": "transparent"
        });
        $('#dialog-overlay').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.close();
        });
        // else close on modal click
    } else if (self.options.clickOut && self.options.modal) {
        $('.ui-widget-overlay').click(function (e) {
            self.close();
        });
    }

    // add dialogClass to overlay
    if (self.options.dialogClass) {
        $('.ui-widget-overlay').addClass(self.options.dialogClass);
    }
};
//end open


// extend close function
var _close = $.ui.dialog.prototype.close;
$.ui.dialog.prototype.close = function () {
    var self = this;
    // apply original arguments
    _close.apply(this, arguments);

    // remove dialogClass to overlay
    if (self.options.dialogClass) {
        $('.ui-widget-overlay').removeClass(self.options.dialogClass);
    }
    //remove clickOut overlay
    if ($("#dialog-overlay").length) {
        $("#dialog-overlay").remove();
    }
};
//end close

})(jQuery);
;(function(undefined) {
/*
#
# Opentip v2.4.6
#
# More info at [www.opentip.org](http://www.opentip.org)
# 
# Copyright (c) 2012, Matias Meno  
# Graphics by Tjandra Mayerhold
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
*/

var Opentip, firstAdapter, i, mouseMoved, mousePosition, mousePositionObservers, position, vendors, _i, _len, _ref,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty;

Opentip = (function() {
  Opentip.prototype.STICKS_OUT_TOP = 1;

  Opentip.prototype.STICKS_OUT_BOTTOM = 2;

  Opentip.prototype.STICKS_OUT_LEFT = 1;

  Opentip.prototype.STICKS_OUT_RIGHT = 2;

  Opentip.prototype["class"] = {
    container: "opentip-container",
    opentip: "opentip",
    header: "ot-header",
    content: "ot-content",
    loadingIndicator: "ot-loading-indicator",
    close: "ot-close",
    goingToHide: "ot-going-to-hide",
    hidden: "ot-hidden",
    hiding: "ot-hiding",
    goingToShow: "ot-going-to-show",
    showing: "ot-showing",
    visible: "ot-visible",
    loading: "ot-loading",
    ajaxError: "ot-ajax-error",
    fixed: "ot-fixed",
    showEffectPrefix: "ot-show-effect-",
    hideEffectPrefix: "ot-hide-effect-",
    stylePrefix: "style-"
  };

  function Opentip(element, content, title, options) {
    var elementsOpentips, hideTrigger, methodToBind, optionSources, prop, styleName, _i, _j, _len, _len1, _ref, _ref1, _ref2, _tmpStyle,
      _this = this;

    this.id = ++Opentip.lastId;
    this.debug("Creating Opentip.");
    Opentip.tips.push(this);
    this.adapter = Opentip.adapter;
    elementsOpentips = this.adapter.data(element, "opentips") || [];
    elementsOpentips.push(this);
    this.adapter.data(element, "opentips", elementsOpentips);
    this.triggerElement = this.adapter.wrap(element);
    if (this.triggerElement.length > 1) {
      throw new Error("You can't call Opentip on multiple elements.");
    }
    if (this.triggerElement.length < 1) {
      throw new Error("Invalid element.");
    }
    this.loaded = false;
    this.loading = false;
    this.visible = false;
    this.waitingToShow = false;
    this.waitingToHide = false;
    this.currentPosition = {
      left: 0,
      top: 0
    };
    this.dimensions = {
      width: 100,
      height: 50
    };
    this.content = "";
    this.redraw = true;
    this.currentObservers = {
      showing: false,
      visible: false,
      hiding: false,
      hidden: false
    };
    options = this.adapter.clone(options);
    if (typeof content === "object") {
      options = content;
      content = title = void 0;
    } else if (typeof title === "object") {
      options = title;
      title = void 0;
    }
    if (title != null) {
      options.title = title;
    }
    if (content != null) {
      this.setContent(content);
    }
    if (options["extends"] == null) {
      if (options.style != null) {
        options["extends"] = options.style;
      } else {
        options["extends"] = Opentip.defaultStyle;
      }
    }
    optionSources = [options];
    _tmpStyle = options;
    while (_tmpStyle["extends"]) {
      styleName = _tmpStyle["extends"];
      _tmpStyle = Opentip.styles[styleName];
      if (_tmpStyle == null) {
        throw new Error("Invalid style: " + styleName);
      }
      optionSources.unshift(_tmpStyle);
      if (!((_tmpStyle["extends"] != null) || styleName === "standard")) {
        _tmpStyle["extends"] = "standard";
      }
    }
    options = (_ref = this.adapter).extend.apply(_ref, [{}].concat(__slice.call(optionSources)));
    options.hideTriggers = (function() {
      var _i, _len, _ref1, _results;

      _ref1 = options.hideTriggers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        hideTrigger = _ref1[_i];
        _results.push(hideTrigger);
      }
      return _results;
    })();
    if (options.hideTrigger && options.hideTriggers.length === 0) {
      options.hideTriggers.push(options.hideTrigger);
    }
    _ref1 = ["tipJoint", "targetJoint", "stem"];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      prop = _ref1[_i];
      if (options[prop] && typeof options[prop] === "string") {
        options[prop] = new Opentip.Joint(options[prop]);
      }
    }
    if (options.ajax && (options.ajax === true || !options.ajax)) {
      if (this.adapter.tagName(this.triggerElement) === "A") {
        options.ajax = this.adapter.attr(this.triggerElement, "href");
      } else {
        options.ajax = false;
      }
    }
    if (options.showOn === "click" && this.adapter.tagName(this.triggerElement) === "A") {
      this.adapter.observe(this.triggerElement, "click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        return e.stopped = true;
      });
    }
    if (options.target) {
      options.fixed = true;
    }
    if (options.stem === true) {
      options.stem = new Opentip.Joint(options.tipJoint);
    }
    if (options.target === true) {
      options.target = this.triggerElement;
    } else if (options.target) {
      options.target = this.adapter.wrap(options.target);
    }
    this.currentStem = options.stem;
    if (options.delay == null) {
      options.delay = options.showOn === "mouseover" ? 0.2 : 0;
    }
    if (options.targetJoint == null) {
      options.targetJoint = new Opentip.Joint(options.tipJoint).flip();
    }
    this.showTriggers = [];
    this.showTriggersWhenVisible = [];
    this.hideTriggers = [];
    if (options.showOn && options.showOn !== "creation") {
      this.showTriggers.push({
        element: this.triggerElement,
        event: options.showOn
      });
    }
    if (options.ajaxCache != null) {
      options.cache = options.ajaxCache;
      delete options.ajaxCache;
    }
    this.options = options;
    this.bound = {};
    _ref2 = ["prepareToShow", "prepareToHide", "show", "hide", "reposition"];
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      methodToBind = _ref2[_j];
      this.bound[methodToBind] = (function(methodToBind) {
        return function() {
          return _this[methodToBind].apply(_this, arguments);
        };
      })(methodToBind);
    }
    this.adapter.domReady(function() {
      _this.activate();
      if (_this.options.showOn === "creation") {
        return _this.prepareToShow();
      }
    });
  }

  Opentip.prototype._setup = function() {
    var hideOn, hideTrigger, hideTriggerElement, i, _i, _j, _len, _len1, _ref, _ref1, _results;

    this.debug("Setting up the tooltip.");
    this._buildContainer();
    this.hideTriggers = [];
    _ref = this.options.hideTriggers;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      hideTrigger = _ref[i];
      hideTriggerElement = null;
      hideOn = this.options.hideOn instanceof Array ? this.options.hideOn[i] : this.options.hideOn;
      if (typeof hideTrigger === "string") {
        switch (hideTrigger) {
          case "trigger":
            hideOn = hideOn || "mouseout";
            hideTriggerElement = this.triggerElement;
            break;
          case "tip":
            hideOn = hideOn || "mouseover";
            hideTriggerElement = this.container;
            break;
          case "target":
            hideOn = hideOn || "mouseover";
            hideTriggerElement = this.options.target;
            break;
          case "closeButton":
            break;
          default:
            throw new Error("Unknown hide trigger: " + hideTrigger + ".");
        }
      } else {
        hideOn = hideOn || "mouseover";
        hideTriggerElement = this.adapter.wrap(hideTrigger);
      }
      if (hideTriggerElement) {
        this.hideTriggers.push({
          element: hideTriggerElement,
          event: hideOn,
          original: hideTrigger
        });
      }
    }
    _ref1 = this.hideTriggers;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      hideTrigger = _ref1[_j];
      _results.push(this.showTriggersWhenVisible.push({
        element: hideTrigger.element,
        event: "mouseover"
      }));
    }
    return _results;
  };

  Opentip.prototype._buildContainer = function() {
    this.container = this.adapter.create("<div id=\"opentip-" + this.id + "\" class=\"" + this["class"].container + " " + this["class"].hidden + " " + this["class"].stylePrefix + this.options.className + "\"></div>");
    this.adapter.css(this.container, {
      position: "absolute"
    });
    if (this.options.ajax) {
      this.adapter.addClass(this.container, this["class"].loading);
    }
    if (this.options.fixed) {
      this.adapter.addClass(this.container, this["class"].fixed);
    }
    if (this.options.showEffect) {
      this.adapter.addClass(this.container, "" + this["class"].showEffectPrefix + this.options.showEffect);
    }
    if (this.options.hideEffect) {
      return this.adapter.addClass(this.container, "" + this["class"].hideEffectPrefix + this.options.hideEffect);
    }
  };

  Opentip.prototype._buildElements = function() {
    var headerElement, titleElement;

    this.tooltipElement = this.adapter.create("<div class=\"" + this["class"].opentip + "\"><div class=\"" + this["class"].header + "\"></div><div class=\"" + this["class"].content + "\"></div></div>");
    this.backgroundCanvas = this.adapter.wrap(document.createElement("canvas"));
    this.adapter.css(this.backgroundCanvas, {
      position: "absolute"
    });
    if (typeof G_vmlCanvasManager !== "undefined" && G_vmlCanvasManager !== null) {
      G_vmlCanvasManager.initElement(this.adapter.unwrap(this.backgroundCanvas));
    }
    headerElement = this.adapter.find(this.tooltipElement, "." + this["class"].header);
    if (this.options.title) {
      titleElement = this.adapter.create("<h1></h1>");
      this.adapter.update(titleElement, this.options.title, this.options.escapeTitle);
      this.adapter.append(headerElement, titleElement);
    }
    if (this.options.ajax && !this.loaded) {
      this.adapter.append(this.tooltipElement, this.adapter.create("<div class=\"" + this["class"].loadingIndicator + "\"><span>↻</span></div>"));
    }
    if (__indexOf.call(this.options.hideTriggers, "closeButton") >= 0) {
      this.closeButtonElement = this.adapter.create("<a href=\"javascript:undefined;\" class=\"" + this["class"].close + "\"><span>Close</span></a>");
      this.adapter.append(headerElement, this.closeButtonElement);
    }
    this.adapter.append(this.container, this.backgroundCanvas);
    this.adapter.append(this.container, this.tooltipElement);
    this.adapter.append(document.body, this.container);
    this._newContent = true;
    return this.redraw = true;
  };

  Opentip.prototype.setContent = function(content) {
    this.content = content;
    this._newContent = true;
    if (typeof this.content === "function") {
      this._contentFunction = this.content;
      this.content = "";
    } else {
      this._contentFunction = null;
    }
    if (this.visible) {
      return this._updateElementContent();
    }
  };

  Opentip.prototype._updateElementContent = function() {
    var contentDiv;

    if (this._newContent || (!this.options.cache && this._contentFunction)) {
      contentDiv = this.adapter.find(this.container, "." + this["class"].content);
      if (contentDiv != null) {
        if (this._contentFunction) {
          this.debug("Executing content function.");
          this.content = this._contentFunction(this);
        }
        this.adapter.update(contentDiv, this.content, this.options.escapeContent);
      }
      this._newContent = false;
    }
    this._storeAndLockDimensions();
    return this.reposition();
  };

  Opentip.prototype._storeAndLockDimensions = function() {
    var prevDimension;

    if (!this.container) {
      return;
    }
    prevDimension = this.dimensions;
    this.adapter.css(this.container, {
      width: "auto",
      left: "0px",
      top: "0px"
    });
    this.dimensions = this.adapter.dimensions(this.container);
    this.dimensions.width += 1;
    this.adapter.css(this.container, {
      width: "" + this.dimensions.width + "px",
      top: "" + this.currentPosition.top + "px",
      left: "" + this.currentPosition.left + "px"
    });
    if (!this._dimensionsEqual(this.dimensions, prevDimension)) {
      this.redraw = true;
      return this._draw();
    }
  };

  Opentip.prototype.activate = function() {
    return this._setupObservers("hidden", "hiding");
  };

  Opentip.prototype.deactivate = function() {
    this.debug("Deactivating tooltip.");
    this.hide();
    return this._setupObservers("-showing", "-visible", "-hidden", "-hiding");
  };

  Opentip.prototype._setupObservers = function() {
    var observeOrStop, removeObserver, state, states, trigger, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2,
      _this = this;

    states = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = states.length; _i < _len; _i++) {
      state = states[_i];
      removeObserver = false;
      if (state.charAt(0) === "-") {
        removeObserver = true;
        state = state.substr(1);
      }
      if (this.currentObservers[state] === !removeObserver) {
        continue;
      }
      this.currentObservers[state] = !removeObserver;
      observeOrStop = function() {
        var args, _ref, _ref1;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (removeObserver) {
          return (_ref = _this.adapter).stopObserving.apply(_ref, args);
        } else {
          return (_ref1 = _this.adapter).observe.apply(_ref1, args);
        }
      };
      switch (state) {
        case "showing":
          _ref = this.hideTriggers;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            trigger = _ref[_j];
            observeOrStop(trigger.element, trigger.event, this.bound.prepareToHide);
          }
          observeOrStop((document.onresize != null ? document : window), "resize", this.bound.reposition);
          observeOrStop(window, "scroll", this.bound.reposition);
          break;
        case "visible":
          _ref1 = this.showTriggersWhenVisible;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            trigger = _ref1[_k];
            observeOrStop(trigger.element, trigger.event, this.bound.prepareToShow);
          }
          break;
        case "hiding":
          _ref2 = this.showTriggers;
          for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
            trigger = _ref2[_l];
            observeOrStop(trigger.element, trigger.event, this.bound.prepareToShow);
          }
          break;
        case "hidden":
          break;
        default:
          throw new Error("Unknown state: " + state);
      }
    }
    return null;
  };

  Opentip.prototype.prepareToShow = function() {
    this._abortHiding();
    this._abortShowing();
    if (this.visible) {
      return;
    }
    this.debug("Showing in " + this.options.delay + "s.");
    if (this.container == null) {
      this._setup();
    }
    if (this.options.group) {
      Opentip._abortShowingGroup(this.options.group, this);
    }
    this.preparingToShow = true;
    this._setupObservers("-hidden", "-hiding", "showing");
    this._followMousePosition();
    if (this.options.fixed && !this.options.target) {
      this.initialMousePosition = mousePosition;
    }
    this.reposition();
    return this._showTimeoutId = this.setTimeout(this.bound.show, this.options.delay || 0);
  };

  Opentip.prototype.show = function() {
    var _this = this;

    this._abortHiding();
    if (this.visible) {
      return;
    }
    this._clearTimeouts();
    if (!this._triggerElementExists()) {
      return this.deactivate();
    }
    this.debug("Showing now.");
    if (this.container == null) {
      this._setup();
    }
    if (this.options.group) {
      Opentip._hideGroup(this.options.group, this);
    }
    this.visible = true;
    this.preparingToShow = false;
    if (this.tooltipElement == null) {
      this._buildElements();
    }
    this._updateElementContent();
    if (this.options.ajax && (!this.loaded || !this.options.cache)) {
      this._loadAjax();
    }
    this._searchAndActivateCloseButtons();
    this._startEnsureTriggerElement();
    this.adapter.css(this.container, {
      zIndex: Opentip.lastZIndex++
    });
    this._setupObservers("-hidden", "-hiding", "-showing", "-visible", "showing", "visible");
    if (this.options.fixed && !this.options.target) {
      this.initialMousePosition = mousePosition;
    }
    this.reposition();
    this.adapter.removeClass(this.container, this["class"].hiding);
    this.adapter.removeClass(this.container, this["class"].hidden);
    this.adapter.addClass(this.container, this["class"].goingToShow);
    this.setCss3Style(this.container, {
      transitionDuration: "0s"
    });
    this.defer(function() {
      var delay;

      if (!_this.visible || _this.preparingToHide) {
        return;
      }
      _this.adapter.removeClass(_this.container, _this["class"].goingToShow);
      _this.adapter.addClass(_this.container, _this["class"].showing);
      delay = 0;
      if (_this.options.showEffect && _this.options.showEffectDuration) {
        delay = _this.options.showEffectDuration;
      }
      _this.setCss3Style(_this.container, {
        transitionDuration: "" + delay + "s"
      });
      _this._visibilityStateTimeoutId = _this.setTimeout(function() {
        _this.adapter.removeClass(_this.container, _this["class"].showing);
        return _this.adapter.addClass(_this.container, _this["class"].visible);
      }, delay);
      return _this._activateFirstInput();
    });
    return this._draw();
  };

  Opentip.prototype._abortShowing = function() {
    if (this.preparingToShow) {
      this.debug("Aborting showing.");
      this._clearTimeouts();
      this._stopFollowingMousePosition();
      this.preparingToShow = false;
      return this._setupObservers("-showing", "-visible", "hiding", "hidden");
    }
  };

  Opentip.prototype.prepareToHide = function() {
    this._abortShowing();
    this._abortHiding();
    if (!this.visible) {
      return;
    }
    this.debug("Hiding in " + this.options.hideDelay + "s");
    this.preparingToHide = true;
    this._setupObservers("-showing", "visible", "-hidden", "hiding");
    return this._hideTimeoutId = this.setTimeout(this.bound.hide, this.options.hideDelay);
  };

  Opentip.prototype.hide = function() {
    var _this = this;

    this._abortShowing();
    if (!this.visible) {
      return;
    }
    this._clearTimeouts();
    this.debug("Hiding!");
    this.visible = false;
    this.preparingToHide = false;
    this._stopEnsureTriggerElement();
    this._setupObservers("-showing", "-visible", "-hiding", "-hidden", "hiding", "hidden");
    if (!this.options.fixed) {
      this._stopFollowingMousePosition();
    }
    if (!this.container) {
      return;
    }
    this.adapter.removeClass(this.container, this["class"].visible);
    this.adapter.removeClass(this.container, this["class"].showing);
    this.adapter.addClass(this.container, this["class"].goingToHide);
    this.setCss3Style(this.container, {
      transitionDuration: "0s"
    });
    return this.defer(function() {
      var hideDelay;

      _this.adapter.removeClass(_this.container, _this["class"].goingToHide);
      _this.adapter.addClass(_this.container, _this["class"].hiding);
      hideDelay = 0;
      if (_this.options.hideEffect && _this.options.hideEffectDuration) {
        hideDelay = _this.options.hideEffectDuration;
      }
      _this.setCss3Style(_this.container, {
        transitionDuration: "" + hideDelay + "s"
      });
      return _this._visibilityStateTimeoutId = _this.setTimeout(function() {
        _this.adapter.removeClass(_this.container, _this["class"].hiding);
        _this.adapter.addClass(_this.container, _this["class"].hidden);
        _this.setCss3Style(_this.container, {
          transitionDuration: "0s"
        });
        if (_this.options.removeElementsOnHide) {
          _this.debug("Removing HTML elements.");
          _this.adapter.remove(_this.container);
          delete _this.container;
          return delete _this.tooltipElement;
        }
      }, hideDelay);
    });
  };

  Opentip.prototype._abortHiding = function() {
    if (this.preparingToHide) {
      this.debug("Aborting hiding.");
      this._clearTimeouts();
      this.preparingToHide = false;
      return this._setupObservers("-hiding", "showing", "visible");
    }
  };

  Opentip.prototype.reposition = function() {
    var position, stem, _ref,
      _this = this;

    position = this.getPosition();
    if (position == null) {
      return;
    }
    stem = this.options.stem;
    if (this.options.containInViewport) {
      _ref = this._ensureViewportContainment(position), position = _ref.position, stem = _ref.stem;
    }
    if (this._positionsEqual(position, this.currentPosition)) {
      return;
    }
    if (!(!this.options.stem || stem.eql(this.currentStem))) {
      this.redraw = true;
    }
    this.currentPosition = position;
    this.currentStem = stem;
    this._draw();
    this.adapter.css(this.container, {
      left: "" + position.left + "px",
      top: "" + position.top + "px"
    });
    return this.defer(function() {
      var rawContainer, redrawFix;

      rawContainer = _this.adapter.unwrap(_this.container);
      rawContainer.style.visibility = "hidden";
      redrawFix = rawContainer.offsetHeight;
      return rawContainer.style.visibility = "visible";
    });
  };

  Opentip.prototype.getPosition = function(tipJoint, targetJoint, stem) {
    var additionalHorizontal, additionalVertical, offsetDistance, position, stemLength, targetDimensions, targetPosition, unwrappedTarget, _ref;

    if (!this.container) {
      return;
    }
    if (tipJoint == null) {
      tipJoint = this.options.tipJoint;
    }
    if (targetJoint == null) {
      targetJoint = this.options.targetJoint;
    }
    position = {};
    if (this.options.target) {
      targetPosition = this.adapter.offset(this.options.target);
      targetDimensions = this.adapter.dimensions(this.options.target);
      position = targetPosition;
      if (targetJoint.right) {
        unwrappedTarget = this.adapter.unwrap(this.options.target);
        if (unwrappedTarget.getBoundingClientRect != null) {
          position.left = unwrappedTarget.getBoundingClientRect().right + ((_ref = window.pageXOffset) != null ? _ref : document.body.scrollLeft);
        } else {
          position.left += targetDimensions.width;
        }
      } else if (targetJoint.center) {
        position.left += Math.round(targetDimensions.width / 2);
      }
      if (targetJoint.bottom) {
        position.top += targetDimensions.height;
      } else if (targetJoint.middle) {
        position.top += Math.round(targetDimensions.height / 2);
      }
      if (this.options.borderWidth) {
        if (this.options.tipJoint.left) {
          position.left += this.options.borderWidth;
        }
        if (this.options.tipJoint.right) {
          position.left -= this.options.borderWidth;
        }
        if (this.options.tipJoint.top) {
          position.top += this.options.borderWidth;
        } else if (this.options.tipJoint.bottom) {
          position.top -= this.options.borderWidth;
        }
      }
    } else {
      if (this.initialMousePosition) {
        position = {
          top: this.initialMousePosition.y,
          left: this.initialMousePosition.x
        };
      } else {
        position = {
          top: mousePosition.y,
          left: mousePosition.x
        };
      }
    }
    if (this.options.autoOffset) {
      stemLength = this.options.stem ? this.options.stemLength : 0;
      offsetDistance = stemLength && this.options.fixed ? 2 : 10;
      additionalHorizontal = tipJoint.middle && !this.options.fixed ? 15 : 0;
      additionalVertical = tipJoint.center && !this.options.fixed ? 15 : 0;
      if (tipJoint.right) {
        position.left -= offsetDistance + additionalHorizontal;
      } else if (tipJoint.left) {
        position.left += offsetDistance + additionalHorizontal;
      }
      if (tipJoint.bottom) {
        position.top -= offsetDistance + additionalVertical;
      } else if (tipJoint.top) {
        position.top += offsetDistance + additionalVertical;
      }
      if (stemLength) {
        if (stem == null) {
          stem = this.options.stem;
        }
        if (stem.right) {
          position.left -= stemLength;
        } else if (stem.left) {
          position.left += stemLength;
        }
        if (stem.bottom) {
          position.top -= stemLength;
        } else if (stem.top) {
          position.top += stemLength;
        }
      }
    }
    position.left += this.options.offset[0];
    position.top += this.options.offset[1];
    if (tipJoint.right) {
      position.left -= this.dimensions.width;
    } else if (tipJoint.center) {
      position.left -= Math.round(this.dimensions.width / 2);
    }
    if (tipJoint.bottom) {
      position.top -= this.dimensions.height;
    } else if (tipJoint.middle) {
      position.top -= Math.round(this.dimensions.height / 2);
    }
    return position;
  };

  Opentip.prototype._ensureViewportContainment = function(position) {
    var needsRepositioning, newSticksOut, originals, revertedX, revertedY, scrollOffset, stem, sticksOut, targetJoint, tipJoint, viewportDimensions, viewportPosition;

    stem = this.options.stem;
    originals = {
      position: position,
      stem: stem
    };
    if (!(this.visible && position)) {
      return originals;
    }
    sticksOut = this._sticksOut(position);
    if (!(sticksOut[0] || sticksOut[1])) {
      return originals;
    }
    tipJoint = new Opentip.Joint(this.options.tipJoint);
    if (this.options.targetJoint) {
      targetJoint = new Opentip.Joint(this.options.targetJoint);
    }
    scrollOffset = this.adapter.scrollOffset();
    viewportDimensions = this.adapter.viewportDimensions();
    viewportPosition = [position.left - scrollOffset[0], position.top - scrollOffset[1]];
    needsRepositioning = false;
    if (viewportDimensions.width >= this.dimensions.width) {
      if (sticksOut[0]) {
        needsRepositioning = true;
        switch (sticksOut[0]) {
          case this.STICKS_OUT_LEFT:
            tipJoint.setHorizontal("left");
            if (this.options.targetJoint) {
              targetJoint.setHorizontal("right");
            }
            break;
          case this.STICKS_OUT_RIGHT:
            tipJoint.setHorizontal("right");
            if (this.options.targetJoint) {
              targetJoint.setHorizontal("left");
            }
        }
      }
    }
    if (viewportDimensions.height >= this.dimensions.height) {
      if (sticksOut[1]) {
        needsRepositioning = true;
        switch (sticksOut[1]) {
          case this.STICKS_OUT_TOP:
            tipJoint.setVertical("top");
            if (this.options.targetJoint) {
              targetJoint.setVertical("bottom");
            }
            break;
          case this.STICKS_OUT_BOTTOM:
            tipJoint.setVertical("bottom");
            if (this.options.targetJoint) {
              targetJoint.setVertical("top");
            }
        }
      }
    }
    if (!needsRepositioning) {
      return originals;
    }
    if (this.options.stem) {
      stem = tipJoint;
    }
    position = this.getPosition(tipJoint, targetJoint, stem);
    newSticksOut = this._sticksOut(position);
    revertedX = false;
    revertedY = false;
    if (newSticksOut[0] && (newSticksOut[0] !== sticksOut[0])) {
      revertedX = true;
      tipJoint.setHorizontal(this.options.tipJoint.horizontal);
      if (this.options.targetJoint) {
        targetJoint.setHorizontal(this.options.targetJoint.horizontal);
      }
    }
    if (newSticksOut[1] && (newSticksOut[1] !== sticksOut[1])) {
      revertedY = true;
      tipJoint.setVertical(this.options.tipJoint.vertical);
      if (this.options.targetJoint) {
        targetJoint.setVertical(this.options.targetJoint.vertical);
      }
    }
    if (revertedX && revertedY) {
      return originals;
    }
    if (revertedX || revertedY) {
      if (this.options.stem) {
        stem = tipJoint;
      }
      position = this.getPosition(tipJoint, targetJoint, stem);
    }
    return {
      position: position,
      stem: stem
    };
  };

  Opentip.prototype._sticksOut = function(position) {
    var positionOffset, scrollOffset, sticksOut, viewportDimensions;

    scrollOffset = this.adapter.scrollOffset();
    viewportDimensions = this.adapter.viewportDimensions();
    positionOffset = [position.left - scrollOffset[0], position.top - scrollOffset[1]];
    sticksOut = [false, false];
    if (positionOffset[0] < 0) {
      sticksOut[0] = this.STICKS_OUT_LEFT;
    } else if (positionOffset[0] + this.dimensions.width > viewportDimensions.width) {
      sticksOut[0] = this.STICKS_OUT_RIGHT;
    }
    if (positionOffset[1] < 0) {
      sticksOut[1] = this.STICKS_OUT_TOP;
    } else if (positionOffset[1] + this.dimensions.height > viewportDimensions.height) {
      sticksOut[1] = this.STICKS_OUT_BOTTOM;
    }
    return sticksOut;
  };

  Opentip.prototype._draw = function() {
    var backgroundCanvas, bulge, canvasDimensions, canvasPosition, closeButton, closeButtonInner, closeButtonOuter, ctx, drawCorner, drawLine, hb, position, stemBase, stemLength, _i, _len, _ref, _ref1, _ref2,
      _this = this;

    if (!(this.backgroundCanvas && this.redraw)) {
      return;
    }
    this.debug("Drawing background.");
    this.redraw = false;
    if (this.currentStem) {
      _ref = ["top", "right", "bottom", "left"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        position = _ref[_i];
        this.adapter.removeClass(this.container, "stem-" + position);
      }
      this.adapter.addClass(this.container, "stem-" + this.currentStem.horizontal);
      this.adapter.addClass(this.container, "stem-" + this.currentStem.vertical);
    }
    closeButtonInner = [0, 0];
    closeButtonOuter = [0, 0];
    if (__indexOf.call(this.options.hideTriggers, "closeButton") >= 0) {
      closeButton = new Opentip.Joint(((_ref1 = this.currentStem) != null ? _ref1.toString() : void 0) === "top right" ? "top left" : "top right");
      closeButtonInner = [this.options.closeButtonRadius + this.options.closeButtonOffset[0], this.options.closeButtonRadius + this.options.closeButtonOffset[1]];
      closeButtonOuter = [this.options.closeButtonRadius - this.options.closeButtonOffset[0], this.options.closeButtonRadius - this.options.closeButtonOffset[1]];
    }
    canvasDimensions = this.adapter.clone(this.dimensions);
    canvasPosition = [0, 0];
    if (this.options.borderWidth) {
      canvasDimensions.width += this.options.borderWidth * 2;
      canvasDimensions.height += this.options.borderWidth * 2;
      canvasPosition[0] -= this.options.borderWidth;
      canvasPosition[1] -= this.options.borderWidth;
    }
    if (this.options.shadow) {
      canvasDimensions.width += this.options.shadowBlur * 2;
      canvasDimensions.width += Math.max(0, this.options.shadowOffset[0] - this.options.shadowBlur * 2);
      canvasDimensions.height += this.options.shadowBlur * 2;
      canvasDimensions.height += Math.max(0, this.options.shadowOffset[1] - this.options.shadowBlur * 2);
      canvasPosition[0] -= Math.max(0, this.options.shadowBlur - this.options.shadowOffset[0]);
      canvasPosition[1] -= Math.max(0, this.options.shadowBlur - this.options.shadowOffset[1]);
    }
    bulge = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    if (this.currentStem) {
      if (this.currentStem.left) {
        bulge.left = this.options.stemLength;
      } else if (this.currentStem.right) {
        bulge.right = this.options.stemLength;
      }
      if (this.currentStem.top) {
        bulge.top = this.options.stemLength;
      } else if (this.currentStem.bottom) {
        bulge.bottom = this.options.stemLength;
      }
    }
    if (closeButton) {
      if (closeButton.left) {
        bulge.left = Math.max(bulge.left, closeButtonOuter[0]);
      } else if (closeButton.right) {
        bulge.right = Math.max(bulge.right, closeButtonOuter[0]);
      }
      if (closeButton.top) {
        bulge.top = Math.max(bulge.top, closeButtonOuter[1]);
      } else if (closeButton.bottom) {
        bulge.bottom = Math.max(bulge.bottom, closeButtonOuter[1]);
      }
    }
    canvasDimensions.width += bulge.left + bulge.right;
    canvasDimensions.height += bulge.top + bulge.bottom;
    canvasPosition[0] -= bulge.left;
    canvasPosition[1] -= bulge.top;
    if (this.currentStem && this.options.borderWidth) {
      _ref2 = this._getPathStemMeasures(this.options.stemBase, this.options.stemLength, this.options.borderWidth), stemLength = _ref2.stemLength, stemBase = _ref2.stemBase;
    }
    backgroundCanvas = this.adapter.unwrap(this.backgroundCanvas);
    backgroundCanvas.width = canvasDimensions.width;
    backgroundCanvas.height = canvasDimensions.height;
    this.adapter.css(this.backgroundCanvas, {
      width: "" + backgroundCanvas.width + "px",
      height: "" + backgroundCanvas.height + "px",
      left: "" + canvasPosition[0] + "px",
      top: "" + canvasPosition[1] + "px"
    });
    ctx = backgroundCanvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    ctx.beginPath();
    ctx.fillStyle = this._getColor(ctx, this.dimensions, this.options.background, this.options.backgroundGradientHorizontal);
    ctx.lineJoin = "miter";
    ctx.miterLimit = 500;
    hb = this.options.borderWidth / 2;
    if (this.options.borderWidth) {
      ctx.strokeStyle = this.options.borderColor;
      ctx.lineWidth = this.options.borderWidth;
    } else {
      stemLength = this.options.stemLength;
      stemBase = this.options.stemBase;
    }
    if (stemBase == null) {
      stemBase = 0;
    }
    drawLine = function(length, stem, first) {
      if (first) {
        ctx.moveTo(Math.max(stemBase, _this.options.borderRadius, closeButtonInner[0]) + 1 - hb, -hb);
      }
      if (stem) {
        ctx.lineTo(length / 2 - stemBase / 2, -hb);
        ctx.lineTo(length / 2, -stemLength - hb);
        return ctx.lineTo(length / 2 + stemBase / 2, -hb);
      }
    };
    drawCorner = function(stem, closeButton, i) {
      var angle1, angle2, innerWidth, offset;

      if (stem) {
        ctx.lineTo(-stemBase + hb, 0 - hb);
        ctx.lineTo(stemLength + hb, -stemLength - hb);
        return ctx.lineTo(hb, stemBase - hb);
      } else if (closeButton) {
        offset = _this.options.closeButtonOffset;
        innerWidth = closeButtonInner[0];
        if (i % 2 !== 0) {
          offset = [offset[1], offset[0]];
          innerWidth = closeButtonInner[1];
        }
        angle1 = Math.acos(offset[1] / _this.options.closeButtonRadius);
        angle2 = Math.acos(offset[0] / _this.options.closeButtonRadius);
        ctx.lineTo(-innerWidth + hb, -hb);
        return ctx.arc(hb - offset[0], -hb + offset[1], _this.options.closeButtonRadius, -(Math.PI / 2 + angle1), angle2, false);
      } else {
        ctx.lineTo(-_this.options.borderRadius + hb, -hb);
        return ctx.quadraticCurveTo(hb, -hb, hb, _this.options.borderRadius - hb);
      }
    };
    ctx.translate(-canvasPosition[0], -canvasPosition[1]);
    ctx.save();
    (function() {
      var cornerStem, i, lineLength, lineStem, positionIdx, positionX, positionY, rotation, _j, _ref3, _results;

      _results = [];
      for (i = _j = 0, _ref3 = Opentip.positions.length / 2; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
        positionIdx = i * 2;
        positionX = i === 0 || i === 3 ? 0 : _this.dimensions.width;
        positionY = i < 2 ? 0 : _this.dimensions.height;
        rotation = (Math.PI / 2) * i;
        lineLength = i % 2 === 0 ? _this.dimensions.width : _this.dimensions.height;
        lineStem = new Opentip.Joint(Opentip.positions[positionIdx]);
        cornerStem = new Opentip.Joint(Opentip.positions[positionIdx + 1]);
        ctx.save();
        ctx.translate(positionX, positionY);
        ctx.rotate(rotation);
        drawLine(lineLength, lineStem.eql(_this.currentStem), i === 0);
        ctx.translate(lineLength, 0);
        drawCorner(cornerStem.eql(_this.currentStem), cornerStem.eql(closeButton), i);
        _results.push(ctx.restore());
      }
      return _results;
    })();
    ctx.closePath();
    ctx.save();
    if (this.options.shadow) {
      ctx.shadowColor = this.options.shadowColor;
      ctx.shadowBlur = this.options.shadowBlur;
      ctx.shadowOffsetX = this.options.shadowOffset[0];
      ctx.shadowOffsetY = this.options.shadowOffset[1];
    }
    ctx.fill();
    ctx.restore();
    if (this.options.borderWidth) {
      ctx.stroke();
    }
    ctx.restore();
    if (closeButton) {
      return (function() {
        var crossCenter, crossHeight, crossWidth, hcs, linkCenter;

        crossWidth = crossHeight = _this.options.closeButtonRadius * 2;
        if (closeButton.toString() === "top right") {
          linkCenter = [_this.dimensions.width - _this.options.closeButtonOffset[0], _this.options.closeButtonOffset[1]];
          crossCenter = [linkCenter[0] + hb, linkCenter[1] - hb];
        } else {
          linkCenter = [_this.options.closeButtonOffset[0], _this.options.closeButtonOffset[1]];
          crossCenter = [linkCenter[0] - hb, linkCenter[1] - hb];
        }
        ctx.translate(crossCenter[0], crossCenter[1]);
        hcs = _this.options.closeButtonCrossSize / 2;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = _this.options.closeButtonCrossColor;
        ctx.lineWidth = _this.options.closeButtonCrossLineWidth;
        ctx.lineCap = "round";
        ctx.moveTo(-hcs, -hcs);
        ctx.lineTo(hcs, hcs);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hcs, -hcs);
        ctx.lineTo(-hcs, hcs);
        ctx.stroke();
        ctx.restore();
        return _this.adapter.css(_this.closeButtonElement, {
          left: "" + (linkCenter[0] - hcs - _this.options.closeButtonLinkOverscan) + "px",
          top: "" + (linkCenter[1] - hcs - _this.options.closeButtonLinkOverscan) + "px",
          width: "" + (_this.options.closeButtonCrossSize + _this.options.closeButtonLinkOverscan * 2) + "px",
          height: "" + (_this.options.closeButtonCrossSize + _this.options.closeButtonLinkOverscan * 2) + "px"
        });
      })();
    }
  };

  Opentip.prototype._getPathStemMeasures = function(outerStemBase, outerStemLength, borderWidth) {
    var angle, distanceBetweenTips, halfAngle, hb, rhombusSide, stemBase, stemLength;

    hb = borderWidth / 2;
    halfAngle = Math.atan((outerStemBase / 2) / outerStemLength);
    angle = halfAngle * 2;
    rhombusSide = hb / Math.sin(angle);
    distanceBetweenTips = 2 * rhombusSide * Math.cos(halfAngle);
    stemLength = hb + outerStemLength - distanceBetweenTips;
    if (stemLength < 0) {
      throw new Error("Sorry but your stemLength / stemBase ratio is strange.");
    }
    stemBase = (Math.tan(halfAngle) * stemLength) * 2;
    return {
      stemLength: stemLength,
      stemBase: stemBase
    };
  };

  Opentip.prototype._getColor = function(ctx, dimensions, color, horizontal) {
    var colorStop, gradient, i, _i, _len;

    if (horizontal == null) {
      horizontal = false;
    }
    if (typeof color === "string") {
      return color;
    }
    if (horizontal) {
      gradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    }
    for (i = _i = 0, _len = color.length; _i < _len; i = ++_i) {
      colorStop = color[i];
      gradient.addColorStop(colorStop[0], colorStop[1]);
    }
    return gradient;
  };

  Opentip.prototype._searchAndActivateCloseButtons = function() {
    var element, _i, _len, _ref;

    _ref = this.adapter.findAll(this.container, "." + this["class"].close);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i];
      this.hideTriggers.push({
        element: this.adapter.wrap(element),
        event: "click"
      });
    }
    if (this.currentObservers.showing) {
      this._setupObservers("-showing", "showing");
    }
    if (this.currentObservers.visible) {
      return this._setupObservers("-visible", "visible");
    }
  };

  Opentip.prototype._activateFirstInput = function() {
    var input;

    input = this.adapter.unwrap(this.adapter.find(this.container, "input, textarea"));
    return input != null ? typeof input.focus === "function" ? input.focus() : void 0 : void 0;
  };

  Opentip.prototype._followMousePosition = function() {
    if (!this.options.fixed) {
      return Opentip._observeMousePosition(this.bound.reposition);
    }
  };

  Opentip.prototype._stopFollowingMousePosition = function() {
    if (!this.options.fixed) {
      return Opentip._stopObservingMousePosition(this.bound.reposition);
    }
  };

  Opentip.prototype._clearShowTimeout = function() {
    return clearTimeout(this._showTimeoutId);
  };

  Opentip.prototype._clearHideTimeout = function() {
    return clearTimeout(this._hideTimeoutId);
  };

  Opentip.prototype._clearTimeouts = function() {
    clearTimeout(this._visibilityStateTimeoutId);
    this._clearShowTimeout();
    return this._clearHideTimeout();
  };

  Opentip.prototype._triggerElementExists = function() {
    var el;

    el = this.adapter.unwrap(this.triggerElement);
    while (el.parentNode) {
      if (el.parentNode.tagName === "BODY") {
        return true;
      }
      el = el.parentNode;
    }
    return false;
  };

  Opentip.prototype._loadAjax = function() {
    var _this = this;

    if (this.loading) {
      return;
    }
    this.loaded = false;
    this.loading = true;
    this.adapter.addClass(this.container, this["class"].loading);
    this.setContent("");
    this.debug("Loading content from " + this.options.ajax);
    return this.adapter.ajax({
      url: this.options.ajax,
      method: this.options.ajaxMethod,
      onSuccess: function(responseText) {
        _this.debug("Loading successful.");
        _this.adapter.removeClass(_this.container, _this["class"].loading);
        return _this.setContent(responseText);
      },
      onError: function(error) {
        var message;

        message = _this.options.ajaxErrorMessage;
        _this.debug(message, error);
        _this.setContent(message);
        return _this.adapter.addClass(_this.container, _this["class"].ajaxError);
      },
      onComplete: function() {
        _this.adapter.removeClass(_this.container, _this["class"].loading);
        _this.loading = false;
        _this.loaded = true;
        _this._searchAndActivateCloseButtons();
        _this._activateFirstInput();
        return _this.reposition();
      }
    });
  };

  Opentip.prototype._ensureTriggerElement = function() {
    if (!this._triggerElementExists()) {
      this.deactivate();
      return this._stopEnsureTriggerElement();
    }
  };

  Opentip.prototype._ensureTriggerElementInterval = 1000;

  Opentip.prototype._startEnsureTriggerElement = function() {
    var _this = this;

    return this._ensureTriggerElementTimeoutId = setInterval((function() {
      return _this._ensureTriggerElement();
    }), this._ensureTriggerElementInterval);
  };

  Opentip.prototype._stopEnsureTriggerElement = function() {
    return clearInterval(this._ensureTriggerElementTimeoutId);
  };

  return Opentip;

})();

vendors = ["khtml", "ms", "o", "moz", "webkit"];

Opentip.prototype.setCss3Style = function(element, styles) {
  var prop, value, vendor, vendorProp, _results;

  element = this.adapter.unwrap(element);
  _results = [];
  for (prop in styles) {
    if (!__hasProp.call(styles, prop)) continue;
    value = styles[prop];
    if (element.style[prop] != null) {
      _results.push(element.style[prop] = value);
    } else {
      _results.push((function() {
        var _i, _len, _results1;

        _results1 = [];
        for (_i = 0, _len = vendors.length; _i < _len; _i++) {
          vendor = vendors[_i];
          vendorProp = "" + (this.ucfirst(vendor)) + (this.ucfirst(prop));
          if (element.style[vendorProp] != null) {
            _results1.push(element.style[vendorProp] = value);
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
  }
  return _results;
};

Opentip.prototype.defer = function(func) {
  return setTimeout(func, 0);
};

Opentip.prototype.setTimeout = function(func, seconds) {
  return setTimeout(func, seconds ? seconds * 1000 : 0);
};

Opentip.prototype.ucfirst = function(string) {
  if (string == null) {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

Opentip.prototype.dasherize = function(string) {
  return string.replace(/([A-Z])/g, function(_, character) {
    return "-" + (character.toLowerCase());
  });
};

mousePositionObservers = [];

mousePosition = {
  x: 0,
  y: 0
};

mouseMoved = function(e) {
  var observer, _i, _len, _results;

  mousePosition = Opentip.adapter.mousePosition(e);
  _results = [];
  for (_i = 0, _len = mousePositionObservers.length; _i < _len; _i++) {
    observer = mousePositionObservers[_i];
    _results.push(observer());
  }
  return _results;
};

Opentip.followMousePosition = function() {
  return Opentip.adapter.observe(document.body, "mousemove", mouseMoved);
};

Opentip._observeMousePosition = function(observer) {
  return mousePositionObservers.push(observer);
};

Opentip._stopObservingMousePosition = function(removeObserver) {
  var observer;

  return mousePositionObservers = (function() {
    var _i, _len, _results;

    _results = [];
    for (_i = 0, _len = mousePositionObservers.length; _i < _len; _i++) {
      observer = mousePositionObservers[_i];
      if (observer !== removeObserver) {
        _results.push(observer);
      }
    }
    return _results;
  })();
};

Opentip.Joint = (function() {
  function Joint(pointerString) {
    if (pointerString == null) {
      return;
    }
    if (pointerString instanceof Opentip.Joint) {
      pointerString = pointerString.toString();
    }
    this.set(pointerString);
    this;
  }

  Joint.prototype.set = function(string) {
    string = string.toLowerCase();
    this.setHorizontal(string);
    this.setVertical(string);
    return this;
  };

  Joint.prototype.setHorizontal = function(string) {
    var i, valid, _i, _j, _len, _len1, _results;

    valid = ["left", "center", "right"];
    for (_i = 0, _len = valid.length; _i < _len; _i++) {
      i = valid[_i];
      if (~string.indexOf(i)) {
        this.horizontal = i.toLowerCase();
      }
    }
    if (this.horizontal == null) {
      this.horizontal = "center";
    }
    _results = [];
    for (_j = 0, _len1 = valid.length; _j < _len1; _j++) {
      i = valid[_j];
      _results.push(this[i] = this.horizontal === i ? i : void 0);
    }
    return _results;
  };

  Joint.prototype.setVertical = function(string) {
    var i, valid, _i, _j, _len, _len1, _results;

    valid = ["top", "middle", "bottom"];
    for (_i = 0, _len = valid.length; _i < _len; _i++) {
      i = valid[_i];
      if (~string.indexOf(i)) {
        this.vertical = i.toLowerCase();
      }
    }
    if (this.vertical == null) {
      this.vertical = "middle";
    }
    _results = [];
    for (_j = 0, _len1 = valid.length; _j < _len1; _j++) {
      i = valid[_j];
      _results.push(this[i] = this.vertical === i ? i : void 0);
    }
    return _results;
  };

  Joint.prototype.eql = function(pointer) {
    return (pointer != null) && this.horizontal === pointer.horizontal && this.vertical === pointer.vertical;
  };

  Joint.prototype.flip = function() {
    var flippedIndex, positionIdx;

    positionIdx = Opentip.position[this.toString(true)];
    flippedIndex = (positionIdx + 4) % 8;
    this.set(Opentip.positions[flippedIndex]);
    return this;
  };

  Joint.prototype.toString = function(camelized) {
    var horizontal, vertical;

    if (camelized == null) {
      camelized = false;
    }
    vertical = this.vertical === "middle" ? "" : this.vertical;
    horizontal = this.horizontal === "center" ? "" : this.horizontal;
    if (vertical && horizontal) {
      if (camelized) {
        horizontal = Opentip.prototype.ucfirst(horizontal);
      } else {
        horizontal = " " + horizontal;
      }
    }
    return "" + vertical + horizontal;
  };

  return Joint;

})();

Opentip.prototype._positionsEqual = function(posA, posB) {
  return (posA != null) && (posB != null) && posA.left === posB.left && posA.top === posB.top;
};

Opentip.prototype._dimensionsEqual = function(dimA, dimB) {
  return (dimA != null) && (dimB != null) && dimA.width === dimB.width && dimA.height === dimB.height;
};

Opentip.prototype.debug = function() {
  var args;

  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (Opentip.debug && ((typeof console !== "undefined" && console !== null ? console.debug : void 0) != null)) {
    args.unshift("#" + this.id + " |");
    return console.debug.apply(console, args);
  }
};

Opentip.findElements = function() {
  var adapter, content, element, optionName, optionValue, options, _i, _len, _ref, _results;

  adapter = Opentip.adapter;
  _ref = adapter.findAll(document.body, "[data-ot]");
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    element = _ref[_i];
    options = {};
    content = adapter.data(element, "ot");
    if (content === "" || content === "true" || content === "yes") {
      content = adapter.attr(element, "title");
      adapter.attr(element, "title", "");
    }
    content = content || "";
    for (optionName in Opentip.styles.standard) {
      optionValue = adapter.data(element, "ot" + (Opentip.prototype.ucfirst(optionName)));
      if (optionValue != null) {
        if (optionValue === "yes" || optionValue === "true" || optionValue === "on") {
          optionValue = true;
        } else if (optionValue === "no" || optionValue === "false" || optionValue === "off") {
          optionValue = false;
        }
        options[optionName] = optionValue;
      }
    }
    _results.push(new Opentip(element, content, options));
  }
  return _results;
};

Opentip.version = "2.4.6";

Opentip.debug = false;

Opentip.lastId = 0;

Opentip.lastZIndex = 100;

Opentip.tips = [];

Opentip._abortShowingGroup = function(group, originatingOpentip) {
  var opentip, _i, _len, _ref, _results;

  _ref = Opentip.tips;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    opentip = _ref[_i];
    if (opentip !== originatingOpentip && opentip.options.group === group) {
      _results.push(opentip._abortShowing());
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

Opentip._hideGroup = function(group, originatingOpentip) {
  var opentip, _i, _len, _ref, _results;

  _ref = Opentip.tips;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    opentip = _ref[_i];
    if (opentip !== originatingOpentip && opentip.options.group === group) {
      _results.push(opentip.hide());
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

Opentip.adapters = {};

Opentip.adapter = null;

firstAdapter = true;

Opentip.addAdapter = function(adapter) {
  Opentip.adapters[adapter.name] = adapter;
  if (firstAdapter) {
    Opentip.adapter = adapter;
    adapter.domReady(Opentip.findElements);
    adapter.domReady(Opentip.followMousePosition);
    return firstAdapter = false;
  }
};

Opentip.positions = ["top", "topRight", "right", "bottomRight", "bottom", "bottomLeft", "left", "topLeft"];

Opentip.position = {};

_ref = Opentip.positions;
for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
  position = _ref[i];
  Opentip.position[position] = i;
}

Opentip.styles = {
  standard: {
    "extends": null,
    title: void 0,
    escapeTitle: true,
    escapeContent: false,
    className: "standard",
    stem: true,
    delay: null,
    hideDelay: 0.1,
    fixed: false,
    showOn: "mouseover",
    hideTrigger: "trigger",
    hideTriggers: [],
    hideOn: null,
    removeElementsOnHide: false,
    offset: [0, 0],
    containInViewport: true,
    autoOffset: true,
    showEffect: "appear",
    hideEffect: "fade",
    showEffectDuration: 0.3,
    hideEffectDuration: 0.2,
    stemLength: 5,
    stemBase: 8,
    tipJoint: "top left",
    target: null,
    targetJoint: null,
    cache: true,
    ajax: false,
    ajaxMethod: "GET",
    ajaxErrorMessage: "There was a problem downloading the content.",
    group: null,
    style: null,
    background: "#fff18f",
    backgroundGradientHorizontal: false,
    closeButtonOffset: [5, 5],
    closeButtonRadius: 7,
    closeButtonCrossSize: 4,
    closeButtonCrossColor: "#d2c35b",
    closeButtonCrossLineWidth: 1.5,
    closeButtonLinkOverscan: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#f2e37b",
    shadow: true,
    shadowBlur: 10,
    shadowOffset: [3, 3],
    shadowColor: "rgba(0, 0, 0, 0.1)"
  },
  glass: {
    "extends": "standard",
    className: "glass",
    background: [[0, "rgba(252, 252, 252, 0.8)"], [0.5, "rgba(255, 255, 255, 0.8)"], [0.5, "rgba(250, 250, 250, 0.9)"], [1, "rgba(245, 245, 245, 0.9)"]],
    borderColor: "#eee",
    closeButtonCrossColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 15,
    closeButtonRadius: 10,
    closeButtonOffset: [8, 8]
  },
  dark: {
    "extends": "standard",
    className: "dark",
    borderRadius: 13,
    borderColor: "#444",
    closeButtonCrossColor: "rgba(240, 240, 240, 1)",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: [2, 2],
    background: [[0, "rgba(30, 30, 30, 0.7)"], [0.5, "rgba(30, 30, 30, 0.8)"], [0.5, "rgba(10, 10, 10, 0.8)"], [1, "rgba(10, 10, 10, 0.9)"]]
  },
  alert: {
    "extends": "standard",
    className: "alert",
    borderRadius: 1,
    borderColor: "#AE0D11",
    closeButtonCrossColor: "rgba(255, 255, 255, 1)",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: [2, 2],
    background: [[0, "rgba(203, 15, 19, 0.7)"], [0.5, "rgba(203, 15, 19, 0.8)"], [0.5, "rgba(189, 14, 18, 0.8)"], [1, "rgba(179, 14, 17, 0.9)"]]
  }
};

Opentip.defaultStyle = "standard";

if (typeof module !== "undefined" && module !== null) {
  module.exports = Opentip;
} else {
  window.Opentip = Opentip;
}

})();
var __slice = [].slice;

(function($) {
  var Adapter;

  $.fn.opentip = function(content, title, options) {
    return new Opentip(this, content, title, options);
  };
  Adapter = (function() {
    function Adapter() {}

    Adapter.prototype.name = "jquery";

    Adapter.prototype.domReady = function(callback) {
      return $(callback);
    };

    Adapter.prototype.create = function(html) {
      return $(html);
    };

    Adapter.prototype.wrap = function(element) {
      element = $(element);
      if (element.length > 1) {
        throw new Error("Multiple elements provided.");
      }
      return element;
    };

    Adapter.prototype.unwrap = function(element) {
      return $(element)[0];
    };

    Adapter.prototype.tagName = function(element) {
      return this.unwrap(element).tagName;
    };

    Adapter.prototype.attr = function() {
      var args, element, _ref;

      element = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = $(element)).attr.apply(_ref, args);
    };

    Adapter.prototype.data = function() {
      var args, element, _ref;

      element = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = $(element)).data.apply(_ref, args);
    };

    Adapter.prototype.find = function(element, selector) {
      return $(element).find(selector).get(0);
    };

    Adapter.prototype.findAll = function(element, selector) {
      return $(element).find(selector);
    };

    Adapter.prototype.update = function(element, content, escape) {
      element = $(element);
      if (escape) {
        return element.text(content);
      } else {
        return element.html(content);
      }
    };

    Adapter.prototype.append = function(element, child) {
      return $(element).append(child);
    };

    Adapter.prototype.remove = function(element) {
      return $(element).remove();
    };

    Adapter.prototype.addClass = function(element, className) {
      return $(element).addClass(className);
    };

    Adapter.prototype.removeClass = function(element, className) {
      return $(element).removeClass(className);
    };

    Adapter.prototype.css = function(element, properties) {
      return $(element).css(properties);
    };

    Adapter.prototype.dimensions = function(element) {
      return {
        width: $(element).outerWidth(),
        height: $(element).outerHeight()
      };
    };

    Adapter.prototype.scrollOffset = function() {
      return [window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop];
    };

    Adapter.prototype.viewportDimensions = function() {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      };
    };

    Adapter.prototype.mousePosition = function(e) {
      if (e == null) {
        return null;
      }
      return {
        x: e.pageX,
        y: e.pageY
      };
    };

    Adapter.prototype.offset = function(element) {
      var offset;

      offset = $(element).offset();
      return {
        left: offset.left,
        top: offset.top
      };
    };

    Adapter.prototype.observe = function(element, eventName, observer) {
      return $(element).bind(eventName, observer);
    };

    Adapter.prototype.stopObserving = function(element, eventName, observer) {
      return $(element).unbind(eventName, observer);
    };

    Adapter.prototype.ajax = function(options) {
      var _ref, _ref1;

      if (options.url == null) {
        throw new Error("No url provided");
      }
      return $.ajax({
        url: options.url,
        type: (_ref = (_ref1 = options.method) != null ? _ref1.toUpperCase() : void 0) != null ? _ref : "GET"
      }).done(function(content) {
        return typeof options.onSuccess === "function" ? options.onSuccess(content) : void 0;
      }).fail(function(request) {
        return typeof options.onError === "function" ? options.onError("Server responded with status " + request.status) : void 0;
      }).always(function() {
        return typeof options.onComplete === "function" ? options.onComplete() : void 0;
      });
    };

    Adapter.prototype.clone = function(object) {
      return $.extend({}, object);
    };

    Adapter.prototype.extend = function() {
      var sources, target;

      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return $.extend.apply($, [target].concat(__slice.call(sources)));
    };

    return Adapter;

  })();
  return Opentip.addAdapter(new Adapter);
})(jQuery);

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');


/*
 Helper object to handle the communication to the SizeMe server.
  Exposes two functions to fetch the profiles for the accountInfo and
  get the match results for the items.

  @version 2.0
 */

(function() {
  var SizeMe,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  SizeMe = (function() {

    /*
      Address for the SizeMe API service
     */
    var _authToken, _facepalm, addMessageListener, createCORSRequest, createFitResponse, defaultErrorCallback, gaEnabled, removeMessageListener;

    SizeMe.contextAddress = "https://www.sizeme.com";

    SizeMe.gaTrackingID = "UA-40735596-1";

    gaEnabled = false;

    ga(function() {
      return gaEnabled = SizeMe.gaTrackingID != null;
    });


    /*
      Version of the API
     */

    SizeMe.version = "2.1";

    _authToken = void 0;

    _facepalm = !("withCredentials" in new XMLHttpRequest());


    /*
      Creates a new instance of SizeMe
    
      @param [Object] authToken the authentication token for the SizeMe service,
        obtained with the {SizeMe.getAuthToken} method.
     */

    function SizeMe(authToken) {
      _authToken = authToken;
    }

    addMessageListener = function(callback) {
      if (window.attachEvent != null) {
        return window.attachEvent("onmessage", callback);
      } else {
        return window.addEventListener("message", callback);
      }
    };

    removeMessageListener = function(callback) {
      if (window.detachEvent != null) {
        return window.detachEvent("onmessage", callback);
      } else {
        return window.removeEventListener("message", callback);
      }
    };

    createCORSRequest = function(method, service, callback, errorCallback) {
      var url, xhr;
      xhr = void 0;
      url = "" + SizeMe.contextAddress + service;
      if (!_facepalm) {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              return callback(xhr);
            } else {
              return errorCallback(xhr);
            }
          }
        };
        xhr.open(method, url, true);
        if (_authToken != null) {
          xhr.setRequestHeader("Authorization", "Bearer " + _authToken);
        }
        if (gaEnabled) {
          xhr.setRequestHeader("X-Analytics-Enabled", "true");
        }
      } else if (typeof XDomainRequest !== "undefined" && XDomainRequest !== null) {
        xhr = new XDomainRequest();
        url = url + "?_tm=" + (new Date().getTime());
        if (_authToken != null) {
          url = url + "&authToken=" + _authToken;
        }
        if (gaEnabled) {
          url = url + "&analyticsEnabled=true";
        }
        xhr.onload = function() {
          return callback(xhr);
        };
        xhr.onerror = function() {
          return errorCallback(xhr);
        };
        xhr.open(method, url, true);
      } else {
        console.error("Unsupported browser");
      }
      return xhr;
    };

    defaultErrorCallback = function(xhr, status, statusText) {
      if (window.console && console.log) {
        return console.log("Error: " + statusText + " (" + status + ")");
      }
    };

    SizeMe.trackEvent = function(action, label) {
      if (SizeMe.gaTrackingID != null) {
        ga("create", SizeMe.gaTrackingID, "auto", {
          name: "sizemeTracker"
        });
        this.trackEvent = function(a, l) {
          return ga("sizemeTracker.send", {
            hitType: "event",
            eventCategory: window.location.hostname,
            eventAction: a,
            eventLabel: l
          });
        };
        return this.trackEvent(action, label);
      }
    };


    /*
      Tries to fetch a new auth token from the SizeMe service. User needs to be
      logged in to the service to receive a valid token.
    
      The returned token is passed as an argument to the callback function. If
      user is not logged in, the returned token is null.
    
      This function is executed asynchronously, so it will return immediately.
    
      @param [Function] callback
        function to execute after the request is completed
      @param [Function] errorCallback function to execute if there was an error
     */

    SizeMe.getAuthToken = function(callback, errorCallback) {
      var cb, iframe, xhr;
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      if (_facepalm) {
        iframe = document.createElement("iframe");
        cb = function(event) {
          var tokenObj;
          if (event.origin === SizeMe.contextAddress) {
            tokenObj = event.data;
            removeMessageListener(cb);
            document.body.removeChild(iframe);
            if (callback != null) {
              if (typeof callback === "function") {
                callback(tokenObj);
              }
            }
          }
        };
        addMessageListener(cb);
        iframe.setAttribute("src", SizeMe.contextAddress + "/api/authToken.html");
        iframe.setAttribute("style", "display:none");
        document.body.appendChild(iframe);
      } else {
        xhr = createCORSRequest("GET", "/api/authToken", function(xhr) {
          return callback(JSON.parse(xhr.responseText));
        }, function(xhr) {
          return errorCallback(xhr, xhr.status, xhr.statusText);
        });
        xhr.withCredentials = true;
        xhr.send();
      }
    };

    createFitResponse = function(xhr) {
      var fitResponse, response, responseMap, size;
      response = JSON.parse(xhr.responseText);
      responseMap = new SizeMe.Map();
      for (size in response) {
        if (!hasProp.call(response, size)) continue;
        fitResponse = response[size];
        fitResponse.matchMap = SizeMe.Map.fromObject(fitResponse.matchMap);
        responseMap.addItem(size, fitResponse);
      }
      return responseMap;
    };


    /*
      Fetches an array of profiles for the accountInfo.
      The format of the profile objects is
    
          {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "id of the profile."
              },
              "profileName": {
                "type": "string",
                "description": "name of the profile."
              }
            }
          }
    
      The array is passed as an argument to the callback function.
      This function is executed asynchronously, so it will return immediately.
    
      @param [Object] callback
        function to execute after the request is completed
      @param [Function] errorCallback function to execute if there was an error
    
      @return [Object] profile
     */

    SizeMe.prototype.fetchProfilesForAccount = function(callback, errorCallback) {
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      createCORSRequest("GET", "/api/profiles", function(xhr) {
        SizeMe.trackEvent("fetchProfiles", "API: fetchProfiles");
        return callback(JSON.parse(xhr.responseText));
      }, function(xhr) {
        return errorCallback(xhr, xhr.status, xhr.statusText);
      }).send();
      return void 0;
    };


    /*
      Calls the matching service with the measurements of the item to be matched
      against the selected profile.
    
      The result is an associative array mapping size labels to response objects.
      The format of a response object is
    
          {
            "type": "object",
            "properties": {
              "fitRangeLabel": {
                "type": "string",
                "enum": [
                  "too_small",
                  "slim",
                  "regular",
                  "loose",
                  "huge",
                  "too_big"
                ],
                "description": "A label defining the range of the total fit."
              },
              "totalFit": {
                "type": "integer",
                "description": "A total fit of the item. 100 is a perfect match."
              },
              "matchMap": {
                "type": "object",
                "description": "An associative array containing the detailed fit
                                for each measuring property"
              },
              "accuracy": {
                "type": "number",
                "description": "An accuracy percentage, ie. the percentage of
                                measurement points of the item compared
                                to the points specified in the profile"
              },
              "missingMeasurements": {
                "type": "array",
                "description": "An array of the measurement points that were
                                missing in the profile. The items in the array
                                are themselves also arrays of the size two;
                                first item is the measurement's item property,
                                the second is the property's human name"
              }
            }
          }
    
      The response object contains an associative array (property matchMap)
      that maps each measuring property to a match object The format of a
      match object is
    
          {
            "type": "object",
            "properties": {
              "overlap": {
                "type": "integer",
                "description": "difference of the item's measure
                                (with corrective factors) and the
                                person's measure".
              },
              "percentage": {
                "type": "number",
                "description": "the percentage of the overlap."
              },
              "componentFit": {
                "type": "integer",
                "description": "component's fit value."
              },
            }
          }
    
      The response object is passed as an argument to the
      successCallback-function.
      This function is executed asynchronously, so it will return immediately.
    
      @param [SizeMe.FitRequest] fitrequest
        instance containing profile and item information
      @param [Function] successCallback function to call if match succeeds
      @param [Function] errorCallback function to call if there's an error
     */

    SizeMe.prototype.match = function(fitRequest, successCallback, errorCallback) {
      var data, xhr;
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      data = JSON.stringify(fitRequest);
      xhr = createCORSRequest("POST", "/api/compareSizes", function(xhr) {
        SizeMe.trackEvent("match", "API: match");
        return successCallback(createFitResponse(xhr));
      }, function(xhr) {
        return errorCallback(xhr, xhr.status, xhr.statusText);
      });
      if (xhr.setRequestHeader != null) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }
      xhr.send(data);
      return void 0;
    };


    /*
      Open the login frame and set the callback function for logging in
    
      @param loggedInCallback [Function]
        the function to execute when user logs themselves in
     */

    SizeMe.loginFrame = function(callback) {
      var cb, options, url;
      url = SizeMe.contextAddress + "/remote-login.html";
      options = "height=375,width=349,left=200,top=200,location=no,menubar=no, resizable=no,scrollbars=no,toolbar=no";
      cb = function(e) {
        if (e.origin === SizeMe.contextAddress) {
          removeMessageListener(cb);
          if (e.data) {
            SizeMe.trackEvent("apiLogin", "API: login");
            return callback();
          }
        }
      };
      addMessageListener(cb);
      window.open(url, "loginframe", options);
      SizeMe.trackEvent("loginFrame", "API: loginFrame");
    };


    /*
      Logout from SizeMe
    
      @param callback [Function]
        callback to execute after logout
     */

    SizeMe.logout = function(callback) {
      var cb, iframe;
      iframe = document.createElement("iframe");
      cb = function(event) {
        if (event.origin === SizeMe.contextAddress && event.data === "logout") {
          removeMessageListener(cb);
          document.body.removeChild(iframe);
          SizeMe.trackEvent("apiLogout", "API: logout");
          if (callback != null) {
            callback();
          }
        }
      };
      addMessageListener(cb);
      iframe.setAttribute("src", SizeMe.contextAddress + "/remote-logout");
      iframe.setAttribute("style", "display:none");
      return document.body.appendChild(iframe);
    };

    return SizeMe;

  })();


  /*
    A simple map implementation to help pass the item properties to server
   */

  SizeMe.Map = (function() {
    function Map() {}


    /*
      Returns the keys of this map as an array
      @return [Array]
     */

    Map.prototype.keys = function() {
      var k, results;
      results = [];
      for (k in this) {
        if (!hasProp.call(this, k)) continue;
        results.push(k);
      }
      return results;
    };


    /*
      Executes the callback function for each key in this map. The key and the
      value corresponding to the key are passed as parameters to the callback
      function. The value is also binded as <b>this</b> in the scope of the
      callback
    
      @param [Function] f the callback function
     */

    Map.prototype.each = function(f) {
      var k, v;
      for (k in this) {
        if (!hasProp.call(this, k)) continue;
        v = this[k];
        f(k, v);
      }
      return void 0;
    };


    /*
      Adds an item to this map. Returns itself so that this method can be used
      in a chain.
    
      @param [*] key the key for the value
      @param [*] value value to be added
      @return [SizeMe.Map]
     */

    Map.prototype.addItem = function(key, value) {
      this[key] = value;
      return this;
    };


    /*
      Adds multiple items at a time to this map. Returns itself so that this
      method can be used in a chain.
    
      @param [*] arguments
        items to add as key/value-pairs, ie. key1, value1, key2, value2, ...
      @return [SizeMe.Map]
     */

    Map.prototype.addItems = function() {
      var i, items, j, ref;
      items = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (items.length % 2 !== 0) {
        throw new Error('Arguments must be "tuples" (example: (key1, value1, key2, value2, ...)');
      }
      for (i = j = 0, ref = items.length; j < ref; i = j += 2) {
        this.addItem(items[i], items[i + 1]);
      }
      return this;
    };


    /*
      Creates a new SizeMe.Map from an arbitrary object
    
      @param [Object] obj the object to transform
     */

    Map.fromObject = function(obj) {
      var k, map, v;
      map = new SizeMe.Map();
      for (k in obj) {
        if (!hasProp.call(obj, k)) continue;
        v = obj[k];
        map.addItem(k, v);
      }
      return map;
    };

    return Map;

  })();


  /*
      Request object used to make the match requests to the server
   */

  SizeMe.FitRequest = (function() {

    /*
      @param [String] profileId the id of the profile
      @param [SizeMe.Item] item object containing the item information
     */
    function FitRequest(profileId, item) {
      this.profileId = profileId;
      this.item = item;
    }

    return FitRequest;

  })();


  /*
  A class for holding the information for specific item.
   */

  SizeMe.Item = (function() {

    /*
      @param [String] itemType the type of the Item
      @param [Number] itemLayer optional layer information
      @param [Number] itemThickness optional thickness value of the Item
      @param [Number] itemStretch optional stretch value of the Item
     */
    function Item(itemType, itemLayer, itemThickness, itemStretch) {
      this.itemType = itemType;
      this.itemLayer = itemLayer != null ? itemLayer : 0;
      this.itemThickness = itemThickness != null ? itemThickness : 0;
      this.itemStretch = itemStretch != null ? itemStretch : 0;
      this.measurements = new SizeMe.Map();
    }


    /*
      Adds a new size information to this item.
    
      @param {*} size the label for the size
      @param {SizeMe.Map} measurements a map of "property->measurement" pairs.
      @return {SizeMe.Item}
      @deprecated Use addOption instead
     */

    Item.prototype.addSize = function(size, measurements) {
      this.measurements.addItem(size, measurements);
      return this;
    };


    /*
      Adds a new selection option to this item.
    
      @param {*} label the label for the option
      @param {SizeMe.Map} measurements a map of "property->measurement" pairs.
      @return {SizeMe.Item}
     */

    Item.prototype.addOption = function(label, measurements) {
      this.measurements.addItem(label, measurements);
      return this;
    };

    return Item;

  })();

  SizeMe.FitRange = (function() {
    var ranges;

    function FitRange() {}

    ranges = {
      too_small: {
        start: 0,
        end: 1000
      },
      slim: {
        start: 1000,
        end: 1050
      },
      regular: {
        start: 1050,
        end: 1110
      },
      loose: {
        start: 1110,
        end: 1170
      },
      too_big: {
        start: 1170,
        end: 99990
      }
    };

    FitRange.getFitRangeLabels = function() {
      return ranges;
    };

    FitRange.getFitRangeLabel = function(fitValue) {
      var label, range, result;
      result = (function() {
        var results;
        results = [];
        for (label in ranges) {
          if (!hasProp.call(ranges, label)) continue;
          range = ranges[label];
          if (range.start <= fitValue && range.end > fitValue) {
            results.push(label);
          }
        }
        return results;
      })();
      return result;
    };

    return FitRange;

  })();

  window.SizeMe = SizeMe;

}).call(this);

(function(window) {
    "use strict";

    var SizeMeI18N = function (defaultLang) {
        var defLang = defaultLang || "en";

        var languages = {};
        languages[defLang] = {};

        this.add = function (lang, langObj) {
            languages[lang] = langObj;
        };

        this.get = function (lang) {
            return languages[lang] || languages[defLang];
        };
    };

    window.SizeMeI18N = new SizeMeI18N("en");

})(window);
(function (window) {
    "use strict";

    window.SizeMeI18N.add("en",
        {
            FIT_VERDICT: {
                not_fitted: "Too small",
                too_small: "Too small",
                slim: "Slim",
                regular: "Regular",
                loose: "Loose",
                very_loose: "Very loose",
                huge: "Huge",
                too_big: "Too big"
			},
            FIT_VERDICT_LONG: {
                not_fitted: "Too short",
                too_small: "Too short",
                slim: "Short",
                regular: "Regular",
                loose: "Long",
                very_loose: "Very long",
                huge: "Huge",
                too_big: "Too long"
            },
			MEASUREMENT: {
                chest: "Chest",
                waist: "Waist",
                sleeve: "Sleeve",
                sleeve_top_width: "Sleeve top",
                sleeve_top_opening: "Sleeve top opening",
                wrist_width: "Wrist",
                underbust: "Underbust",
                neck_opening_width: "Collar",
                shoulder_width: "Shoulder",
                front_height: "Front height",
                pant_waist: "Pant waist",
                hips: "Hips",
                inseam: "Inseam",
                outseam: "Outseam",
                thigh_width: "Thigh",
                knee_width: "Knee",
                calf_width: "Calf",
                pant_sleeve_width: "Leg opening",
                shoe_inside_length: "Shoe length",
                shoe_inside_width: "Shoe width",
                hat_width: "Hat circumference",
                hood_height: "Hood height",
				hem: "Hem",
				sleeve_opening: "Sleeve opening"
            },
			COMMON: {
				shopping_for: "Shopping for",
				selected_size: "Selected size",
				is: "is",	// verb
				add_to_profile: "Add to profile",
				size: "Size",
				fetching_profiles: "Fetching profiles...",
				close_text: "Close",
				go_to: "Go to",
				my_profiles: "My Profiles",
				and_create_one: "and create one."	// as in: go to my profiles and create one
			},
			MESSAGE: {
				add_profiles: "Add profiles to your account for a size recommendation.",
				missing_measurements: "Add more measurements to your profile for increased accuracy",
				no_measurements: "Add measurements to your profile for a size recommendation.",
				add_this_measurement: "Add this measurement to your profile to include it in the fit calculation.",
				no_profiles: "You have no profiles on your account.",
				no_top_button: "The shirt's top button for this size won't close."
			},
			DETAILED: {
				window_title: "Detailed View for",
				button_text: "Detailed view of fit",
				table_title: "Detailed fit - overlaps"
			},
			SIZE_GUIDE: {
				window_title: "Size Guide for",
				button_text: "Size guide",
				table_title: "Actual item measurements",
				measurement_disclaimer: "These measurements are measured <u>flat across the outside of the item</u>.",
				measurement_disclaimer_collar: "Except for the collar measurement, which is measured around the inside of the collar.",
				measurement_disclaimer_inside: "These measurements are measured <u>inside the item</u>.",
				advertisement: "This size guide is brought to you by"
			},
			FIT_INFO: {
				when_pinched: " when pinched",
				stretched_little: "The item is stretched a little.",
				stretched_somewhat: "The item is stretched.",
				stretched_much: "The item is stretched a lot.",
				stretched_max: "The item is stretched to the max.",
				the_item: "The item's",
				the_measurement: "measurement",
				no_overlap: "is directly on you with no overlap.",
				is_smaller: "is <u>smaller</u> than your matching measurement by",
				overlaps_you: "overlaps you by",
				arm_sleeve_straight: "when your arm and the item's sleeve are <u>completely straight</u>",
				sm_considers_fit: "SizeMe considers this particular fit",
				overall_fit: "Overall fit",
				overall_fit_for_size: "The overall fit for <b>size"
			},
			SPLASH: {
				detailed_text: "Take a few <b>measurements of yourself</b> and get personalized info on how this item would <b>fit you</b>.<br />Create a free <b>SizeMe</b> profile and stop guessing!",
				btn_sign_up_title: "Sign up",
				btn_sign_up_label: "Yes, I'd like to create a free account",
				btn_log_in_title: "Log in",
				btn_log_in_label: "I already have an account",
				btn_no_thanks_title: "No thanks",
				btn_no_thanks_label: "Maybe later",
				product_page_splashes: ["Unsure about the right size? Try"],
				product_page_splash_title: "SizeMe is a free service to help you know how this item will fit _you_"
			}
        }
    );

})(window);
(function (window) {
    "use strict";

    window.SizeMeI18N.add("fi",
        {
            FIT_VERDICT: {
                not_fitted: "Pieni",
                too_small: "Pieni",
                slim: "Kapea",
                regular: "Normaali",
                loose: "Väljä",
                very_loose: "Erittäin väljä",
                huge: "Valtava",
                too_big: "Liian iso"
			},
            FIT_VERDICT_LONG: {
                not_fitted: "Liian lyhyt",
                too_small: "Liian lyhyt",
                slim: "Lyhyehkö",
                regular: "Normaali",
                loose: "Pitkähkö",
                very_loose: "Pitkä",
                huge: "Valtava",
                too_big: "Liian pitkä"
            },
			MEASUREMENT: {			
                chest: "Rinta",
                waist: "Vyötärö",
                sleeve: "Hiha",
                sleeve_top_width: "Hihan yläosa",
                sleeve_top_opening: "Hihan leveys",
                wrist_width: "Ranne",
                underbust: "Rinnan alta",
                neck_opening_width: "Kaulus",
                shoulder_width: "Hartia",
                front_height: "Etupituus",
                pant_waist: "Housun vyötärö",
                hips: "Lantio",
                inseam: "Sisäsauma",
                outseam: "Ulkosauma",
                thigh_width: "Reisi",
                knee_width: "Polvi",
                calf_width: "Pohje",
                pant_sleeve_width: "Lahje",
                shoe_inside_length: "Sisäpituus",
                shoe_inside_width: "Sisäleveys",
                hat_width: "Ympärysmitta",
                hood_height: "Hupun korkeus",
				hem: "Helma",
				sleeve_opening: "Hihan suu"				
            },
			COMMON: {
				shopping_for: "Aktiivinen profiili",
				selected_size: "Valittu koko",
				is: "on",	// verb
				add_to_profile: "Lisää profiiliin",
				size: "Koko",
				fetching_profiles: "Haetaan profiileja...",
				close_text: "Sulje",
				go_to: "Mene",
				my_profiles: "Profiili-sivulleni",
				and_create_one: "ja luo profiili."	// as in: go to my profiles and create one
			},
			MESSAGE: {
				add_profiles: "Lisää mittaprofiili kokosuositusta varten.",
				missing_measurements: "Lisää mittoja profiiliisi tarkempaa tulosta varten",
				no_measurements: "Lisää mittoja profiiliisi kokosuositusta varten.",
				add_this_measurement: "Lisää tämä mitta profiilisi tarkempaa tulosta varten.",
				no_profiles: "Tililläsi ei ole yhtään mittaprofiilia.",
				no_top_button: "Paidan ylin nappi ei tässä koossa mene kiinni."
			},
			DETAILED: {
				window_title: "Sopivuustiedot tuotteelle",
				button_text: "Sopivuustiedot",
				table_title: "Sopivuustiedot"
			},
			SIZE_GUIDE: {
				window_title: "Kokotaulukko tuotteelle",
				button_text: "Kokotaulukko",
				table_title: "Tuotteen mitat",
				measurement_disclaimer: "Nämä mitat on otettu <u>tuotteen päältä tasaisella alustalla</u>.",
				measurement_disclaimer_collar: "Paitsi kaulus, joka on ympärysmitta kauluksen sisäpuolelta.",
				measurement_disclaimer_inside: "Nämä mitat on otettu <u>tuotteen sisältä</u>.",
				advertisement: "Tämän kokotaulukon toimittaa"
			},
			FIT_INFO: {
				when_pinched: " nipistettynä sormien väliin",
				stretched_little: "Tuote venyy vähän.",
				stretched_somewhat: "Tuote venyy.",
				stretched_much: "Tuote venyy kunnolla.",
				stretched_max: "Tuote venyy huolella.",
				the_item: "Tuotteen",
				the_measurement: "-mitta",
				no_overlap: "on suoraan sinua vasten.",
				is_smaller: "on sinun omaa mittaasi <u>pienempi</u>",
				overlaps_you: "ylittää mittasi",
				arm_sleeve_straight: "kun kätesi ja tuotteen hiha on <u>suoraan alaspäin</u>",
				sm_considers_fit: "SizeMe:n mielestä tämä sopivuus on",
				overall_fit: "Sopivuus",				
				overall_fit_for_size: "Sopivuus <b>koolle"
			},
			SPLASH: {
				detailed_text: "Ota <b>muutama mitta</b> itsestäsi ja näe miten tämä tuote <b>sopisi sinulle</b>.<br />Luo oma <b>SizeMe</b>-tunnus ja lopeta arvailu!",
				btn_sign_up_title: "Liityn mukaan",
				btn_sign_up_label: "Jep, haluan luoda oman tunnuksen",
				btn_log_in_title: "Kirjaudu",
				btn_log_in_label: "Minulla on jo oma tunnus",
				btn_no_thanks_title: "Ei kiitos",
				btn_no_thanks_label: "Ehkä myöhemmin",
				product_page_splashes: ["Haluatko apua oikean koon valitsemisessa? Kokeile"],
				product_page_splash_title: "SizeMe-palvelu kertoo miten tämä tuote sopii juuri _sinulle_"
			}
        }
    );

})(window);
// SizeMe UI JS v1.0
// based on SizeMe Item Types 2015-10-01
// (c) SizeMe Inc.
// www.sizeme.com
// License undecided
/* jshint browser:true, jquery:true */
/* globals sizeme_product: false, sizeme_options: false, sizeme_UI_options: false, Opentip: false, SizeMe: false */

(function($) {
    "use strict";

	var i18n = {};

    var FIT_RANGES = {
        1: {label: "too_small", arrowColor: "#999999"},
        940: {label: "too_small", arrowColor: "#BB5555"},
        1000: {label: "slim", arrowColor: "#457A4C"},
        1055: {label: "regular", arrowColor: "#42AE49"},
        1110: {label: "loose", arrowColor: "#87B98E"},
        1165: {label: "too_big", arrowColor: "#BB5555"},
        1225: {label: "too_big", arrowColor: "#BB5555"}
    };
	
    var FIT_RANGES_LESS_IMPORTANCE = {
        1: {label: "too_small", arrowColor: "#999999"},
        940: {label: "too_small", arrowColor: "#BB5555"},
        1000: {label: "slim", arrowColor: "#457A4C"},
        1055: {label: "regular", arrowColor: "#42AE49"},
        1110: {label: "loose", arrowColor: "#87B98E"}
    };

    var sliderPosXMin = 940;
    var sliderPosXMax = 1225;
	var sliderScale = 100 / (sliderPosXMax - sliderPosXMin);

    var FIT_ORDER = [
        "chest",
        "waist",
        "underbust",
        "pant_waist",
        "hips",
        "inseam",
        "outseam",
        "thigh_width",
        "knee_width",
        "calf_width",
        "pant_sleeve_width",
        "neck_opening_width",
        "shoulder_width",
        "sleeve_top_width",
        "sleeve_top_opening",
        "sleeve",
        "wrist_width",
        "front_height",
        "shoe_inside_length",
        "shoe_inside_width",
        "hat_width",
        "hood_height"
    ];

    var PINCHED_FITS = [
        "chest",
        "waist",
        "underbust",
        "pant_waist",
        "hips",
        "thigh_width",
        "knee_width",
        "calf_width",
        "pant_sleeve_width",
        "neck_opening_width",
        "sleeve_top_width",
        "sleeve_top_opening",
        "wrist_width",
        "hat_width"
    ];

    var LONG_FITS = [
        "inseam",
        "outseam",
        "sleeve",
        "front_height",
		"shoe_inside_length"
    ];

    var OPTIMAL_FIT = 1070;

    var realCanvasWidth = 350;
    var realCanvasHeight = 480;
    var padding = 0.07;

    var drawColor = '#777777';
    var fillColor = '#BBBBBB';
    var arrowColor;
    var arrowColorGreen = '#42AE49';
    var arrowColorBlack = '#000000';
    var arrowColorInfo = '#666666';

    var itemLineWidth = 1;
    var arrowLineWidth = 2;
    var arrowEndRadius = 4;
    var arrowNumberRadius = 10;
    var arrowNumberFont = "10px sans-serif";
    var arrowNumberHighlightFont = "bold 14px sans-serif";
    var arrowLift = 30;
    var arcRadius = 10;

    var fadeLength = 400;

    var item_drawing = {};
    var measurement_arrows = {};

    var sizeKeys = [];

    var recommendedId;
    var recommendedLabel = "none";

    var selectedProfile;
    var linkToSelectedProfile;

    var accuracyThreshold = 0.01;

    var cookieLifetime = 90;

    var itemName = "";

    var sizeme_local_options = {
        fitAreaSlider: true,
        writeMessages: true,
        writeOverlaps: true,
		firstRecommendation: true
    };

    function sizeText(txt) {
        var retStr = txt;
        retStr = retStr.split(" -")[0];
        retStr = retStr.split(" +")[0];
        return retStr;
    }

    function getFit(fitValue, importance) {
        var returnFit, singleFit;
		var ranges;
		ranges = FIT_RANGES_LESS_IMPORTANCE;
		if (importance == 1) ranges = FIT_RANGES;
        for (singleFit in ranges) {
            if (ranges.hasOwnProperty(singleFit)) {
                if (fitValue < singleFit) {
                    if (returnFit) {
                        return returnFit;
                    }
                    return ranges[singleFit];
                }
                returnFit = ranges[singleFit];
            }
        }
        return returnFit;
    }

    function addIds(parentElement) {
        // add ids to select for easy handling
        $(parentElement + " option").each(function () {
            var myVal = $(this).val();
            var myText = $(this).text();
            $(this).addClass("sm-selectable element_for_" + myVal);
            this.id = (myVal ? "input_" + myVal : "choose");
            if (myVal) {
				if (typeof sizeme_product !== "undefined") {
					if (sizeme_product.item.measurements[myVal]) {
						sizeKeys.push({key: myVal, sizeLabel: myText});
					}
				}
            }
        });
    }

	function getItemTypeArr() {
		var itemTypeStr = sizeme_product.item.itemType.toString();
		var itemTypeArr = [0,0,0,0,0,0,0];
		var separator = '';
		if (itemTypeStr.indexOf('.') > -1) separator = '.';
		var itemTypeSplitted = itemTypeStr.split(separator, 7);
		for(var i=0; i<itemTypeSplitted.length;i++) itemTypeArr[i] = +itemTypeSplitted[i];
		return itemTypeArr;
	}
	
    function isInside() {
        var itemTypeArr = getItemTypeArr();
        return ( (itemTypeArr[0] === 3) || (itemTypeArr[0] === 4) );
    }

    function loadArrows(isSizeGuide) {
        var $i, $x;
		var itemTypeArr = getItemTypeArr();

        // arrows first
        arrowColor = arrowColorGreen;
        var arcStyle = "arc";

        if (isSizeGuide) {
            arrowColor = arrowColorBlack;
            arcStyle = "line"; // size guide shows flat measurements (except neck opening)
        }

        measurement_arrows.chest = { mirror: false, coords: [{X: -250,Y: 399},{X: 250,Y: 399}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.waist = { mirror: false, coords: [{X: -250,Y: 635},{X: 250,Y: 635}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.front_height = { mirror: false, coords: [{X: -174,Y: 0},{X: -174,Y: 978}], style: "line", lift: false, color: arrowColor };
        measurement_arrows.neck_opening_width = {
            mirror: false,
            coords: [{X: 0,Y: 47}, {X: 174,Y: 0, cp1X: 65, cp1Y: 45, cp2X: 140, cp2Y: 23}, {X: 0,Y: 100, cp1X: 150, cp1Y: 46, cp2X: 50, cp2Y: 92},
                {X: -174,Y: 0, cp1X: -50, cp1Y: 92, cp2X: -150, cp2Y: 46}, {X: 0,Y: 47, cp1X: -140, cp1Y: 23, cp2X: -65, cp2Y: 45}],
            style: "line",
            lift: true,
            color: arrowColor};

        measurement_arrows.hood_height = { mirror: false, coords: [{X: 195,Y: -5},{X: 195,Y: -390}], style: "line", lift: false, color: arrowColor };
        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -329,Y: 42},{X: -164,Y: -7}], style: "line", lift: true, color: arrowColor };

        measurement_arrows.pant_waist = { mirror: false, coords: [{X: -232,Y: 0},{X: 222,Y: 0}], style: arcStyle, lift: true, color: arrowColor };
        measurement_arrows.hips = { mirror: false, coords: [{X: -261,Y: 171}, {X: 263,Y: 171}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.outseam = { mirror: false, coords: [{X: 222,Y: 0},{X: 263,Y: 171},{X: 302,Y: 1071}], style: "line", lift: true, color: arrowColor };
        measurement_arrows.inseam = { mirror: false, coords: [{X: 5,Y: 297},{X: 151, Y: 1084}], style: "line", lift: false, color: arrowColor };
        measurement_arrows.thigh_width = { mirror: false, coords: [{X: -266,Y: 274},{X: -17,Y: 297}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.knee_width = { mirror: false, coords: [{X: -286,Y: 727},{X: -93,Y: 744}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.pant_sleeve_width = { mirror: false, coords: [{X: -301,Y: 1071},{X: -152,Y: 1084}], style: arcStyle, lift: false, color: arrowColor };

        measurement_arrows.shoe_inside_length = { mirror: false, coords: [{X: 169,Y: 984},{X: 132,Y: 18}], style: "line", lift: false, color: arrowColor };

        measurement_arrows.hat_width = {
            mirror: false,
            coords: [{X: 534,Y: 238},
                {X: 539,Y: 265, cp1X: 559, cp1Y: 236, cp2X: 567, cp2Y: 252},
                {X: 70,Y: 262, cp1X: 352, cp1Y: 353, cp2X: 223, cp2Y: 351},
                {X: 77,Y: 242, cp1X: 38, cp1Y: 241, cp2X: 60, cp2Y: 234}],
            midCircle: {X: 300, Y: 325},
            style: "line",
            lift: false,
            color: arrowColor };

        item_drawing.mirror = true;
        item_drawing.coords = [];
        item_drawing.accents = [];
        // load item drawing
        switch (itemTypeArr[0]) {

            case 1:	// shirts/coats
                i18n.MEASUREMENT.hips = i18n.MEASUREMENT.hem;
                i18n.MEASUREMENT.pant_waist = i18n.MEASUREMENT.hem;

                switch (itemTypeArr[1]) { // collar
                    case 2:	// tight (turnover)
                        item_drawing.coords.push({X: 0,Y: -60},{X: 119,Y: -48, cp1X: 68, cp1Y: -60, cp2X: 106, cp2Y: -57}, {X: 128,Y: 0});
                        item_drawing.accents.push({type: "area", coords: [	{X: 0,Y: -47},
                            {X: 100,Y: -35, cp1X: 64, cp1Y: -48, cp2X: 105, cp2Y: -47},
                            {X: -5,Y: 59, cp1X: 66, cp1Y: 8, cp2X: 6, cp2Y: 40},
                            {X: -104,Y: -34, cp1X: -25, cp1Y: 32, cp2X: -93, cp2Y: -12},
                            {X: 0,Y: -46, cp1X: -117, cp1Y: -48, cp2X: -52, cp2Y: -48}
                        ], noMirror: true});
                        item_drawing.accents.push({type: "line", coords:[	{X: 129,Y: 0},
                            {X: 136,Y: 26, cp1X: 132, cp1Y: 14, cp2X: 133, cp2Y: 18},
                            {X: 78,Y: 125, cp1X: 123, cp1Y: 63, cp2X: 100, cp2Y: 95},
                            {X: 37,Y: 78, cp1X: 60, cp1Y: 106, cp2X: 51, cp2Y: 101},
                            {X: -12,Y: 111, cp1X: 24, cp1Y: 8, cp2X: -32, cp2Y: 66}
                        ], noMirror: true});	// non mirrored turnover collar right
                        item_drawing.accents.push({type: "line", coords:[	{X: -129,Y: 0},
                            {X: -136,Y: 26, cp1X: -132, cp1Y: 14, cp2X: -133, cp2Y: 18},
                            {X: -90,Y: 127, cp1X: -127, cp1Y: 68, cp2X: -106, cp2Y: 110},
                            {X: -9,Y: 59, cp1X: -33, cp1Y: 88, cp2X: -61, cp2Y: 25}
                        ], noMirror: true});	// non mirrored turnover collar left
                        item_drawing.accents.push({type: "circle", coords: [{X: 0,Y: 100, R: 5}]});
                        measurement_arrows.neck_opening_width = {
                            mirror: false,
                            coords: [{X: 0,Y: -47}, {X: 100,Y: -35, cp1X: 64, cp1Y: -48, cp2X: 105, cp2Y: -47},
                                {X: -5,Y: 59, cp1X: 66, cp1Y: 8, cp2X: 6, cp2Y: 40}, {X: -104,Y: -34, cp1X: -25, cp1Y: 32, cp2X: -93, cp2Y: -12},
                                {X: 0,Y: -46, cp1X: -117, cp1Y: -48, cp2X: -52, cp2Y: -48}],
                            style: "line",
                            lift: false,
                            midCircle: {X: 0, Y: -47},
                            color: arrowColor};
                        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -329,Y: 49},{X: -129,Y: -5}], style: "line", lift: true, color: arrowColor };
                        measurement_arrows.front_height = { mirror: false, coords: [{X: -167,Y: -4},{X: -167,Y: 978}], style: "line", lift: false, color: arrowColor };

                        break;
                    case 3:	// hood
                        item_drawing.coords.push({X: 0,Y: -390},{X: 185,Y: 6, cp1X: 180, cp1Y: -400, cp2X: 160, cp2Y: -20});
                        item_drawing.accents.push({type: "line", coords: [{X: 185,Y: 6}, {X: 0,Y: 123, cp1X: 140, cp1Y: 70, cp2X: 70, cp2Y: 100}]});	// basic round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: -320}, {X: 144,Y: 0, cp1X: 150, cp1Y: -320, cp2X: 140, cp2Y: -20}, {X: 0,Y: 100, cp1X: 140, cp1Y: 46, cp2X: 40, cp2Y: 92}]}); // hood area
                        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -329,Y: 42},{X: -174,Y: -7}], style: "line", lift: true, color: arrowColor };
                        break;
                    case 5:	// open high round
                        item_drawing.coords.push({X: 0,Y: 90},{X: 189,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 210,Y: 6}, {X: 0,Y: 123, cp1X: 165, cp1Y: 70, cp2X: 100, cp2Y: 123}]});	// open round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 49}, {X: 189,Y: 0, cp1X: 100, cp1Y: 47, cp2X: 155, cp2Y: 23}, {X: 0,Y: 102, cp1X: 165, cp1Y: 46, cp2X: 95, cp2Y: 102}]}); // open collar area
                        break;
                    case 6:	// open low round
                        item_drawing.coords.push({X: 0,Y: 180},{X: 164,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 181,Y: 5}, {X: 0,Y: 196, cp1X: 146, cp1Y: 196, cp2X: 50, cp2Y: 196}]});	// collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 164,Y: 0, cp1X: 55, cp1Y: 45, cp2X: 130, cp2Y: 23}, {X: 0,Y: 180, cp1X: 130, cp1Y: 180, cp2X: 45, cp2Y: 180}]}); // basic area
                        break;
                    case 7:	// v-style high
                        item_drawing.coords.push({X: 0,Y: 90},{X: 189,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 210,Y: 6}, {X: 0,Y: 123, cp1X: 165, cp1Y: 70, cp2X: 80, cp2Y: 100}]});	// open round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 189,Y: 0, cp1X: 80, cp1Y: 45, cp2X: 155, cp2Y: 23}, {X: 0,Y: 100, cp1X: 165, cp1Y: 46, cp2X: 65, cp2Y: 92}]}); // open collar area
                        break;
                    case 8:	// v-style low
                        item_drawing.coords.push({X: 0,Y: 90},{X: 189,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 210,Y: 6}, {X: 0,Y: 123, cp1X: 165, cp1Y: 70, cp2X: 80, cp2Y: 100}]});	// open round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 189,Y: 0, cp1X: 80, cp1Y: 45, cp2X: 155, cp2Y: 23}, {X: 0,Y: 100, cp1X: 165, cp1Y: 46, cp2X: 65, cp2Y: 92}]}); // open collar area
                        break;
                    default:	// elastic round
                        item_drawing.coords.push({X: 0,Y: 90},{X: 164,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 185,Y: 6}, {X: 0,Y: 110, cp1X: 140, cp1Y: 70, cp2X: 70, cp2Y: 108}]});	// basic round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 164,Y: 0, cp1X: 55, cp1Y: 45, cp2X: 130, cp2Y: 23}, {X: 0,Y: 90, cp1X: 140, cp1Y: 46, cp2X: 55, cp2Y: 90}]}); // basic area
                        break;
                }

                switch (itemTypeArr[3]) { // sleeve length
                    case 0:	// tank top, string top or poncho
                    case 1:	// very short (vest)
                        item_drawing.coords.push({X: 289,Y: 34});
                        item_drawing.coords.push({X: 250,Y: 399, cp1X: 285, cp1Y: 44, cp2X: 220, cp2Y: 389});
                        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -299,Y: 32},{X: -164,Y: -7}], style: "line", lift: true, color: arrowColor };
						measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 289,Y: 34}], style: arcStyle, lift: false, color: arrowColor };

                        if (itemTypeArr[4] !== 0) {
							// is it you, poncho?
                            item_drawing.coords.push({X: 250,Y: 399, cp1X: 328, cp1Y: 44, cp2X: 250, cp2Y: 260});
                            FIT_ORDER.splice(13, 1);  // remove sleeve top
                            measurement_arrows.sleeve_top_width = false;
                        }
                        break;
                    case 2:  // short
                    case 3:  // short-medium (normal t-shirt)
                        item_drawing.coords.push({X: 329,Y: 44});
                        item_drawing.coords.push({X: 482,Y: 460},{X: 324,Y: 529});
                        item_drawing.coords.push({X: 250,Y: 399});

                        measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 430,Y: 322}], style: arcStyle, lift: false, color: arrowColor };
                        measurement_arrows.wrist_width = { mirror: false, coords: [{X: 324,Y: 529},{X: 482,Y: 460}], style: arcStyle, lift: false, color: arrowColor };
						
                        i18n.MEASUREMENT.wrist_width = i18n.MEASUREMENT.sleeve_opening;

						switch (itemTypeArr[2]) { // shoulder types
							case 3:	// dropped
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 381,Y: 184}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 482,Y: 460}], style: "line", lift: true, midCircle: {X: 406, Y: 243}, color: arrowColor };
								break;
							case 2:	// raglan line
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 185,Y: 6, cp1X: 220, cp1Y: 320, cp2X: 185, cp2Y: 6}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 482,Y: 460}], style: "line", lift: true, midCircle: {X: 406, Y: 243}, color: arrowColor };
								break;
							case 1:	// normal shoulder line
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 329,Y: 44},{X: 482,Y: 460}], style: "line", lift: true, color: arrowColor };
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 329,Y: 44, cp1X: 250, cp1Y: 250, cp2X: 300, cp2Y: 70}]});
								break;
						}
                        break;
                    case 4:  // medium
                    case 5:  // semi-long
                        item_drawing.coords.push({X: 329,Y: 44});
                        item_drawing.coords.push({X: 527,Y: 719},{X: 389,Y: 769});
                        item_drawing.coords.push({X: 250,Y: 399});

                        measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 419,Y: 340}], style: arcStyle, lift: false, color: arrowColor };
                        measurement_arrows.wrist_width = { mirror: false, coords: [{X: 389,Y: 769},{X: 527,Y: 719}], style: arcStyle, lift: false, color: arrowColor };
						
                        i18n.MEASUREMENT.wrist_width = i18n.MEASUREMENT.sleeve_opening;

						switch (itemTypeArr[2]) { // shoulder types
							case 3:	// dropped
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 369,Y: 196}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 527,Y: 719}], style: "line", lift: true, midCircle: {X: 450, Y: 444}, color: arrowColor };
								break;
							case 2:	// raglan line
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 185,Y: 6, cp1X: 220, cp1Y: 320, cp2X: 185, cp2Y: 6}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 527,Y: 719}], style: "line", lift: true, midCircle: {X: 450, Y: 444}, color: arrowColor };
								break;
							case 1:	// normal shoulder line
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 329,Y: 44},{X: 527,Y: 719}], style: "line", lift: true, color: arrowColor };
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 329,Y: 44, cp1X: 250, cp1Y: 250, cp2X: 300, cp2Y: 70}]});
								break;
						}
						break;
                    case 6:  // long
                    case 7:  // very long
                    case 8:  // extra long
                        item_drawing.coords.push({X: 329,Y: 44});
						measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 410,Y: 348}], style: arcStyle, lift: false, color: arrowColor };

                        if (itemTypeArr[4] === 1) {	// elastic
                            item_drawing.coords.push({X: 556,Y: 902},{X: 547,Y: 930}, {X: 557,Y: 978},{X: 463,Y: 998},{X: 449,Y: 951},{X: 430,Y: 934});
                            item_drawing.accents.push({type: "line", coords: [{X: 465,Y: 944}, {X: 476,Y: 996}]},
                                {type: "line", coords: [{X: 476,Y: 941}, {X: 487,Y: 993}]},
                                {type: "line", coords: [{X: 487,Y: 938}, {X: 498,Y: 990}]},
                                {type: "line", coords: [{X: 498,Y: 935}, {X: 509,Y: 987}]},
                                {type: "line", coords: [{X: 509,Y: 932}, {X: 520,Y: 984}]},
                                {type: "line", coords: [{X: 520,Y: 929}, {X: 531,Y: 981}]},
                                {type: "line", coords: [{X: 531,Y: 926}, {X: 542,Y: 978}]});
                            item_drawing.coords.push({X: 250,Y: 399});
                            measurement_arrows.wrist_width = { mirror: false, coords: [{X: 430,Y: 934}, {X: 556,Y: 902}], style: arcStyle, lift: false, color: arrowColor };
                        } else {
                            item_drawing.coords.push({X: 571,Y: 978},{X: 454,Y: 1009});
                            item_drawing.coords.push({X: 250,Y: 399});
							measurement_arrows.wrist_width = { mirror: false, coords: [{X: 571,Y: 978},{X: 454,Y: 1009}], style: arcStyle, lift: false, color: arrowColor };
                        }

						switch (itemTypeArr[2]) { // shoulder types
							case 3:	// dropped
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 369,Y: 196}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 571,Y: 978}], style: "line", lift: true, midCircle: {X: 437, Y: 444}, color: arrowColor };
								break;
							case 2:	// raglan line
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 185,Y: 6, cp1X: 220, cp1Y: 320, cp2X: 185, cp2Y: 6}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 571,Y: 978}], style: "line", lift: true, midCircle: {X: 437, Y: 444}, color: arrowColor };
								break;
							case 1:	// normal shoulder line
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 329,Y: 44},{X: 569,Y: 975}], style: "line", lift: true, color: arrowColor };
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 329,Y: 44, cp1X: 250, cp1Y: 250, cp2X: 300, cp2Y: 70}]});
								break;
						}
                        break;
                }

                switch (itemTypeArr[5]) { // waistband
                    case 0:	// poncho dude
                        item_drawing.coords.push({X: 550,Y: 750, cp1X: 450, cp1Y: 70, cp2X: 450, cp2Y: 550});
                        item_drawing.coords.push({X: 0,Y: 1038, cp1X: 450, cp1Y: 800, cp2X: 400, cp2Y: 1038});
                        measurement_arrows.front_height = { mirror: false, coords: [{X: -174,Y: 5},{X: -174,Y: 1018}], style: "line", lift: false, color: arrowColor };
                        measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: 0}, {X: 394,Y: 59},{X: 550,Y: 750}], style: "line", lift: true, midCircle: {X: 480, Y: 444}, color: arrowColor };
                        break;
                    case 3:	// pant waist
                        if (itemTypeArr[6] === 1) {	// elastic
                            item_drawing.coords.push({X: 250,Y: 908, cp1X: 247, cp1Y: 402, cp2X: 247, cp2Y: 858},{X: 230,Y: 978},{X: 0,Y: 978});
                            for ($i = 0; $i<15; $i++) {
                                $x = Math.round(($i+0.5)*(230/15));
                                item_drawing.accents.push({type: "line", coords: [{X: $x,Y: 918}, {X: $x,Y: 978}]});
                            }
                            measurement_arrows.pant_waist = { mirror: false, coords: [{X: -250,Y: 908}, {X: 250,Y: 908}], style: arcStyle, lift: false, color: arrowColor };
                        } else {
                            item_drawing.coords.push({X: 250,Y: 978, cp1X: 245, cp1Y: 402, cp2X: 245, cp2Y: 928},{X: 0,Y: 978});
                            measurement_arrows.pant_waist = { mirror: false, coords: [{X: -250,Y: 978}, {X: 250,Y: 978}], style: arcStyle, lift: false, color: arrowColor };
                        }
                        break;
                    case 4:	// hips
                    /* falls through */
                    case 5:	// half-way-thigh
                    /* falls through */
                    default:
                        var $base_y = 978;
                        if (itemTypeArr[5] === 5) {
                            $base_y = 1038;
                        }
                        if (itemTypeArr[6] === 1) {	// elastic
                            item_drawing.coords.push({X: 250,Y: $base_y, cp1X: 247, cp1Y: 402, cp2X: 247, cp2Y: 908},{X: 230,Y: ($base_y+60)},{X: 0,Y: ($base_y+60)});
                            for ($i = 0; $i<15; $i++) {
                                $x = Math.round(($i+0.5)*(230/15));
                                item_drawing.accents.push({type: "line", coords: [{X: $x,Y: ($base_y+10)}, {X: $x,Y: ($base_y+60)}]});
                            }
                            measurement_arrows.front_height.coords[1].Y = ($base_y+60);
                            measurement_arrows.hips = { mirror: false, coords: [{X: -250,Y: $base_y}, {X: 250,Y: $base_y}], style: arcStyle, lift: false, color: arrowColor };
                        } else {
                            item_drawing.coords.push({X: 250,Y: ($base_y+60), cp1X: 245, cp1Y: 402, cp2X: 245, cp2Y: $base_y},{X: 0,Y: ($base_y+60)});
                            measurement_arrows.front_height.coords[1].Y = ($base_y+60);
                            measurement_arrows.hips = { mirror: false, coords: [{X: -250,Y: ($base_y+60)}, {X: 250,Y: ($base_y+60)}], style: arcStyle, lift: false, color: arrowColor };
                        }
                        break;
                }

                break;	// case 1 shirts/coats

            case 2:	// trousers/shorts
                item_drawing.mirror = false; // for accents mainly
                item_drawing.coords.push({X: -232,Y: 0},{X: 222,Y: 0, cp1X: -100, cp1Y: 10, cp2X: 90, cp2Y: 10},{X: 263,Y: 171});

                switch (itemTypeArr[3]) { // sleeve
                    case 1:	// very short
                    case 2:	// short
                    case 3:	// short-medium
                        item_drawing.coords.push({X: 278,Y: 449},{X: 38, Y: 474});
                        break;
                    case 4:	// medium
                        item_drawing.coords.push({X: 291,Y: 626},{X: 71, Y: 651});
                        break;
                    case 5:  // semi-long
                    case 6:  // long
                        item_drawing.coords.push({X: 302,Y: 1071},{X: 151, Y: 1084});
                        break;
                }

                item_drawing.coords.push({X: 5,Y: 297},{X: -17,Y: 297});

                switch (itemTypeArr[3]) { // sleeve again as not mirror
                    case 1:	// very short
                    case 2:	// short
                    case 3:	// short-medium
                        item_drawing.coords.push({X: -38, Y: 474}, {X: -278,Y: 449});
                        measurement_arrows.outseam = { mirror: false, coords: [{X: 222,Y: 0},{X: 263,Y: 171},{X: 278,Y: 449}], style: "line", lift: true, color: arrowColor };
                        measurement_arrows.knee_width = { mirror: false, coords: [{X: -278,Y: 449},{X: -38,Y: 474}], style: arcStyle, lift: false, color: arrowColor };
                        break;
                    case 4:	// medium
                        item_drawing.coords.push({X: -71,Y: 651},{X: -291,Y: 626});
                        measurement_arrows.outseam = { mirror: false, coords: [{X: 222,Y: 0},{X: 263,Y: 171},{X: 291,Y: 626}], style: "line", lift: true, color: arrowColor };
                        measurement_arrows.knee_width = { mirror: false, coords: [{X: -291,Y: 626},{X: -71,Y: 651}], style: arcStyle, lift: false, color: arrowColor };
                        break;
                    case 5:  // semi-long
                    case 6:  // long
                        item_drawing.coords.push({X: -152,Y: 1084},{X: -301,Y: 1071});
                        break;
                }

                item_drawing.coords.push({X: -261,Y: 171});
                item_drawing.accents.push(	{type: "area", coords: [{X: -232,Y: 0}, {X: 222,Y: 0, cp1X: -100, cp1Y: 10, cp2X: 90, cp2Y: 10}, {X: -232,Y: 0, cp1X: 122, cp1Y: 40, cp2X: -132, cp2Y: 40}]},
                    {type: "line", coords: [{X: -237,Y: 37}, {X: 229,Y: 37, cp1X: -137, cp1Y: 76, cp2X: 129, cp2Y: 76}]},
                    {type: "line", coords: [{X: -14,Y: 19}, {X: -8,Y: 297, cp1X: 3, cp1Y: 114, cp2X: 0, cp2Y: 215}]},
                    {type: "line", coords: [{X: -4,Y: 254}, {X: 29,Y: 64, cp1X: 34, cp1Y: 242, cp2X: 35, cp2Y: 188}]},
                    {type: "line", coords: [{X: -233,Y: 160}, {X: -147,Y: 81, cp1X: -182, cp1Y: 157, cp2X: -152, cp2Y: 123}]},
                    {type: "line", coords: [{X: 150,Y: 85}, {X: 236,Y: 164, cp1X: 158, cp1Y: 128, cp2X: 195, cp2Y: 160}]});
                if (itemTypeArr[6] === '4') {	// rope waistband
                    item_drawing.accents.push(	{type: "line", coords: [{X: 9,Y: 49}, {X: 8,Y: 47, cp1X: -24, cp1Y: 168, cp2X: -69, cp2Y: 84}]},
                        {type: "line", coords: [{X: 9,Y: 50}, {X: 8,Y: 49, cp1X: 47, cp1Y: 149, cp2X: 70, cp2Y: 99}]},
                        {type: "line", coords: [{X: 9,Y: 49}, {X: 49,Y: 49, cp1X: 27, cp1Y: 59, cp2X: 36, cp2Y: 54}]},
                        {type: "line", coords: [{X: 9,Y: 49}, {X: 9,Y: 64, cp1X: 11, cp1Y: 54, cp2X: 11, cp2Y: 54}]});
                } else {
                    item_drawing.accents.push({type: "circle", coords: [{X: 9,Y: 48, R: 10}]});
                }

                break; 	// case 2 trousers

            case 3:	// shoes for my friends
                item_drawing.mirror = false;
                item_drawing.coords = [	{X: 130,Y: 0},{X: 363,Y: 456, cp1X: 240, cp1Y: 8, cp2X: 345, cp2Y: 214},
                    {X: 328,Y: 633, cp1X: 358, cp1Y: 532, cp2X: 328, cp2Y: 564},{X: 182,Y: 999, cp1X: 330, cp1Y: 732, cp2X: 327, cp2Y: 994},
                    {X: 48,Y: 628, cp1X: 3, cp1Y: 994, cp2X: 48, cp2Y: 789},
                    {X: 0,Y: 340, cp1X: 42, cp1Y: 447, cp2X: 0, cp2Y: 444},{X: 130,Y: 0, cp1X: 0, cp1Y: 114, cp2X: 72, cp2Y: 0} ];
                item_drawing.accents = [{type: "area", coords: [{X: 164,Y: 625}, {X: 266,Y: 716, cp1X: 270, cp1Y: 632, cp2X: 276, cp2Y: 638}, {X: 168,Y: 990, cp1X: 236, cp1Y: 982, cp2X: 208, cp2Y: 987},
                    {X: 69,Y: 716, cp1X: 92, cp1Y: 978, cp2X: 83, cp2Y: 852}, {X: 164,Y: 625, cp1X: 64, cp1Y: 641, cp2X: 57, cp2Y: 628}]},
                    {type: "line", coords: [{X: 103,Y: 431}, {X: 212,Y: 430, cp1X: 112, cp1Y: 404, cp2X: 203, cp2Y: 405}]},
                    {type: "line", coords: [{X: 115,Y: 469}, {X: 200,Y: 469, cp1X: 121, cp1Y: 447, cp2X: 188, cp2Y: 450}]},
                    {type: "line", coords: [{X: 115,Y: 506}, {X: 200,Y: 506, cp1X: 121, cp1Y: 484, cp2X: 188, cp2Y: 484}]},
                    {type: "line", coords: [{X: 115,Y: 555}, {X: 200,Y: 555, cp1X: 121, cp1Y: 533, cp2X: 188, cp2Y: 533}]},
                    {type: "line", coords: [{X: 164,Y: 539}, {X: 283,Y: 541, cp1X: 242, cp1Y: 523, cp2X: 279, cp2Y: 609}, {X: 164,Y: 539, cp1X: 277, cp1Y: 492, cp2X: 209, cp2Y: 515}]},
                    {type: "line", coords: [{X: 164,Y: 539}, {X: 45,Y: 492, cp1X: 123, cp1Y: 517, cp2X: 34, cp2Y: 532}, {X: 164,Y: 539, cp1X: 65, cp1Y: 457, cp2X: 129, cp2Y: 509}]}
                ];
                break;	// case 3 shoes

            case 4:	// hats off
                switch (itemTypeArr[1]) {
                    case 1:	// bucket
                        item_drawing.mirror = false;
                        item_drawing.coords = [	{X: 300,Y: 0},
                            {X: 522,Y: 214, cp1X: 452, cp1Y: 17, cp2X: 458, cp2Y: 61},
                            {X: 599,Y: 311, cp1X: 594, cp1Y: 245, cp2X: 601, cp2Y: 283},
                            {X: 293,Y: 437, cp1X: 597, cp1Y: 361, cp2X: 494, cp2Y: 433},
                            {X: 0,Y: 306, cp1X: 87, cp1Y: 433, cp2X: 2, cp2Y: 355},
                            {X: 92,Y: 209, cp1X: 1, cp1Y: 258, cp2X: 44, cp2Y: 227},
                            {X: 300,Y: 0, cp1X: 156, cp1Y: 28, cp2X: 186, cp2Y: 16} ];
                        item_drawing.accents = [
                            {type: "line", coords: [{X: 222,Y: 48}, {X: 367,Y: 43, cp1X: 269, cp1Y: 29, cp2X: 288, cp2Y: 64}]},
                            {type: "line", coords: [{X: 523,Y: 214}, {X: 544,Y: 280},
                                {X: 63,Y: 278, cp1X: 376, cp1Y: 368, cp2X: 209, cp2Y: 373}, {X: 92,Y: 209}]} ];
                        break;
                }
                break;	// case 4 hats
        }
    }


    function getSliderHtml(systemsGo) {
        var sliderHtml = "";
        var basePosX = 0;
        var cellTitle = "";
        sliderHtml += "<div class='sizeme_slider'>";
        if (systemsGo) {
            sliderHtml += "<div class='slider_text slider_text_above'></div>";
            sliderHtml += "<div class='slider_container'>";
            sliderHtml += "<div class='slider_bar'>";
            sliderHtml += "</div>";
            if (sizeme_local_options.fitAreaSlider) {
                sliderHtml += "<div class='slider_area'></div>";
            }
            sliderHtml += "<table class='slider_table'><tr>";
            for (var singleFit in FIT_RANGES) {
                if (FIT_RANGES.hasOwnProperty(singleFit)) {
                    if (singleFit > 1) {
                        if (basePosX !== 0) {
							var perc_width = Math.round((singleFit - basePosX) * sliderScale);
                            sliderHtml += "<td class='" + cellTitle + "'";
                            sliderHtml += " style='width: " + perc_width + "%; min-width: " + perc_width + "%;'>";
                            sliderHtml += i18n.FIT_VERDICT[cellTitle];
                            sliderHtml += "</td>";
                        }
                        basePosX = (+singleFit);
                        cellTitle = FIT_RANGES[singleFit].label;
                    }
                }
            }
            sliderHtml += "</tr></table>";
            sliderHtml += "</div>";
        }
        sliderHtml += "<div class='slider_text slider_text_below'></div>";
        sliderHtml += "<div class='slider_text slider_text_more_below'></div>";
        sliderHtml += "</div>";

        return sliderHtml;
    }

    function sliderPos(fitValue, offset) {
        var returnPos = (Math.min(fitValue, sliderPosXMax) - sliderPosXMin) * sliderScale;
        returnPos = Math.max(0, returnPos);
        returnPos += offset;   // with +offset for graphics

        return returnPos;
    }

    function killExtraSlider() {
        $("#slider_secondary").remove();
        return true;
    }

    function drawExtraSlider(fitValue) {
        killExtraSlider(); // in case of hang arounds
        var sliderHtml = "<div class='slider_bar' id='slider_secondary'></div>";
        $(sliderHtml).hide().appendTo(".sizeme_detailed_view_window .slider_container").fadeIn(fadeLength);
        var newWidth = sliderPos(fitValue, 0);
        $("#slider_secondary").width(newWidth+'%');
        return true;
    }


    function writeSliderFlag(fitValue, fitLabel, thisSize, thisId) {
        // first, out with the old
        var sliderFlagHtml = "<div class='sliderFlag' id='sm_sf_"+thisSize+"'";
        sliderFlagHtml += " style='width: "+sliderPos(fitValue, 0)+"%'>";
        sliderFlagHtml += "<a class='flagItself "+fitLabel+"' href='#'>"+thisSize+"</a>";
        sliderFlagHtml += "</div>";
        $(".slider_container").append(sliderFlagHtml);
        $(".sm_sf_"+thisSize).hover(function() {
            $(this).toggleClass("activeFlag");
        }).click(function() {
            $(thisId).prop("checked", true);
            moveSlider(fitValue, true);
            return false;
        });
    }

    function moveSlider(fitValue, shouldAnimate) {
        var newWidth = sliderPos(fitValue, 0)+'%';
        if (shouldAnimate) {
            $('.slider_bar').stop().animate({width: newWidth});
        } else {
            $('.slider_bar').width(newWidth);
        }
    }

    function moveAreaSlider(fitValue, matchMap, shouldAnimate) {
        var smallestFit = 9999;
        var biggestFit = 0;
        var endX, startX, newWidth, newMarginLeft;
        for(var measurement in matchMap) {
            if (matchMap.hasOwnProperty(measurement)) {
                if (isImportant(matchMap[measurement].importance, matchMap[measurement].componentFit)) {
                    if (matchMap[measurement].componentFit > 0 && matchMap[measurement].componentFit < smallestFit) {
                        smallestFit = matchMap[measurement].componentFit;
                    }
                    if (matchMap[measurement].componentFit > 0 && matchMap[measurement].componentFit > biggestFit) {
                        biggestFit = matchMap[measurement].componentFit;
                    }
                }
            }
        }

        if (fitValue > smallestFit) {
            endX = sliderPos(fitValue, 0);
            startX = sliderPos(smallestFit, 0);
            newWidth = (endX - startX);
            newMarginLeft = startX;
        } else {
            endX = sliderPos(biggestFit, 0);
            startX = sliderPos(fitValue, 0);
            newWidth = (endX - startX);
            newMarginLeft = startX;
        }

        if (shouldAnimate) {
            $('.slider_area').stop().animate({width: newWidth+'%', marginLeft: newMarginLeft+'%'});
        } else {
            $('.slider_area').width(newWidth+'%').css('marginLeft', newMarginLeft+'%');
        }
    }

    function goWriteMessages(matchMap, missingMeasurements, accuracy, totalFit) {
        var $message = "";
        var $message_type = "";
        var $message_link = "";

        $(".sizeme_slider .slider_text_more_below").empty();

        if (!selectedProfile) {
            $message_type = "noMeasurements";
            $message_link = linkToSelectedProfile;
            $message = i18n.MESSAGE.add_profiles;
        } else {
            if (missingMeasurements[0]) {
                if (missingMeasurements[0].length > 0) {
                    $message_type = "missingMeasurements";
					$message_link = linkToSelectedProfile;
                    $message = i18n.MESSAGE.missing_measurements;
                }
            }

            if (accuracy < accuracyThreshold) {
                $message_type = "noMeasurements";
				$message_link = linkToSelectedProfile;
                $message = i18n.MESSAGE.no_measurements;
            }
			
			if ( (!$message_type) && (typeof matchMap.neck_opening_width !== "undefined") ) {
				if ( (totalFit >= 1000) && (matchMap.neck_opening_width.overlap < 0) )	{
					$message_type = "info";
					$message = i18n.MESSAGE.no_top_button;
				}
			}
        }

        if ($message_type) {
			if ($message_link) {
				$('<a></a>')
					.addClass("message_container "+$message_type)
					.text($message)
					.attr("href", linkToSelectedProfile)
					.attr("target", "_blank")
					.appendTo(".sizeme_slider .slider_text_more_below");
			} else {
				$('<div></div>')
					.addClass("message_container "+$message_type)
					.text($message)
					.appendTo(".sizeme_slider .slider_text_more_below");
			}
        }
    }

    function selectToButtons(element) {
        $(element+" select").hide();
        var numClass = "num_"+$(element+" option").length;
        var $content = $(document.createElement("div")).addClass("sm-buttonset "+numClass);
        $(element+" option").each(function() {
            var thisId = this.id;
            var thisLabel = sizeText($(this).text());
            var thisClass = $(this).attr("class");
            var thisVal = $(this).val();
            var $div = $('<div>')
                .addClass('sm-button '+thisClass)
                .attr("id", "button_"+thisId)
                .text(thisLabel)
                .on("click", function() {
                    $(".sm-buttonset").find(".sm-selectable").removeClass("sm-state-active");
                    $(".element_for_"+thisVal).addClass("sm-state-active");
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").val(thisVal);
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").change();	// yell change
                    SizeMe.trackEvent("sizeChanged", "Store: Product size changed");
                });
            $content.append($div);
        });
        $(element).append($content);
    }

    function getMaxY(data) {
        var max = 0;
        for (var i = 0; i < data.coords.length; i++) { max = Math.max(max, data.coords[i].Y); }
        return max;
    }

    function getMaxX(data) {
        var max = 0;
        for(var i = 0; i < data.coords.length; i++) { max = Math.max(max, data.coords[i].X); }
        return max;
    }

    function getMinX(data) {
        var min = 99999;
        for(var i = 0; i < data.coords.length; i++) { min = Math.min(min, data.coords[i].X); }
        return min;
    }

    function getMinY(data) {
        var min = 99999;
        for(var i = 0; i < data.coords.length; i++) { min = Math.min(min, data.coords[i].Y); }
        return min;
    }

    function getArced(p1, p2) {
        var dX = p2.X - p1.X;
        p2.cp1X = p1.X + Math.round(dX / arcRadius); p2.cp1Y = p1.Y + Math.round(dX / arcRadius);
        p2.cp2X = p2.X - Math.round(dX / arcRadius); p2.cp2Y = p2.Y + Math.round(dX / arcRadius);
        return true;
    }

    function liftCoords(data) {
        data.nX = 0; data.nY = 0;
        if (data.lift) {
            for(var i = 1; i < data.coords.length; i++) {
                var dX = data.coords[i].X - data.coords[i-1].X;
                var dY = data.coords[i].Y - data.coords[i-1].Y;
                var angleA = Math.atan2(dY, dX);
                data.nX = Math.sin(angleA) * arrowLift;
                data.nY = -Math.cos(angleA) * arrowLift;
            }
        }
        return true;
    }

    function getMidPoints(data) {
        var dX = data.coords[1].X - data.coords[0].X;  var dY = data.coords[1].Y - data.coords[0].Y;
        data.mid = {X: Math.round(dX / 2)+data.coords[0].X, Y: Math.round(dY / 2)+data.coords[0].Y };
        if (data.style === "arc") { data.mid.Y += Math.round(dX / arcRadius * 0.7); }
    }

    function plotItem(c, data, isArrow, scale, offsetX, offsetY, highlighted) {
        function pX(coord) {
            return (coord*scale)+offsetX;
        }
        function pY(coord) {
            return (coord*scale)+offsetY;
        }

        var i, j, lcp;

        c.beginPath();

        if (isArrow) {	// ARROW
            c.lineWidth = arrowLineWidth;
            if (highlighted) {
                c.lineWidth = arrowLineWidth + 2;
            }
            liftCoords(data);
            c.moveTo(pX(data.coords[0].X+data.nX), pY(data.coords[0].Y+data.nY));
            for(i = 1; i < data.coords.length; i++) {
                switch (data.style) {
                    case "circle":
                        getArced(data.coords[i-1], data.coords[i]);
                        c.bezierCurveTo(pX(data.coords[i].cp1X+data.nX), pY(data.coords[i].cp1Y+data.nY),
                            pX(data.coords[i].cp2X+data.nX), pY(data.coords[i].cp2Y+data.nY),
                            pX(data.coords[i].X+data.nX), pY(data.coords[i].Y+data.nY));
                        c.bezierCurveTo(pX(-data.coords[i].cp1X+data.nX), pY(-data.coords[i].cp1Y+data.nY),
                            pX(-data.coords[i].cp2X+data.nX), pY(-data.coords[i].cp2Y+data.nY),
                            pX(data.coords[0].X+data.nX), pY(data.coords[0].Y+data.nY));
                        break;
                    case "arc":
                        getArced(data.coords[i-1], data.coords[i]);
                    /* falls through */
                    case "line":
                        if (typeof data.coords[i].cp1X !== 'undefined') {
                            c.bezierCurveTo(pX(data.coords[i].cp1X+data.nX), pY(data.coords[i].cp1Y+data.nY), pX(data.coords[i].cp2X+data.nX), pY(data.coords[i].cp2Y+data.nY), pX(data.coords[i].X+data.nX), pY(data.coords[i].Y+data.nY));
                        } else {
                            c.lineTo(pX(data.coords[i].X+data.nX), pY(data.coords[i].Y+data.nY));
                        }
                        break;
                }
            }
            c.stroke();

            if (data.style === "line") {
                // start and end circles
                c.beginPath(); c.arc(pX(data.coords[0].X+data.nX), pY(data.coords[0].Y+data.nY), arrowEndRadius, 0, Math.PI*2, true); c.fill();
                c.beginPath(); c.arc(pX(data.coords[data.coords.length-1].X+data.nX), pY(data.coords[data.coords.length-1].Y+data.nY), arrowEndRadius, 0, Math.PI*2, true);	c.fill();
            }

            // mid circle
            getMidPoints(data);
            if (typeof data.midCircle !== 'undefined') { data.mid.X = data.midCircle.X; data.mid.Y = data.midCircle.Y; }
            var rad = arrowNumberRadius;
            if (highlighted) {
                rad += 5;
            }
            c.beginPath(); c.arc(pX(data.mid.X+data.nX), pY(data.mid.Y+data.nY), rad, 0, Math.PI*2, true); c.fill();
            c.beginPath(); c.fillStyle = "#FFFFFF"; c.font = arrowNumberFont; c.textAlign = "center"; c.textBaseline = "middle";
            if (highlighted) {
                c.font = arrowNumberHighlightFont;
            }
            c.fillText(data.num, pX(data.mid.X+data.nX), pY(data.mid.Y+data.nY));

        } else {	// ITEM
            c.fillStyle = fillColor; c.strokeStyle = fillColor; c.lineWidth = 0.1;

            c.moveTo(pX(data.coords[0].X), pY(data.coords[0].Y));

            for(i = 1; i < data.coords.length; i++) {
                if (typeof data.coords[i].cp1X !== 'undefined') {
                    c.bezierCurveTo(pX(data.coords[i].cp1X), pY(data.coords[i].cp1Y), pX(data.coords[i].cp2X), pY(data.coords[i].cp2Y), pX(data.coords[i].X), pY(data.coords[i].Y));
                } else {
                    c.lineTo(pX(data.coords[i].X), pY(data.coords[i].Y));
                }
            }

            if (data.mirror) {
                lcp = [{X: null, Y: null}, {X: null, Y: null}];

                for(i = data.coords.length-1; i >= 0; i--) {
                    if (lcp[0].X) {
                        c.bezierCurveTo(pX(lcp[0].X), pY(lcp[0].Y), pX(lcp[1].X), pY(lcp[1].Y), pX(-data.coords[i].X), pY(data.coords[i].Y));
                    } else {
                        c.lineTo(pX(-data.coords[i].X), pY(data.coords[i].Y));
                    }

                    if (typeof data.coords[i].cp1X !== 'undefined') {
                        lcp[0].X = -data.coords[i].cp2X; lcp[0].Y = data.coords[i].cp2Y;
                        lcp[1].X = -data.coords[i].cp1X; lcp[1].Y = data.coords[i].cp1Y;
                    } else {
                        lcp = [{X: null, Y: null}, {X: null, Y: null}];
                    }
                }
            }

            c.fill();
            c.stroke();

            // accents
            c.fillStyle = drawColor; c.strokeStyle = drawColor; c.lineWidth = itemLineWidth;
            c.lineCap = "butt"; c.lineJoin = "miter"; c.miterLimit = 1;

            for(i = 0; i < data.accents.length; i++) {
                c.beginPath();
                if (data.accents[i].type === "circle") {
                    c.arc(pX(data.accents[i].coords[0].X), pY(data.accents[i].coords[0].Y), data.accents[i].coords[0].R*realCanvasWidth/1000, 0, Math.PI*2, true);
                } else {
                    c.moveTo(pX(data.accents[i].coords[0].X), pY(data.accents[i].coords[0].Y));
                    for(j = 1; j < data.accents[i].coords.length; j++) {
                        if (typeof data.accents[i].coords[j].cp1X !== 'undefined') {
                            c.bezierCurveTo(pX(data.accents[i].coords[j].cp1X), pY(data.accents[i].coords[j].cp1Y), pX(data.accents[i].coords[j].cp2X), pY(data.accents[i].coords[j].cp2Y), pX(data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                        } else {
                            c.lineTo(pX(data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                        }
                    }
                }
                if (data.accents[i].type === "area") {
                    c.fill();
                }
                c.stroke();

                if (data.mirror) {
                    if (typeof data.accents[i].noMirror === 'undefined') {
                        lcp = [{X: null, Y: null}, {X: null, Y: null}];
                        c.beginPath();
                        c.moveTo(pX(-data.accents[i].coords[data.accents[i].coords.length-1].X), pY(data.accents[i].coords[data.accents[i].coords.length-1].Y));
                        for(j = data.accents[i].coords.length-1; j >= 0; j--) {
                            if (lcp[0].X) {
                                c.bezierCurveTo(pX(lcp[0].X), pY(lcp[0].Y), pX(lcp[1].X), pY(lcp[1].Y), pX(-data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                            } else {
                                c.lineTo(pX(-data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                            }

                            if (typeof data.accents[i].coords[j].cp1X !== 'undefined') {
                                lcp[0].X = -data.accents[i].coords[j].cp2X; lcp[0].Y = data.accents[i].coords[j].cp2Y;
                                lcp[1].X = -data.accents[i].coords[j].cp1X; lcp[1].Y = data.accents[i].coords[j].cp1Y;
                            } else {
                                lcp = [{X: null, Y: null}, {X: null, Y: null}];
                            }
                        }
                        if (data.accents[i].type === "area") {
                            c.fill();
                        }
                        c.stroke();
                    }
                }
            } // end for accents
        }
    }

    function writeItemCanvas(canvas_id, matchMap, highlight) {

        if (document.getElementById(canvas_id).getContext) {
            var c = document.getElementById(canvas_id).getContext('2d');
            $("#"+canvas_id).attr("width", realCanvasWidth).attr("height", realCanvasHeight);

            // get scale and offsets
            var canvasWidth = realCanvasWidth * (1-(2*padding));
            var canvasHeight = realCanvasHeight * (1-(2*padding));

            var maxX = getMaxX(item_drawing) - getMinX(item_drawing);
            if (item_drawing.mirror) {
                maxX = getMaxX(item_drawing) * 2;
            }
            var maxY = getMaxY(item_drawing) - getMinY(item_drawing);
            var scale = 1;
            if (maxX !== 0) {
                scale = canvasWidth / maxX;
            }
            if (maxY !== 0 && (canvasWidth/canvasHeight) > (maxX/maxY)) {
                scale = canvasHeight / maxY;
            }

            var offsetX = (realCanvasWidth - ((getMaxX(item_drawing) + getMinX(item_drawing)) * scale)) / 2;
            if (item_drawing.mirror) {
                offsetX = realCanvasWidth / 2;
            }
            var offsetY = (realCanvasHeight - ((getMaxY(item_drawing) + getMinY(item_drawing))*scale)) / 2;

            // item
            plotItem(c, item_drawing, false, scale, offsetX, offsetY, false);
            var inputKey = $(sizeme_UI_options.sizeSelectionContainer).find("select").val();

            // arrows
            if (matchMap) {
                // Detailed
                sizeme_product.item.measurements[inputKey].each(function(measurement) {
                    if (sizeme_product.item.measurements[inputKey][measurement] > 0 && measurement_arrows[measurement]) {
                        // var draw = (matchMap[measurement].componentFit > 0);
                        var draw = true;
                        if (draw) {
                            c.strokeStyle = measurement_arrows[measurement].color;
                            c.fillStyle = measurement_arrows[measurement].color;
                            plotItem(c, measurement_arrows[measurement], true, scale, offsetX, offsetY, (measurement === highlight && highlight !== null));
                        }
                    }
                });
            } else {
                // Size Guider
                if (!inputKey) {
                    inputKey = Object.keys(sizeme_product.item.measurements)[0];
                }
                if (inputKey) {
					if (typeof sizeme_product.item.measurements[inputKey] !== "undefined") {
						sizeme_product.item.measurements[inputKey].each(function(measurement) {
							if (sizeme_product.item.measurements[inputKey][measurement] > 0 && measurement_arrows[measurement]) {
								c.strokeStyle = measurement_arrows[measurement].color;
								c.fillStyle = measurement_arrows[measurement].color;
								plotItem(c, measurement_arrows[measurement], true, scale, offsetX, offsetY, (measurement === highlight && highlight !== null));
							}
						});
					}
                }
            }
        }
    }

    function initOpentip() {
        Opentip.lastZIndex = 10000;
        Opentip.styles.myDefaultStyle = {
            //target: true,
            //tipJoint: "center top",
            group: "myTips"
        };
        Opentip.defaultStyle = "myDefaultStyle";
    }

    function hasNeckOpening() {
        var inputKey = $(sizeme_UI_options.sizeSelectionContainer).find("select").val();
        if (!inputKey) {
            inputKey = Object.keys(sizeme_product.item.measurements)[0];
        }
		var retval = false;
		if (typeof sizeme_product.item.measurements[inputKey] !== "undefined") {
			if (typeof sizeme_product.item.measurements[inputKey].neck_opening_width !== "undefined") {
				retval = (sizeme_product.item.measurements[inputKey].neck_opening_width > 0);
			}
		}
        return retval;
    }

    function noThanks() {
        return readCookie("sizeme_no_thanks") === "true";
    }

    function noProductSplash() {
        return readCookie("sizeme_no_product_splash") === "true";
    }

    function writeDetailedWindow(isSizeGuide) {
        // create detailed dialog window
        itemName = sizeme_product.name;
        var txts = i18n.DETAILED;
        var linkTarget = ".sizeme_slider .slider_text_below";

        initOpentip();

        if (isSizeGuide) {
			txts = i18n.SIZE_GUIDE;
            linkTarget = sizeme_UI_options.appendContentTo;
        }

        var $dialog = $('<div id="sizeme_detailed_view_content"></div>')
            .dialog({
                position: { my: "center", at: "center", of: window },
                autoOpen: false,
                dialogClass: "sizeme_detailed_view_window",
                minHeight: 620,
                minWidth: 940,
				scaleH: 1,
				scaleW: 1,
				closeText: i18n.COMMON.close_text,
                title: txts.window_title+' <span class="name">'+itemName+'</span>'
            });

        // add toggle link to main page
        $("<a class='a_button sm_detailed_view"+(isSizeGuide ? " size_guide" : "")+"' id='popup_opener' href='#'>"+txts.button_text+"</a>")
            .click(function() {
                if (isSizeGuide) {
                    SizeMe.trackEvent("sizeGuideOpened", "Store: Size guide opened");
                } else {
                    SizeMe.trackEvent("detailedViewOpened", "Store: Detailed view opened");
                }
                $dialog.dialog('open');
                return false;
            })
            .appendTo(linkTarget);

        // write two columns
        $("<div class='dialog_col' id='col1'></div><div class='dialog_col' id='col2'></div>").appendTo("#sizeme_detailed_view_content");

        // add bottom title bar
        $("<div class='sm-bottombar ui-dialog-bottombar'></div>").appendTo("#sizeme_detailed_view_content");

        // write item image canvas to first column
        $("<div class='sizeme_detailed_section'></div>")
            .append("<canvas id='sizeme_item_view'></canvas>")
            .appendTo("#col1");

        // add shopping for selection to second (no cloning)
        if (!isSizeGuide) {
            $("<div class='sizeme_detailed_section'></div>")
                .append("<h2>"+i18n.COMMON.shopping_for+"</h2>")
                .append("<div class='shopping_for'></div>")
                .appendTo("#col2");

            // clone buttons to second
            var $clone = $(sizeme_UI_options.sizeSelectionContainer).clone(true, true);
            $clone.find("[id]").each(function() {
                this.id = "clone_"+this.id;
                $(this).addClass("cloned");
                if (this.name) {
                    this.name = "clone_"+this.name;
                }
            });
            $("<div class='sizeme_detailed_section'></div>")
                .append("<h2>"+i18n.COMMON.selected_size+"</h2>")
                .append($clone)
                .appendTo("#col2");

            // clone slider (without detailed view toggler and in content stuff)
            var $slider_clone = $(".sizeme_slider")
                .clone(true, true)
                .find(".slider_text_below").remove()
                .end();

            $("<div class='sizeme_detailed_section'></div>")
                .append("<h2>"+i18n.FIT_INFO.overall_fit+"</h2>")
                .append($slider_clone)
                .appendTo("#col2");
        }

        // write detailed table to col 2
        $("<div class='sizeme_detailed_section'></div>")
            .append("<h2>"+txts.table_title+"</h2>")
            .append("<table id='detailed_table'><tbody></tbody></table>")
            .appendTo("#col2");

        // bind hover event to run_highlights
        $("#detailed_table").on("mouseenter", ".run_highlight", function () {
            var highlight = $(this).data("measurement");
            $(this).find("td.cell_"+highlight).addClass("highlighted");
            var $matchMap = $("#detailed_table").find("tbody").data("matchMap");
            writeItemCanvas('sizeme_item_view', $matchMap, highlight);
            if (sizeme_local_options.fitAreaSlider && $matchMap) {
                if ($matchMap[highlight]) {
                    if (($matchMap[highlight].componentFit > 0) && (isImportant($matchMap[highlight].importance, $matchMap[highlight].componentFit))) {
                        drawExtraSlider($matchMap[highlight].componentFit);
                    }
                }
            }
        }).on("mouseleave", ".run_highlight", function () {
            var highlight = $(this).data("measurement");
            $(this).find("td.cell_"+highlight).removeClass("highlighted");
            writeItemCanvas('sizeme_item_view', $("#detailed_table").find("tbody").data("matchMap"), "");
            if (sizeme_local_options.fitAreaSlider) {
                killExtraSlider();
            }
        });

        // disclaimers
        if (isSizeGuide) {
            var $txt = i18n.SIZE_GUIDE.measurement_disclaimer;
            if (hasNeckOpening()) {
                $txt += "<br />"+i18n.SIZE_GUIDE.measurement_disclaimer_collar;
            }
            if (isInside()) {
                $txt = i18n.SIZE_GUIDE.measurement_disclaimer_inside;
            }
            $("<div class='sizeme_explanation'></div>")
                .append("<p>"+$txt+"</p>")
                .appendTo("#col2");

            if (sizeme_options.service_status === "on") {
                $("<div class='sizeme_advertisement'></div>")
                    .append("<p>"+i18n.SIZE_GUIDE.advertisement+" " +
                        "<a id='sizeme_ad_link' href='" + SizeMe.contextAddress + "' class='logo' target='_blank'></a></p>")
                    .appendTo("#sizeme_detailed_view_content");
                $("#sizeme_ad_link").on("click", function() {
                    clearAuthToken();
                    if (noThanks()) {
                        eraseCookie("sizeme_no_thanks");
                        $(".splash").fadeIn();
                        return false;
                    }
                });
            }
        }
    }

    function isImportant(importance, componentFit) {
        return (importance === 1 || ((importance === -1) && (componentFit < 1000)));
    }

    function colorCell($cell, value, arrow) {
        if (arrow) {
            arrow.color = arrowColorInfo;
        }
        if (value) {
            var selectedFit = getFit(value.componentFit, value.importance);
			$cell.addClass(selectedFit.label);
			if (arrow) {
				arrow.color = selectedFit.arrowColor;
			}
        }
        return $cell;
    }

    function getMissingMeasurement(missingMeasurements, measurement) {
        for(var $i = 0; $i < missingMeasurements.length; $i++) {
            if (missingMeasurements[$i][0] === measurement) {
                return missingMeasurements[$i][1];
            }
        }
        return null;
    }

    function isPinched(measurement) { return (PINCHED_FITS.indexOf(measurement) >= 0); }
    function isLongFit(measurement) { return (LONG_FITS.indexOf(measurement) >= 0); }

    function isPinchedTxt(measurement) {
        if (isPinched(measurement)) {
            return " "+i18n.FIT_INFO.when_pinched;
        }
        return "";
    }

    function getStretchedTxt(stretch_value) {
        if (stretch_value > 0) {
            if (stretch_value < 25) {
                return i18n.FIT_INFO.stretched_little+"  ";
            } else if (stretch_value < 75) {
                return i18n.FIT_INFO.stretched_somewhat+"  ";
            } else if (stretch_value < 95) {
                return i18n.FIT_INFO.stretched_much+"  ";
            } else {
                return i18n.FIT_INFO.stretched_max+"  ";
            }
        }
        return "";
    }


    function updateDetailedTable(matchMap, inputKey, missingMeasurements) {
        var $table = $("#detailed_table").find("tbody"),
            $row, $i, $tip, $txt;
        $table.empty();
        if (matchMap) {
            // *** Detailed View ***
            $table.data("matchMap", matchMap);

            $row = $(document.createElement("tr")).addClass("header_row");
            $i = 0;
            sizeme_product.item.measurements[inputKey].each(function(measurement) {
                if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                    var $txt = '<span class="num">'+(++$i)+'</span>'+i18n.MEASUREMENT[measurement];
                    if (measurement_arrows[measurement]) {
                        measurement_arrows[measurement].num = $i;
                    }
                    $row.append($(document.createElement("td")).html($txt).addClass("run_highlight cell_"+measurement).data("measurement", measurement));
                }
            });
            $table.append($row);

            var $tip_txts = [];
            var $tip_classes = [];

            if (sizeme_local_options.writeOverlaps) {
                $row = $(document.createElement("tr")).addClass("data_row");
                sizeme_product.item.measurements[inputKey].each(function(measurement) {
                    var drawReason = 0;
                    if (matchMap[measurement] && matchMap[measurement].componentFit > 0) {
                        drawReason = 1;
                    }
                    if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                        drawReason = 2;
                    }
                    if (drawReason > 0) {
                        var $txt = "";
						var $meas_top = 0;
                        $tip_txts[measurement] = i18n.FIT_INFO.the_item+" "+i18n.MEASUREMENT[measurement].toLowerCase()+" "+i18n.FIT_INFO.the_measurement+" ";

                        if (matchMap[measurement]) {
                            $txt = (matchMap[measurement].overlap/10).toFixed(1)+" cm";
                            if (isPinched(measurement)) {
                                $txt = (matchMap[measurement].overlap/20).toFixed(1)+" cm";
                            }
                            if ((matchMap[measurement].overlap <= 0) && (matchMap[measurement].componentFit >= 1000)) {
                                $txt = "0.0 cm";
                            }

							switch(measurement) {
								case "sleeve":
									var $sleeve_txt = "<div class='sleeve" + (matchMap[measurement].overlap < 0 ? " negative_overlap" : "") + "'>";
									var $sleeve_height = Math.round(29 + (75*(matchMap[measurement].percentage / 0.3)));	// zero-point + (wrist_to_finger * (overlap_percentage / normal_finger_ratio))
									$sleeve_height = Math.max(11, $sleeve_height);	// never under 11 (34 px)
									$sleeve_height = Math.min(105, $sleeve_height);	// never over overlap image height

									$meas_top = Math.round((($sleeve_height - 29) / 2)+29-9);
									if (($sleeve_height - 29) < 14) { // no fit in middle if no room
										$meas_top = $sleeve_height+23;
									}
									if (matchMap[measurement].overlap < 0) {
										$sleeve_txt += "<div class='meas' style='top:14px;left:-7px;'>"+$txt+"</div>";	// negative overlap in different place
										if (matchMap[measurement].componentFit >= 1000) {
											$sleeve_height = 29;
										}
									} else {
										$sleeve_txt += "<div class='meas' style='top:"+$meas_top+"px;";
										if (matchMap[measurement].overlap >= 100) {
											$sleeve_txt += "left:-7px;";
										}
										$sleeve_txt += "'>"+$txt+"</div>";	// mid point?
									}

									$sleeve_txt += "<div class='sleeve_overlap' style='height:"+($sleeve_height+23)+"px;'></div>";	// sleeve + image bottom clearance
									$sleeve_txt += "</div>";
									$tip_txts[measurement] = $sleeve_txt + $tip_txts[measurement];
									break;
								case "front_height":
									var $front_height_txt = "<div class='front_height" + (matchMap[measurement].overlap < 0 ? " negative_overlap" : "") + "'>";
									var $front_height_height = Math.round(25 + (matchMap[measurement].percentage*(9 / 0.05)));	// zero-point + (overlap_percentage * (pant waistband height in px / pant waistband in %))
									$front_height_height = Math.max(0, $front_height_height);	// never under 0 (+23 = 34 px)
									$front_height_height = Math.min(105, $front_height_height);	// never over overlap image height (+23 px)

									$meas_top = Math.round((($front_height_height - 25) / 2)+25-9);
									if (($front_height_height - 25) < 12) { // no fit in middle if no room
										$meas_top = $front_height_height+23;
									}
									if (matchMap[measurement].overlap < 0) {
										$front_height_txt += "<div class='meas' style='top:14px;left:-7px;'>"+$txt+"</div>";	// negative overlap in different place
										if (matchMap[measurement].componentFit >= 1000) {
											$front_height_height = 28;
										}
									} else {
										$front_height_txt += "<div class='meas' style='top:"+$meas_top+"px;";
										if (matchMap[measurement].overlap >= 100) {
											$front_height_txt += "left:-12px;";
										}
										$front_height_txt += "'>"+$txt+"</div>";	// mid point?
									}

									$front_height_txt += "<div class='front_height_overlap' style='height:"+($front_height_height+23)+"px;'></div>";	// front_height + image (arrow) bottom clearance
									$front_height_txt += "</div>";
									$tip_txts[measurement] = $front_height_txt + $tip_txts[measurement];
									break;
                            }	// end switch measurement					

                            if (matchMap[measurement].overlap <= 0) {
                                if (matchMap[measurement].componentFit >= 1000) {
                                    $txt = "0.0 cm";
                                    $tip_txts[measurement] += i18n.FIT_INFO.no_overlap+"  ";
                                    $tip_txts[measurement] += getStretchedTxt(matchMap[measurement].componentStretch);
                                } else {
                                    $tip_txts[measurement] += i18n.FIT_INFO.is_smaller+" ";
                                    $tip_txts[measurement] += $txt.replace("-","");
                                    $tip_txts[measurement] += isPinchedTxt(measurement)+".  ";
                                }
                            } else {
                                if (isPinched(measurement)) {
                                    $tip_txts[measurement] = "<div class='pinched'><div class='meas'>"+$txt+"</div></div>" + $tip_txts[measurement];
                                }

                                $txt = "+"+$txt;
                                $tip_txts[measurement] += i18n.FIT_INFO.overlaps_you+" <b>"+$txt+"</b>"+isPinchedTxt(measurement);
                                if (measurement === "sleeve") {
                                    $tip_txts[measurement] += " "+i18n.FIT_INFO.arm_sleeve_straight;
                                }
                                $tip_txts[measurement] += ".  ";
                            }

                            if (matchMap[measurement].componentFit > 0) {
                                var $fitVerdict = i18n.FIT_VERDICT[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                                if (isLongFit(measurement)) {
                                    $fitVerdict = i18n.FIT_VERDICT_LONG[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                                }
                                $tip_txts[measurement] += i18n.FIT_INFO.sm_considers_fit+" <b>"+$fitVerdict.toLowerCase()+"</b>.";
                            }

                        } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                            $txt = (sizeme_product.item.measurements[inputKey][measurement]/10).toFixed(1)+" cm";
                            $tip_txts[measurement] += i18n.COMMON.is+" "+$txt+".  ";
                            if (missingMeasurements) {
                                if (getMissingMeasurement(missingMeasurements, measurement) !== null) {
                                    $tip_txts[measurement] += i18n.MESSAGE.add_this_measurement;
                                }
                            }
                        }

                        var $cell = $(document.createElement("td"))
                            .text($txt)
                            .attr("id","overlap_"+measurement)
                            .addClass("run_highlight cell_"+measurement)
                            .data("measurement", measurement);
                        $row.append(colorCell($cell, matchMap[measurement], measurement_arrows[measurement]));
                        $tip_classes[measurement] = "";
                        if (isPinched(measurement)) {
                            $tip_classes[measurement] = "isPinched";
                        }
                        if (measurement === "sleeve") {
                            $tip_classes[measurement] = "sleeve";
                        }
                        $tip = new Opentip($cell, $tip_txts[measurement], { className: $tip_classes[measurement] } );
                    }
                });
                $table.append($row);
            }

            $row = $(document.createElement("tr")).addClass("data_row fit_label_row");
            sizeme_product.item.measurements[inputKey].each(function(measurement, value) {
                var $cell;
                if (matchMap[measurement]) {
                    if (matchMap[measurement].componentFit > 0) {
                        $txt = i18n.FIT_VERDICT[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
						
                        if (isLongFit(measurement)) {
                            $txt = i18n.FIT_VERDICT_LONG[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                        }
						
                        $cell = $(document.createElement("td"))
                            .html('<div>'+$txt+'</div>')
                            .addClass("run_highlight")
                            .data("measurement", measurement);
						
                        $row.append(colorCell($cell, matchMap[measurement], measurement_arrows[measurement]));
                    } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                        $txt = "";
                        $cell = $(document.createElement("td"))
                            .html($txt)
                            .addClass("info run_highlight cell_"+measurement)
                            .data("measurement", measurement);
                        $row.append($cell);
                    }
                } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                    $txt = "";
                    var $class = "",
                        missing;
                    if (missingMeasurements) {
                        if ((missing = getMissingMeasurement(missingMeasurements, measurement)) !== null) {
                            $txt = "<a target='_blank' href='"+linkToSelectedProfile+"#"+missing+"'>"+i18n.COMMON.add_to_profile+"</a>";
                            $class = " add";
                        }
                    }
                    $cell = $(document.createElement("td"))
                        .html($txt)
                        .addClass("info run_highlight cell_"+measurement+$class)
                        .data("measurement", measurement);
                    $row.append($cell);
                }
                if ($cell) {
                    $tip = new Opentip($cell, $tip_txts[measurement], { className: $tip_classes[measurement] } );
                }
            });
            $table.append($row);

        } else {
            // *** Size Guide ***
            $row = $(document.createElement("tr")).addClass("header_row");
            $i = 0;
            var $first = Object.keys(sizeme_product.item.measurements)[0],
                $j, measurement;
            $row.append($(document.createElement("td")).html(i18n.COMMON.size).addClass("size_column"));
            for ($j = 0; $j < FIT_ORDER.length; $j++) {
                measurement = FIT_ORDER[$j];
                if (sizeme_product.item.measurements[$first][measurement] > 0) {
                    $txt = '<span class="num">'+(++$i)+'</span>'+i18n.MEASUREMENT[measurement];
                    if (measurement_arrows[measurement]) {
                        measurement_arrows[measurement].num = $i;
                    }
                    $row.append($(document.createElement("td")).html($txt).addClass("run_highlight cell_"+measurement).data("measurement", measurement));
                }
            }
            $table.append($row);

            for ($i=0;$i<sizeKeys.length;$i++) {
                var key = sizeKeys[$i].key, $cell;

                var $class = "data_row";
                if (key === inputKey) {
                    $class += " active";
                }

                $row = $(document.createElement("tr")).addClass($class);

                $row.append($(document.createElement("td")).html(sizeText(sizeKeys[$i].sizeLabel)).addClass("size_column"));
                for ($j = 0; $j < FIT_ORDER.length; $j++) {
                    measurement = FIT_ORDER[$j];
                    if (sizeme_product.item.measurements[key][measurement] > 0) {
                        $txt = (sizeme_product.item.measurements[key][measurement]/10).toFixed(1);
                        $cell = $(document.createElement("td")).text($txt+" cm").addClass("run_highlight cell_"+measurement).data("measurement", measurement);
                        $row.append(colorCell($cell, "", measurement_arrows[measurement]));
                    }
                }
                $table.append($row);
            }
        }

        writeItemCanvas('sizeme_item_view', matchMap, "");

    }

    function updateDetailedSliderTip(thisSize, thisFit) {
        // tip for overall slider in detailed
        var $trigger = $("#sizeme_detailed_view_content").find(".slider_container");
        var $tip_txt = i18n.FIT_INFO.overall_fit_for_size+" "+sizeText(thisSize)+"</b>";
        $tip_txt += " "+i18n.COMMON.is+" <b>"+i18n.FIT_VERDICT[getFit(thisFit, 1).label].toLowerCase()+"</b>";
        var $tip = new Opentip($trigger, $tip_txt);
    }

    function updateSlider(thisSize, thisData, isRecommended, detailedContainer, animateSlider) {
		if (typeof thisData !== "undefined") {
			var thisFit = thisData.totalFit;
			var thisLabel = thisData.fitRangeLabel;
			var matchMap = thisData.matchMap;
			moveSlider(thisFit, animateSlider);
			if (sizeme_local_options.fitAreaSlider) {
				moveAreaSlider(thisFit, matchMap, animateSlider);
			}
			if (sizeme_local_options.writeMessages) {
				goWriteMessages(matchMap, thisData.missingMeasurements, thisData.accuracy, thisFit);
			}
			updateDetailedSliderTip(thisSize, thisFit);
			updateDetailedTable(matchMap, thisData.inputKey, thisData.missingMeasurements);
		}
    }

    function getStandardHeader() {
        // *** SizeMe Header injection
        var headerHtml = "<div id='sizeme_header' class='in_content'>";
        headerHtml += "<div id='logo'></div>";
        headerHtml += "<div class='sizeme_header_content'>";
        headerHtml += "<div class='shopping_for'>"+i18n.COMMON.fetching_profiles+"</div>";
        headerHtml += "<div class='top_right'>";
        headerHtml += "<div id='log_info'><span id='logged_in'></span></div>";
        headerHtml += "</div>";
        headerHtml += "</div>";
        return headerHtml;
    }

    function getHeaderToggler() {
        // *** SizeMe Header toggler
        var headerHtml = "<div id='sizeme_header_toggler' class='in_content'>";
        headerHtml += "</div>";
        return headerHtml;
    }

    function getSplashDetailed() {
        // *** SizeMe Splash #2 injection (detailed)
        var headerHtml = "<div id='sizeme_detailed_splash' class='splash'>";
        headerHtml += "<p class='splash_text'>";
        headerHtml += i18n.SPLASH.detailed_text;
        headerHtml += "</p>";
        headerHtml += "<ul class='splash_choices'>";
        headerHtml += "<li class='sign_in'>";
		headerHtml += "<a href='" + SizeMe.contextAddress + "/?mode=signup' target='_blank' class='a_button' id='sizeme_btn_sign_up' title='"+i18n.SPLASH.btn_sign_up_label+"'>";
		headerHtml += i18n.SPLASH.btn_sign_up_title+"</a>";
		headerHtml += "</li>";
        headerHtml += "<li class='log_in'><a href='#' class='a_button' id='sizeme_btn_login' title='"+i18n.SPLASH.btn_log_in_label+"'>"+i18n.SPLASH.btn_log_in_title+"</a></li>";
        headerHtml += "<li class='no_thanks'><td><a href='#' class='a_button' id='sizeme_btn_no_thanks' title='"+i18n.SPLASH.btn_no_thanks_label+"'>"+i18n.SPLASH.btn_no_thanks_title+"</a></li>";
        headerHtml += "</ul></div>";
        return headerHtml;
    }

    function getProductSplash() {
        // *** SizeMe Splash in Product page
        var splashHtml = "<div id='sizeme_product_splash'>";
		splashHtml += "<p>"+i18n.SPLASH.product_page_splashes[0]+" ";
		splashHtml += "<a href='" + SizeMe.contextAddress + "' target='_blank' id='sizeme_product_page_link' title='"+i18n.SPLASH.product_page_splash_title+"'></a>";
		splashHtml += "<a href='#' id='sizeme_btn_no_thanks_product_splash' title='"+i18n.COMMON.close_text+"'></a>";
        splashHtml += "</p></div>";
        return splashHtml;
    }

    function findMaxMeasurement() {
        var maxVal = 0;
        sizeme_product.item.measurements.each(function(key, measurement_set) {
            sizeme_product.item.measurements[key].each(function(key_2, value) { maxVal = Math.max(value, maxVal); });
        });
        return maxVal;
    }

    var DataStorage = (function() {

        function DataStorage(type) {
            if (storageAvailable(type)) {
                this.storage = window[type];
            } else{
                this.storage = null;
            }
        }

        DataStorage.prototype.storage = null;

        function storageAvailable(type) {
            try {
                var _tstorage = window[type];
                var x = '__storage_test__';
                _tstorage.setItem(x, x);
                _tstorage.removeItem(x);
                return true;
            } catch (e) {
                return false;
            }
        }

        DataStorage.prototype.withStorage = function(callback) {
            if (this.storage === null) {
                return;
            }

            return callback(this.storage);
        };

        return DataStorage;
    })();

    var Storage = new DataStorage('sessionStorage');
    var sizeMe;

    function sizeMeLogout() {
        sizeMe = null;
        clearAuthToken();
    }

    function clearAuthToken() {
        Storage.withStorage(function(storage) {
            storage.removeItem('authToken');
        });
    }

    function getAuthToken() {
        var deferred = $.Deferred();

        Storage.withStorage(function(storage) {
            var storedTokenObj = storage.getItem('authToken'),
                storedToken;
            if (storedTokenObj !== null) {
                storedToken = JSON.parse(storedTokenObj);
                if (storedToken.expires !== undefined) {
                    storedToken.expires = Date.parse(storedToken.expires);
                    // Has token expired?
                    if (storedToken.expires > new Date().getTime()) {
                        if (storedToken.token !== undefined) {
                            deferred.resolve(storedToken.token);
                        } else {
                            deferred.reject(null);
                        }
                    }
                }
            }
        });

        if (deferred.state() === "pending") {
            SizeMe.getAuthToken(function (authTokenObj) {
                if (authTokenObj === null || authTokenObj.token === null) {
                    deferred.reject(null);
                } else {
                    Storage.withStorage(function(storage) {
                        storage.setItem('authToken', JSON.stringify(authTokenObj));
                    });
                    deferred.resolve(authTokenObj.token);
                }
            });
        }

        return deferred.promise();
    }

    function sizeMeInit(authorizedCb, unauthorizedCb) {
        var deferred = $.Deferred();
        getAuthToken().then(
            function(authToken) {
                deferred.resolve(new SizeMe(authToken));
            }, function() {
                deferred.reject(null);
            }
        );

        sizeMe = deferred.promise();
        sizeMe.then(
            function (smObj) {
                if (authorizedCb !== null) {
                    authorizedCb(smObj);
                }
            },
            function () {
                if (unauthorizedCb !== null) {
                    unauthorizedCb();
                }
            }
        );
    }

    // Load on ready for all pages
    $(function() {

        var systemsGo = true;

        i18n = SizeMeI18N.get(sizeme_UI_options.lang);

		// check options (and service status)
		if (typeof sizeme_options === 'undefined') {
			systemsGo = false;
		} else if (sizeme_options.service_status === "off") {
			systemsGo = false;
		}

        // check data
        if (typeof sizeme_product === 'undefined') {
            systemsGo = false;
        } else if (sizeme_product.item.itemType === 0) {
            systemsGo = false;
        } else if (findMaxMeasurement() === 0) {
            systemsGo = false;
        } 
		
		// check existence of size selection element
		if ($(sizeme_UI_options.sizeSelectionContainer).find('select').length === 0) {
			systemsGo = false;
		}

        if (systemsGo) {
            loadArrows(false); // everyone needs arrows
        }

        //stuff we do anyway
        addIds(sizeme_UI_options.sizeSelectionContainer);

        // buttonize
		if (typeof sizeme_options !== 'undefined') {
			if (sizeme_options.buttonize === "yes") {
				selectToButtons(sizeme_UI_options.sizeSelectionContainer);
				$("#button_choose").remove();
			}
		}

		// add add to cart event
		if (sizeme_UI_options.addToCartEvent) {
			$(sizeme_UI_options.addToCartElement).on(sizeme_UI_options.addToCartEvent, function() {
				if (isLoggedIn()) {
					SizeMe.trackEvent("addToCartSM", "Store: Product added to cart by SizeMe user");
				} else {
					SizeMe.trackEvent("addToCart", "Store: Product added to cart");
				}

			});
		}

        var getMatchResponseHandler = function(prodId, sizeme_product) {
            if (!systemsGo) {
                return function() {};
            }
            return function(responseMap) {
                var smallestOffset = 9999,  // for recommendation
                    thisVal, thisId, thisData, thisSize;

                responseMap.each(function(key, result) {
                    var classKey = ".element_for_" + key;
                    $(classKey)
                        .removeClass('sm-too_small sm-slim sm-regular sm-loose sm-very_loose sm-huge sm-too_big')
                        .addClass('sm-'+result.fitRangeLabel);

                    // Analyze fit for recommendations
                    var fitOffset = Math.abs(result.totalFit - OPTIMAL_FIT);
                    if (fitOffset < smallestOffset) {
						// check if recommended option exists (is for sale)
						if ($("#input_" + key).length > 0) {
							smallestOffset = fitOffset;
							recommendedId = key;
							recommendedLabel = result.fitRangeLabel;
						}
                    }

                    // check if there are results in the first place
                    if (result.accuracy < accuracyThreshold) {
                        $('.slider_bar, .slider_area').hide();
                    } else {
                        $('.slider_bar, .slider_area').show();
                    }

                    // write data to inputs
                    $("#input_" + key).data("fitData", { totalFit: result.totalFit,
                        fitRangeLabel: result.fitRangeLabel,
                        matchMap: result.matchMap,
                        missingMeasurements: result.missingMeasurements,
                        accuracy: result.accuracy,
                        inputKey: key });
                });

                // bind change to inputs
                $(sizeme_UI_options.sizeSelectionContainer).find("select").change(function() {
                    thisVal = $(this).val();
                    thisId = '#input_'+thisVal;
                    thisData = $(thisId).data("fitData");
                    thisSize = $(thisId).text();
                    if (thisVal) {
                        updateSlider(thisSize, thisData, (thisVal === recommendedId), sizeme_UI_options.detailedViewContainer, true);
                    }
                    // relay change to cloned and vice versa
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").val(thisVal);
                });

                // remove existing recommendation
                $(".sm-buttonset").find(".sm-selectable").removeClass('sm-recommended');

                // set selection to recommendation on first match
                if (sizeme_local_options.firstRecommendation) {
                    // select recommended
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").val(recommendedId);
                    // remove existing active
                    $(".sm-buttonset").find(".sm-selectable").removeClass('sm-state-active');
                    // add class
                    $(".element_for_" + recommendedId).addClass('sm-recommended sm-state-active');
                    var recommendedInput = $("#input_" + recommendedId);
                    if (recommendedInput.data("fitData")) {
                        thisData = recommendedInput.data("fitData");
                        thisSize = recommendedInput.text();
                        updateSlider(thisSize, thisData, true, sizeme_UI_options.detailedViewContainer, true);
                    }
                    sizeme_local_options.firstRecommendation = false;
                } else {
                    thisId = '#input_'+$(sizeme_UI_options.sizeSelectionContainer).find("select").val();
                    if ($(thisId).data("fitData")) {
                        thisData = $(thisId).data("fitData");
                        thisSize = $(thisId).text();
                        updateSlider(thisSize, thisData, true, sizeme_UI_options.detailedViewContainer, true);
                    }
                }
            };
            // end of function 	getMatchResponseHandler
        };

        var matchErrorHandler = function() {
			// this is called when the match function returns an error.  This is most likely due to a wrong or unadded itemType and only visible when the user is logged in.
			// if the itemType is
			$(".sizeme_slider").hide();
			console.error("SizeMe: error in match function.  Please contact your local SizeMe dealer.");

            // end of function 	matchErrorHandler
        };


        var loggedInCb = function(sizeMeObj) {

            function setProfileLink() {
                if (selectedProfile === null) {
                    linkToSelectedProfile = SizeMe.contextAddress + "/account/profiles.html";
                } else {
                    linkToSelectedProfile = SizeMe.contextAddress + "/account/profiles/" + selectedProfile + "/profile.html";
                }
            }

            var doProfileChange = function(newValue) {
                selectedProfile = newValue;
                setProfileLink();

                if (selectedProfile === null) {
                    eraseCookie("sizeme_profileId");
                    goWriteMessages();
                } else {
                    $(".profileSelect").val(selectedProfile);
                    createCookie("sizeme_profileId", selectedProfile, cookieLifetime);

                    if (typeof sizeme_product !== 'undefined') {
                        var prodId = null;
                        var tmpItem = $.extend({}, sizeme_product.item);
                        var itemType = tmpItem.itemType;
                        if (itemType.indexOf('.') < 0) {
                            tmpItem.itemType = itemType.split('').join('.');
                        }
                        sizeMeObj.match(new SizeMe.FitRequest(selectedProfile, tmpItem), getMatchResponseHandler(prodId, sizeme_product), matchErrorHandler);
                    }
                    SizeMe.trackEvent("activeProfileChanged", "Store: Active profile changed");
                }
                $('#logged_in_link').attr("href", linkToSelectedProfile);
                // end of function  doProfileChange
            };

            eraseCookie("sizeme_no_thanks");
            eraseCookie("sizeme_no_product_splash");

            // remove existing (if exists)
            $("#sizeme_header").remove();
            $("#popup_opener").remove();
            $("#sizeme_product_splash").remove();
            $("#sizeme_detailed_view_content").dialog("destroy").remove();

            // *** SizeMe Magic
            if (sizeMeObj !== null) {
                sizeMeObj.fetchProfilesForAccount(function (profileList) {
                    var cookieProfile = readCookie("sizeme_profileId");
                    var $i = 0;
                    var $new = "<div id='sizeme_header_container'>"+getStandardHeader()+"</div>";

                    // Prepend header to body
                    $(sizeme_UI_options.appendContentTo).append(getSliderHtml(systemsGo));
                    $(".sizeme_slider .slider_text_below").append($new);
                    $("#sizeme_header.in_content").find("#logo").on("click", function() {
                        $("#sizeme_header.in_content").toggleClass("opened");
                    });

                    if (profileList.length > 0) {
                        selectedProfile = profileList[0].id;
                        $.each(profileList, function () {
                            if (this.id === cookieProfile) {
                                selectedProfile = this.id;
                                return false;
                            }
                        });

                        writeDetailedWindow(false);
                        moveSlider(OPTIMAL_FIT, false);

                        $(".shopping_for").empty().html("<span class='shopping_for_text'>"+i18n.COMMON.shopping_for+": </span>")
                            .append(function () {
                                var select = document.createElement("select");
                                select.className = "profileSelect";
                                select.id = "id_profileSelect_" + (++$i);
                                return select;
                            });
                        $.each(profileList, function () {
                            $("<option>").appendTo(".profileSelect")
                                .attr("value", this.id)
                                .text(this.profileName);
                        });
                        $('.profileSelect')
                            .val(selectedProfile)
                            .change(function () {
                                doProfileChange(this.value);
                            });
                    } else {
                        selectedProfile = null;
                        setProfileLink();
                        writeDetailedWindow(false);
                        updateDetailedTable();
                        $('.slider_bar, .slider_area').hide();
                        $(".shopping_for").empty();
                        $(".sizeme_header_content .shopping_for")
                            .html("<span class='shopping_for_text no-profile'>"+i18n.MESSAGE.no_profiles+"</span>");
                        $(".sizeme_detailed_section .shopping_for")
                            .append(
                                $("<span>").addClass("shopping_for_text no-profile")
                                    .html(i18n.MESSAGE.no_profiles+" "+i18n.COMMON.go_to+
                                        "<a id='logged_in_link' href='" + linkToSelectedProfile + "' target='_blank'>" + i18n.COMMON.my_profiles + "</a> "+i18n+COMMON.and_create_one)
                            );
                    }

                    $('#logged_in').html("<a id='logged_in_link' href='#' target='_blank'>" + i18n.COMMON.my_profiles + "</a>");

                    // Yell change
                    doProfileChange(selectedProfile);
                });
            }

            $("#logout").click(loggedOutCb);

            // end of function 	loggedInCb
        };

        var loggedOutCb = function() {

            loadArrows(true);

            // Size Guide for non-loving users
            writeDetailedWindow(true);
            updateDetailedTable();

			// Makia live temporary exception
			// Show size guide text only if there actually is a size guide (otherwise hidden with css)
			$(".sizeme p").show();

            // bind change to select
            $(sizeme_UI_options.sizeSelectionContainer).find("select").change(function() {
                var thisVal = $(this).val();
                // relay change to cloned and vice versa
                $(sizeme_UI_options.sizeSelectionContainer).find("select").val(thisVal);
                updateDetailedTable("", thisVal);
            });

            if (sizeme_options.service_status === "on") {
                var splashContent;
                // Add splash content in detailed
				splashContent = getSplashDetailed();
				if (noThanks()) {
					splashContent = $(splashContent).hide();
				}
				$("#sizeme_detailed_view_content").append(splashContent);

                // login button
                $("#sizeme_btn_login").click(function() {
					SizeMe.trackEvent("clickLogin", "Store: Login clicked");
                    clearAuthToken();
                    SizeMe.loginFrame(function() {
                        sizeMeInit(loggedInCb);
                    });
                    return false;
                });

                $("#sizeme_btn_sign_up").click(function () {
					SizeMe.trackEvent("clickSignUp", "Store: Sign up clicked");
                    clearAuthToken();
                    return true;
                });

                // no thanks button
                $("#sizeme_btn_no_thanks").on("click", function() {
                    SizeMe.trackEvent("noThanks", "Store: SizeMe, no thanks");
                    createCookie("sizeme_no_thanks", "true", cookieLifetime);
                    $(".splash").hide();
					$("#sizeme_btn_no_thanks_product_splash").trigger("click");		// also close possible product splasher
                    return false;
                });

				// Product page splash
				if (!noProductSplash()) {
					$(sizeme_UI_options.appendSplashTo).append(getProductSplash());
					$("#sizeme_btn_no_thanks_product_splash").on("click", function() {
						SizeMe.trackEvent("noProductSplash", "Store: Product splash closed");
						createCookie("sizeme_no_product_splash", "true", cookieLifetime);
						$("#sizeme_product_splash").slideUp();
						return false;
					});

					$("#sizeme_product_page_link").on("click", function() {
						SizeMe.trackEvent("clickProductSplash", "Store: Product splash clicked");
					});

				}
            }

            // end of function 	loggedOutCb
        };

        if (systemsGo) {
            if (noThanks()) {
                SizeMe.trackEvent("productPageNoSM", "Store: Product page load, SizeMe refused");
                loggedOutCb();
            } else {
                sizeMeInit(function (smObj) {
                    SizeMe.trackEvent("productPageLoggedIn", "Store: Product page load, logged in");
                    loggedInCb(smObj);
                }, function () {
                    SizeMe.trackEvent("productPageLoggedOut", "Store: Product page load, logged out");
                    loggedOutCb();
                });
            }
        }
        // *** End
    });

    function isLoggedIn() {
        return sizeMe !== null && sizeMe.state() === "resolved";
    }

    // Cookie functions
    function createCookie(name,value,days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
    }

    function readCookie(name) {
        var ca = document.cookie.split(';'), c;
        for (var i=0;i<ca.length;i++) {
            c = ca[i].trim().split('=');
            if (c[0] === name) {
                return c[1];
            }
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }

})(jQuery);

/* globals jQuery: false */

var sizeme_UI_options = {
	appendContentTo: ".sizeme-size-guide",
	appendSplashTo: ".descriptionholder .variationdataholder-size",
	sizeSelectionContainer: ".descriptionholder .variationdataholder-size",
	addToCartElement: ".addtocartlink",
	addToCartEvent: "click",
	lang: "en"
};

jQuery.noConflict(true);