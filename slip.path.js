(function(window, undefined) {

var slip = window.slip = window.slip || {};
	
function str(val) { return ""+val }

function Node() {
	var props = Array.prototype.slice.call(arguments),
		obj = function() {
			var node = { children: [] },
				type = obj.type,
				visitMethod = "visit" + type;
			
			for (var i in props)
				node[props[i]] = arguments[i];
			node.accept = function(visitor) { return visitor[visitMethod](node) }
			node.type = function() { return type };
			node.children = function() {
				var kids = [],
					len = props.length,
					i = 0, cand;
				for (; i < len; i++) {
					cand = node[props[i]];
					if (cand && cand.accept)
						kids.push(node[props[i]]);
				}
				return kids;
			};
			return node;
		};
	obj.props = function() { return props.slice() };
	obj.type = "Node";
	return obj;
}

function Literal() {
	return Node("value");
}


slip.path = {};
var ast = slip.path.ast = {
	Boolean: Literal(),
	String: Literal(),
	Number: Literal(),
	Context: Node(),
	Member: Node("object", "member"),
	If: Node("cond", "then", "otherwise"), // Covers ?:, &&, and ||.
	Op: Node("name", "arity", "args"),
	Array: Node("elements")		// Array is optimized away by the ConstantFolder.
};

for (T in slip.path.ast)
	slip.path.ast[T].type = T;


/**
 * @todo Handle escape character better/more specific.
 */
function simpleCompilation(str) {
	return function() {
		var parts = str.match(/\$(\d+|\*)|[^\$\\]+|\\.|./g),
			i = parts.length, part;
		while (i--) {
			part = parts[i];
			if (part[1]) {
				if (part[0] == "\\") {
					parts[i] = part[1];
				} else if (part[0] == "$") {
					if (part[1] == "*")
						parts[i] = Array.prototype.join.call(arguments, ",");
					else
						parts[i] = arguments[+part.substring(1)];
				}
			}
		}
		return parts.join("");
	}
}


/**
 * This is used to define a function/operation.
 */
var def = slip.path.def = function(name, evaluate, compile) {
	if (!compile) {
		compile = "slip.path.lib[" + name + "].evaluate($*)";
	} else if (slip.typeOf(compile) == "string") {
		compile = simpleCompilation(compile);
	}
	
	slip.path.lib[name] = {
		evaluate: function() { return evaluate.apply(this, arguments) },
		compile: function() { return compile.apply(this, arguments) }
	};
	
	return slip.path.lib;
};

// Definitions of common operations and their compilations.
 
slip.path.lib = {};
def("unary_+", function(a) { return +a }, "+$0");
def("unary_-", function(a) { return -a }, "-$0");
def("unary_!", function(a) { return !a }, "!$0");
def("+", function(a, b) { return a + b }, "$0 + $1");
def("-", function(a, b) { return a - b }, "$0 - $1");
def("*", function(a, b) { return a * b }, "$0 * $1");
def("/", function(a, b) { return a / b }, "$0 / $1");
def("//", function(a, b) { return Math.floor(a - b) }, "Math.floor($0 / $1)");
def("==", function(a, b) { return a == b }, "$0 == $1");
def("<=", function(a, b) { return a <= b }, "$0 <= $1");
def(">=", function(a, b) { return a >= b }, "$0 >= $1");
def("<", function(a, b) { return a < b }, "$0 < $1");
def(">", function(a, b) { return a > b }, "$0 > $1");
def(">>", function(a, b) { return a >> b }, "$0 >> $1");
def("<<", function(a, b) { return a << b }, "$0 << $1");
def(">>>", function(a, b) { return a >>> b }, "$0 >>> $1");
def("[]", function() { return Array.prototype.slice.call(arguments) }, "[$*]");

function CompilationContext(parent) {
	var symbols = {};
}

function CompilationUnit() {	
}


function Visitor() { };
Visitor.prototype.visitNode = function(n) {
	var kids = n.children(),
		i = 0, len = kids.length;
	for (; i < len; i++)
		kids[i].accept(this);
};

for (T in slip.path.ast)
	Visitor.prototype["visit" + T] = Visitor.prototype.visitNode;
	

/**
 * Simple optimization that will fold constant expressions into a single
 * literal. For example, "1 + 2" will be replaced with "3", "true ? b : c"
 * with "b" and so on. It currently only handles constant expressions that
 * evaluate to a boolean, number or string.
 * 
 * This also turns ast.Array literals into an "[]" ast.Op.
 */
function ConstantFolder() {
	this.process = function(ast) {
		ast = ast.accept(this) || ast;
		return ast;
	};
	
	var literal = /^(Boolean|String|Number)$/;
	function isLiteral(n) {
		return n && literal.test(n.type());
	}
	
	this.visitBoolean = this.visitString = this.visitNumber = this.visitMember = function(n) { return n };
	
	this.visitIf = function(n) {
		var cond = n.cond.accept(this),
			then = n.then.accept(this),
			otherwise = n.otherwise.accept(this);
		
		cond && (n.cond = cond);
		then && (n.then = then);
		otherwise && (n.otherwise = otherwise);
		
		if (isLiteral(cond)) {
			return cond.value ? n.then : n.otherwise;
		}
	};
	
	this.visitOp = function(n) {
		var args = [], canReduce = true,
			result, type,
			i = 0, len = n.args.length;
		
		for (; i < len; i++) {
			result = n.args[i].accept(this);
			if (result)
				n.args[i] = result;
			
			canReduce = canReduce && isLiteral(result)
			if (canReduce)
				args.push(result.value);
		}
		
		if (canReduce) {
			result = slip.path.lib[n.name].evaluate.apply(undefined, args);
			type = slip.typeOf(result);
			
			if (type == "boolean")
				result = ast.Boolean(result);
			else if (type == "number")
				result = ast.Number(result);
			else if (type == "string")
				result = ast.String(result);
			else
				result = n;
			return result;
		}
	};
	
	this.visitArray = function(n) {
		return ast.Op("[]", n.elements.length, n.elements);
	};
};
ConstantFolder.prototype = new Visitor();


/**
 * This labels asynchronous nodes. This could be used by the compiler keep
 * expressions simpler if they don't require a Context. However, it is up to
 * the compiler to specialize for the non asynchronous nodes.
 */
function AsyncLabeler() {
	this.process = function(ast) {
		ast.accept(this);
		return ast;
	};
	
	this.visitContext = function(n) {
		return n.async = true;
	};
	
	this.visitMember = function(n) {
		this.visitNode(n);
		return n.async = true;
	};
	
	this.visitIf = function(n) {
		return n.async = n.cond.accept(this) && n.then.accept(this) && n.otherwise.accept(this);
	};
	
	this.visitOp = function(n) {
		var i = 0, len = n.args.length,
			async = false;
		for (; i < len; i++)
			async = n.args[i].accept(this) || async;
		return n.async = async;
	};
}
AsyncLabeler.prototype = new Visitor();


/**
 * A basic JS compiler. Produces pretty fluffy code right now.
 */
function JsCompiler() {
	var contextId = 0,
		contexts = [ new CompilationContext(0) ],
		stack = [],
		self = this;
	
	function push() { stack.push.apply(stack, arguments) }
	function pop(n) { return stack.splice(-n) }
	function zipAsync(vars, middle) {
		var p, async = [], sync = [],
			start = "", end = "",
			i, len,
			value = function(p) { vars[p].accept(self); return pop() };
		
		for (p in vars) {
			if (vars.hasOwnProperty(p)) {
				if (vars[p].async)
					async.push(p);
				else
					sync.push(p);
			}
		}
		
		if (sync.length) {
			start = "(function(" + sync.join(",") + "){return (";
			end = ")})(" + sync.map(value).join(",") + ")";
		}
		
		if (async.length) {
			p = async.shift();
			start += value(p);
			if (async.length) {
				start += ".zip(" + async.map(value).join(",")
					  +  ").flatMap(slip.unpack(function(" + p + ", " + async.join(",") + "){return (";
				end = ")}))" + end;
			} else {
				start += ".flatMap(function(" + p + "){return (";
				end = ")})" + end;
			}
		}
		
		p = [ start, middle, end ]
		return middle ? p.join("") : p;
	}
	
	this.process = function(ast) {
		ast.accept(this);
		return "(function(context){return (" + pop() + ")})";
	};
	
	this.visitBoolean = this.visitNumber = function(n) { push(str(n.value)) };
	this.visitString = function(n) { push("\"" + n.value + "\"") };
	
	this.visitContext = function(n) {
		push("context");
	};
	
	this.visitMember = function(memb) {
		push(zipAsync({ o: memb.object, p: memb.member }, "o[p]"));
	};
	
	this.visitIf = function(cond) {
		push(zipAsync({ c: cond.cond, t: cond.then, o: cond.otherwise }, "c?t:o"));
	};
	
	this.visitOp = function(op) {
		var fn = slip.path.lib[op.name],
			i = 0, len = op.args.length,
			args = {}, names = [], tmp;
		
		if (fn) {
			for (; i < len; i++) {
				args["_" + i] = op.args[i];
				names.push("_" + i);
			}
			
			push(zipAsync(args, fn.compile.apply(undefined, names)));
		} else {
			// TODO: In this case we should delegate to the context.
			throw new Error("No such operation: " + op.name);
		}
	};
}
JsCompiler.protoype = new Visitor();

function Compiler() {
	var phases = {},
		phaseOrder = [];
	
	this.registerPhase = function(name, phase, opts) {
		phases[name] = phase;
		phaseOrder.push(name);
		return this;
	};
	
	this.compile = function(ast) {
		var i = 0, len = phaseOrder.length,
			expr = ast;
			
		for (; i < len; i++) {
			expr = phases[phaseOrder[i]].process(expr);
		}
		
		return expr;
	};
	
	// Let the compiler be treated as a single phase.
	this.process = function(input) {
		return this.compile(input);
	}
}


slip.path.ConstantFolder = ConstantFolder;
slip.path.Compiler = Compiler;


// There can be many different named compilers.

var compiler = slip.path.compiler = {};


// A compiler that can be used by other compilers to compile a path ast down
// to Javascript.

compiler["ast"] = new Compiler()
	.registerPhase("constantFolder", new ConstantFolder())
	.registerPhase("asyncLabeler", new AsyncLabeler())
	.registerPhase("jsCompiler", new JsCompiler());


// A compiler that just wraps literal Javascript.

compiler["js"] = new Compiler()
	.registerPhase("wrapper", {
		process: function(js) { return "(function(context) {return (" + js + ")})" }
	});


// Presumptuous?

slip.path.defaultCompiler = "joan";


/**
 * Compiles an expression to Javascript. This can take an optional 'type'
 * parameter that indicates the language type (eg. "joan"). By default, slip
 * only comes with 3 languages: js, joan, and ast.
 * 
 * js: js just wraps a literal JS expression so it can be used with
 * 	   other parts of Slip.
 * 
 * joan: joan (Javascript Object Access Notation) is a simple JS-like language
 *       that can be used to access Slip's asynchronous contexts transparently.
 * 
 * ast: This is meant to be used by language writers and compiles a path AST
 * 	    into Javascript with variable/object access delegated to an async
 * 	    Slip Context.
 * 
 * What is returned is largely dependent on the type given. However, most types
 * should return a string that contains valid Javascript.
 * 
 * If type is omitted, then the type is assumed to be the value in
 * 'slip.path.defaultCompiler'. By default, this is "joan".
 * 
 * @param type A string specifying the type ("joan", "js", or "ast").
 * @param expr An 'expression' that is type-dependent (likely a string).
 * @return The result of compiling 'expr' using the 'type' compiler.
 */
slip.path.compile = function(type, expr) {
	if (expr === undefined) {
		expr = type;
		type = slip.path.defaultCompiler;
	}
	
	var compiler = slip.path.compiler[type];
	if (!compiler || !compiler.compile) {
		throw new Error("Cannot find compiler: " + type);
	}
	
	return compiler.compile(expr);
};


var cache = {};

/**
 * A convenience method that will compile an expression of type 'type' and
 * evaluate it using the given context. The only required parameter is 'expr',
 * all others can be omitted.
 */
slip.path.eval = function(type, expr, context) {
	if (context == undefined && slip.typeOf(expr) != "string") {
		if (expr) {
			context = expr;
			expr = type;
		} else {
			expr = type;
		}
		type = slip.path.defaultCompiler;
	}
	
	var fn = cache[expr] || eval(slip.path.compile(type, expr));
	cache[expr] = fn;
	if (!(context instanceof slip.Context))
		context = new slip.Context(context);
	return fn(context);
}

})(this);
