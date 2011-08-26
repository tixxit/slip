Slip
====

Not much usable yet. Right now slip provides 4 things:

1. `slip.Deferred`, a rather straightforward Deferred implementation;
2. `slip.Context`, an asynchronous wrapper for JS objects with a nice functional interface;
3. `slip.path`, a general AST and compiler that compiles the AST down to JS that makes use of `slip.Context`;
4. `slip.joan`, a simple JS-like expression language plug-in for slip.path.

Rather than write documentation right now, I'm just going to give a few
examples. You can see if you're interested or not.

	// Contexts provide map, flatMap, reduce, filter, zip, and forEach.
	// However, these are the "only" ways to access the data. Each method
	// returns another slip.Context, which let's you chain together a
	// series of transformations (Context is a monad).

	var ctxt = new slip.Context([ 1, 2, 3, 4, 5 ]);
	ctxt.map(function(i) { return i * i })
	    .filter(function(i) { return i % 2 })
	    .reduce(function(acc, i) { return acc + i }, 0)
	    .forEach(function(i) {
	        console.log(i);
	    });	// This last forEach(...) bit can be rewritten as ._log()
	// Prints: 35

	// Note that ctxt hasn't changed; each context is immutable!

	ctxt.zip(new slip.Context([ 5, 4, 3, 2, 1 ]))
	    .flatMap(slip.unpack(function(a, b) {
	    
	    	// slip.unpack simply "expands" the first array argument.
	    	// So, slip.unpack(fn)([ 1, 2, 3 ], 4) == fn(1, 2, 3, 4)
	    
	        return new slip.Context(a + b);
	    }))._log();
	// Prints: 6 (5 times)

	// slip.path provides a way to access a Context in a more "natural"
	// way. You write "expressions" in a simpler language that are then
	// mapped to a series of calls on Contexts. Slip comes with one
	// expression language called JOAN (Javascript Object Access Notation).
	// This language covers most basic expressions in JS (literal values,
	// arithmetic operators (+, -, %, *, /), object access (a.p, a[p]),),
	// relational operators (eg. <, >, <=), boolean operators (&&, ||) with
	// non-strict operands, JS' ternary operator (a ? b : c), etc.

	// Since slip.path.eval/compile uses "joan" by default, you don't need
	// to pass it as a type parameter to slip.path.eval/compile.

	slip.path.eval("a.b + c", new slip.Context({ a: { b: 1 }, c: 2 }))._log();

	// To make things easier for simple cases, you can pass JS objects
	// directly, instead of a Context, and it will be wrapped for you. It is
	// also important to realize that Contexts treat arrays specially, making
	// Context the container for the elements of the array, rather than being
	// a container for the array itself.

	slip.path.eval("a + b", { a: [ 1, 2 ], b: [ 3, 4 ] })._log(); // 4, 6

	// This may seem silly, why bother using JOAN, or Contexts, when you
	// could've just done something like a.b + c directly. The magic of
	// Context is when you start using deferreds (asynchronous access).

	var a = new slip.Deferred(),
	    b = new slip.Deferred();
	slip.path.eval("a * b", { a: a.promise, b: b.promise })._log();
	a.set(3);
	b.set(4);
	// Prints: 12

	// The value in the deferred could come from the completion of a
	// WebWorker, or the return of an AJAX request. Slip doesn't care, as
	// it provides a uniform interface to data, regardless if it is async
	// or not.

	// slip.path also let's you compile expressions down to static JS. The
	// compiled source is a function that takes a single argument (a
	// Context) and returns a Context, unless it only uses literals.

	var source = slip.path.compile("[ a, b, 3 ]"),
	    expr = eval(source);
	expr(new slip.Context({ a: 1, b: 2 }))._log();
	// Prints: 1, 2, 3 (on different lines).

	console.log(slip.path.compile("1 + 2 * 5"));
	// Prints: "(function(context){return (11)})"

	// On the client, compilation is kind of pointless, but gives you a lot
	// more when using Slip on the server.
