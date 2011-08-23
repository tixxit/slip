(function(window, undefined) {

var slip = window.slip = window.slip || {},
	tokenizer = /\.|||[-+\/*%]|&&|\|\||\s+/g,
	escape = function(i, str) {
		str = i.toString(16);
		return "\\u" + "0000".substring(str.length) + str;
	},
	makeCharClass = function(s, r, i, len, p) {
		p = [];
		for (i = 0, len = s.length; i < len; i++)
			p.push(escape(s[i] = s[i] + (s[i - 1] || 0)));
		for (i = 0, len = r.length; i < len; i += 2)
			p.push(escape(r[i] = r[i] + (r[i - 2] || 0)), "-", escape(r[i] + r[i + 1]));
		return p.join("");
	},
	identStart = "$_" + makeCharClass([181,569,137,634,1,125,118,1,9,12,1,20,229,47,300,64,62,15,3,1,16,31,35,3,3,87,1,34,29,17,47,35,41,1,3,1,34,12,1,10,4,1,5,5,1,101,1,72,1,8,46,1,78,3,17,29,1,62,19,210,79,5,1,5,21,1,4,4,8,41,1,61745,1,46,-61497,3,1,93,1,9,1,63432,456,22,1,-63858,1,90,328,1191,1,127,1,108,104484,1,-103506,159,1,112720,3,4,9,95,1,16,49,368,-112485,152,1,125,150,31,165338,4160,-165690,1,151,1,7446,21014,1632,358,115,1,572,1,115,1,12,26,1,11462,9117,1,3],[65,25,33,24,94,22,25,29,32,456,462,10,26,3,144,3,10,2,13,2,6,19,22,81,84,137,147,156,167,36,47,38,112,25,80,41,81,97,161,28,59,87,124,32,54,21,64,24,197,52,84,8,25,5,8,5,12,6,14,20,23,5,11,3,80,4,14,20,23,5,47,2,24,2,20,7,14,20,23,5,11,3,80,6,14,20,23,5,11,3,80,4,13,2,28,10,86,7,14,21,24,8,11,3,80,6,13,21,24,8,11,3,80,6,13,39,104,4,11,16,21,22,25,7,12,6,66,46,63,5,84,2,5,5,20,2,18,4,128,7,10,34,63,3,61559,11,16,15,16,6,9,6,7,10,17,12,15,13,49,14,15,15,16,15,16,15,16,15,16,15,16,15,16,10,-61663,3,61744,14,15,15,16,15,16,4,-61783,15,62056,14,15,12,16,48,97,29,48,25,80,28,32,34,40,6,9,3,46,157,-62383,4,10,2,27,10,63371,4,9,5,6,37,47,22,193,21,33,24,239,3,10,5,6,15,16,3,49,14,15,12,-63943,7,64088,14,15,15,16,15,16,5,16,15,16,5,16,15,16,2,-64183,7,64328,14,15,15,16,15,16,15,16,8,-64368,42,65332,11,12,15,16,15,16,7,-65323,3,65407,11,12,15,16,15,-65428,244,69365,14,15,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,14,-69928,8,70089,14,15,15,16,15,16,15,16,15,16,15,16,2,-70165,2,6,5,9,3,7,39,42,2,6,31,34,2,6,5,9,3,7,13,16,39,73000,14,15,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,31,32,15,16,15,16,15,16,47,48,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,14,-73948,22,61,14,32,83,97,618,622,15,86417,14,15,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,95,96,15,16,15,16,15,16,8,-86923,69,92,11,14,2,18,16,32,16,32,11,32,50,160,86,96,39,47,69,81,27,80,28,32,3,16,42,65,5,63,21,32,51,229,45,64,5,62,28,61,36,64,34,90,34,143,2,5,2,18,63,112384,14,15,15,16,15,16,15,16,15,16,4,7,8,9,15,16,15,16,15,16,12,26,2,6,9,13,2,3,3,6,9,10,15,16,15,16,15,16,5,8,2,8,4,7,5,9,15,16,9,12,2,4,4,10,5,9,12,13,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,5,9,6,7,15,19,12,13,10,13,2,3,15,16,10,13,2,3,15,16,4,7,8,9,15,16,4,7,8,9,14,16,15,16,14,16,15,16,8,11,4,5,15,16,8,11,4,5,15,16,2,5,6,-113223,65,131,276,280,4,8,36,40,4,8,6,14,30,34,51,54,5,11,2,5,5,10,2,6,4,10,11,22,5,153,12,123,8,14,4,17,3,6,9,13,2,9,3,26,40,2720,46,49,45,48,131,139,2,21,36,48,52,79,22,33,5,8,5,8,5,8,5,8,5,8,5,8,5,8,5,182823,541,-182238,7,16,3,7,3,9,84,96,88,91,2,9,39,44,92,111,25,80,14,28176,1163,1232,44,48,267,272,14,48,45,63,23,33,78,119,7,11,101,105,2,21,8,90,6,13,2,5,21,52,50,66,48,112,4,23,27,39,21,48,27,36,45,123,40,69,6,28,21,31,47,58,3,72,4,8,4,8,4,15,5,8,5,152,33,11248,21,27,47,8501,300,304,60,64,104,144,5,19,3,11,9,12,11,14,3,14,106,141,361,381,62,66,52,94,10,128,3,6,133,171,24,32,24,37,87,92,4,8,4,8,4]),
	identPart = identStart + makeCharClass([1473,1,3,291,318,1,51,1,224,1,39,31,1,69,4,1,21,1,31,1,69,4,1,123,1,3,1,22,31,1,69,4,1,10,12,100,1,58,1,68,1,14,13,32,68,1,14,13,32,68,1,26,1,32,112,201,93,30,7,1,72,62070,-61854,1,3,1,63902,1,3,51,1,1607,1,-64804,1,948,1,31,1,31,32,153,1,444,440,1,335,1,32,111953,1,-111159,51,3248,1,937,30178,1,116,277,123,459,1,99,3,1,4,7,302,21063,26,1],[48,9,720,111,388,3,270,43,126,10,60,29,138,6,10,4,11,2,6,8,63,26,119,9,26,8,43,7,43,2,5,7,14,3,215,2,62,16,19,5,21,8,87,6,41,8,87,4,40,11,27,2,61,7,41,8,87,6,41,8,87,4,13,2,27,9,89,5,12,2,28,8,87,6,13,2,28,8,88,5,12,2,28,8,104,5,9,7,92,6,20,6,9,8,99,5,21,4,8,8,80,8,81,18,28,9,12,34,146,18,21,8,62560,8,-62538,2,17,5,10,2,17,10,13,13,63869,2,1523,2,57,13,46,8,74,9,-63738,28,41,9,49,8,271,11,17,10,22,8,106,15,32,8,71,3,62,8,11,27,31,9,17,8,112,3,52,15,28,8,27,7,54,8,15,8,54,12,62,18,28,8,16,8,132,19,111761,3,8,4,14,6,10,5,37,2,1572,48,-113166,37,60,2,723,12,21,11,3323,31,587,4,30198,8,514,4,146,15,28,8,16,16,32,8,38,6,33,11,57,2,51,12,29,8,89,12,39,8,402,7,14,8,873744,238,-852737,15,33,5,240,8]),
	unicodeEscape = "\\\\u[0-9a-fA-F]{4}",
	identifier = "(([" + identStart + "]|" + unicodeEscape + ")([" + identPart + "]|" + unicodeEscape + ")*)",
	number = "((\\.[0-9]+|[0-9](\\.[0-9]*)?)([eE][+-]?[0-9]+)?)",
	string = "(\"([^\"\\\\]*(\\\\\")?)*\"|'([^'\\\\]*(\\\\')?)*')",
	bool = /^(true|false)$/, 
	whitespace = /^\s+$/,
	tokenizer = new RegExp("^(" + [ "[-\\.+\\/*%\\s]", identifier, number, string, "&&|\\|\\|" ].join("|") + ")"),
	token = function(re) { return new RegExp("^" + re + "$") };
	
function str(val) { return ""+val }

function tokenize(expr, m, tokens) {
	tokens = [];
	while (expr) {
		m = tokenizer.exec(expr);
		if (!m) {
			throw new Error("Unexpected input: " + expr);
		}
		expr = expr.substring(m[0].length);
		if (!whitespace.test(m[0]))
			tokens.push(m[0]);
	}
	return tokens;
}

slip.tokenize = tokenize;
slip.tokenizer = tokenizer;
slip.ident = token(identifier);


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
	Op: Node("name", "arity", "args")
};

for (T in slip.path.ast)
	slip.path.ast[T].type = T;


/**
 * @todo Handle escape character better/more specific.
 */
function simpleCompilation(str) {
	return function() {
		var parts = str.match(/\$\d+|[^\$\\]+|\\.|./g),
			i = parts.length, part;
		while (i--) {
			part = parts[i];
			if (part[1]) {
				if (part[0] == "\\")
					parts[i] = part[1];
				else if (part[0] == "$")
					parts[i] = arguments[+part.substring(1)];
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
