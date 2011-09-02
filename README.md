Slip
====

Not much usable yet. Right now slip provides 4 things:

1. `slip.Deferred`, a rather straightforward Deferred implementation;
2. `slip.Context`, an asynchronous wrapper for JS objects with a nice functional interface;
3. `slip.path`, a general AST and compiler that compiles the AST down to JS that makes use of `slip.Context`;
4. `slip.joan`, a simple JS-like expression language plug-in for slip.path.

Rather than write documentation right now, I'm just going to give a few
examples. You can see if you're interested or not.

The Context
-----------

Contexts provide map, flatMap, reduce, filter, zip, and forEach.
However, these are the "only" ways to access the data. Each method
returns another slip.Context, which let's you chain together a
series of transformations (Context is a monad).

	var ctxt = new slip.Context([ 1, 2, 3, 4, 5 ]);
	ctxt.map(function(i) { return i * i })
	    .filter(function(i) { return i % 2 })
	    .reduce(function(acc, i) { return acc + i }, 0)
	    .forEach(function(i) {
	        console.log(i);
	    });	// This last forEach(...) bit can be rewritten as ._log()
	// Prints: 35

Note that ctxt hasn't changed; each context is immutable!

	ctxt.zip(slip.context([ 5, 4, 3, 2, 1 ]))	// Lose the new.
	    .flatMap(slip.unpack(function(a, b) {
	    
	    	// slip.unpack simply "expands" the first array argument.
	    	// So, slip.unpack(fn)([ 1, 2, 3 ], 4) == fn(1, 2, 3, 4)
	    
	        return slip.context(a + b);
	    }))._log();
	// Prints: 6 (5 times)


Simpler Expressions with slip.path
----------------------------------

slip.path provides a way to access a Context in a more "natural"
way. You write "expressions" in a simpler language that are then
mapped to a series of calls on Contexts. Slip comes with one
expression language called JOAN (Javascript Object Access Notation).
This language covers most basic expressions in JS (literal values,
arithmetic operators (+, -, %, *, /), object access (a.p, a[p]),),
relational operators (eg. <, >, <=), boolean operators (&&, ||) with
non-strict operands, JS' ternary operator (a ? b : c), etc.

Since slip.path.eval/compile uses "joan" by default, you don't need
to pass it as a type parameter to slip.path.eval/compile.

	slip.path.eval("a.b + c", slip.context({ a: { b: 1 }, c: 2 }))._log();

To make things easier for simple cases, you can pass JS objects
directly, instead of a Context, and it will be wrapped for you. It is
also important to realize that Contexts treat arrays specially, making
Context the container for the elements of the array, rather than being
a container for the array itself.

	slip.path.eval("a + b", { a: [ 1, 2 ], b: [ 3, 4 ] })._log(); // 4, 6


Async JS with Deferreds, Contexts, and Path/JOAN Expressions
------------------------------------------------------------

This may seem silly, why bother using JOAN, or Contexts, when you
could've just done something like a.b + c directly. The magic of
Context is when you start using deferreds (asynchronous access).

	var a = new slip.Deferred(),
	    b = new slip.Deferred();	// Can also use slip.deferred()
	slip.path.eval("a * b", { a: a.promise, b: b.promise })._log();
	a.set(3);
	b.set(4);
	// Prints: 12

The value in the deferred could come from the completion of a
WebWorker, or the return of an AJAX request. Slip doesn't care, as
it provides a uniform interface to data, regardless if it is async
or not.

You can also use jQuery Deferreds instead... or mix and match.

	var a = slip.deferred(),
		b = $.get("/b.json");
	slip.path.eval("a + b", { a: a, b: b })._log();


Context Transforms
------------------

Slip provides a way of intercepting and replacing the objects wrapped
by a Context dynamically. It does this using "transforms". Transforms
are pretty straightforward. You give a name and a function that takes
an object and returns another to slip.context.transform(name, fn).

	var alias = { "Tom": "Thomas" };
	slip.context.transform("alias", function(obj) {
		return obj in alias ? alias[obj] : obj;
	});
	slip.path.eval("name", { name: "Tom" })._log();
	// Prints "Thomas"

Slip provides 1 transform by default, if you are using jQuery. It will
replace objects of the form { href: "..." } with the object at that URI.
For instance, say you have file `test-a.json` with the following contents:

	{ "message": "Hi, from A." }

Then you could do something like,

	var ctx = { head: { href: "test-a.json" }, tail: { message: ".." } };
	slip.path.eval("head.message + tail.message", ctx)._log();
	// Prints "Hi, from A..."

Transforms work with arrays too.

	var ctx = [ { href: "test-a.json" }, { href: "test-a.json" } ];
	slip.path.eval("message", ctx)._log();
	// Prints "Hi, from A." twice.


Compile to Javascript
---------------------

slip.path also let's you compile expressions down to static JS. The
compiled source is a function that takes a single argument (a
Context) and returns a Context.

	var source = slip.path.compile("[ a, b, 3 ]"),
	    expr = eval(source);
	expr(new slip.Context({ a: 1, b: 2 }))._log();
	// Prints: 1, 2, 3 (on different lines).

	console.log(slip.path.compile("1 + 2 * 5"));
	// Prints: "(function(context){return (11)})"

On the client, compilation is kind of pointless, but gives you a lot
more when using Slip on the server.
