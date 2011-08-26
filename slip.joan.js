(function(global, undefined) {

var slip = global.slip = global.slip || {},
	joan = slip.joan = slip.joan || {},
	path = slip.path,
	ast = path.ast,
    typeOf = slip.typeOf,
    proto = "prototype",
    nop = function() { },	// Nop nop nitty nop nop.
    
    
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
	identStart = "\\$_" + makeCharClass([181,569,137,634,1,125,118,1,9,12,1,20,229,47,300,64,62,15,3,1,16,31,35,3,3,87,1,34,29,17,47,35,41,1,3,1,34,12,1,10,4,1,5,5,1,101,1,72,1,8,46,1,78,3,17,29,1,62,19,210,79,5,1,5,21,1,4,4,8,41,1,61745,1,46,-61497,3,1,93,1,9,1,63432,456,22,1,-63858,1,90,328,1191,1,127,1,108,104484,1,-103506,159,1,112720,3,4,9,95,1,16,49,368,-112485,152,1,125,150,31,165338,4160,-165690,1,151,1,7446,21014,1632,358,115,1,572,1,115,1,12,26,1,11462,9117,1,3],[65,25,33,24,94,22,25,29,32,456,462,10,26,3,144,3,10,2,13,2,6,19,22,81,84,137,147,156,167,36,47,38,112,25,80,41,81,97,161,28,59,87,124,32,54,21,64,24,197,52,84,8,25,5,8,5,12,6,14,20,23,5,11,3,80,4,14,20,23,5,47,2,24,2,20,7,14,20,23,5,11,3,80,6,14,20,23,5,11,3,80,4,13,2,28,10,86,7,14,21,24,8,11,3,80,6,13,21,24,8,11,3,80,6,13,39,104,4,11,16,21,22,25,7,12,6,66,46,63,5,84,2,5,5,20,2,18,4,128,7,10,34,63,3,61559,11,16,15,16,6,9,6,7,10,17,12,15,13,49,14,15,15,16,15,16,15,16,15,16,15,16,15,16,10,-61663,3,61744,14,15,15,16,15,16,4,-61783,15,62056,14,15,12,16,48,97,29,48,25,80,28,32,34,40,6,9,3,46,157,-62383,4,10,2,27,10,63371,4,9,5,6,37,47,22,193,21,33,24,239,3,10,5,6,15,16,3,49,14,15,12,-63943,7,64088,14,15,15,16,15,16,5,16,15,16,5,16,15,16,2,-64183,7,64328,14,15,15,16,15,16,15,16,8,-64368,42,65332,11,12,15,16,15,16,7,-65323,3,65407,11,12,15,16,15,-65428,244,69365,14,15,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,14,-69928,8,70089,14,15,15,16,15,16,15,16,15,16,15,16,2,-70165,2,6,5,9,3,7,39,42,2,6,31,34,2,6,5,9,3,7,13,16,39,73000,14,15,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,31,32,15,16,15,16,15,16,47,48,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,14,-73948,22,61,14,32,83,97,618,622,15,86417,14,15,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,95,96,15,16,15,16,15,16,8,-86923,69,92,11,14,2,18,16,32,16,32,11,32,50,160,86,96,39,47,69,81,27,80,28,32,3,16,42,65,5,63,21,32,51,229,45,64,5,62,28,61,36,64,34,90,34,143,2,5,2,18,63,112384,14,15,15,16,15,16,15,16,15,16,4,7,8,9,15,16,15,16,15,16,12,26,2,6,9,13,2,3,3,6,9,10,15,16,15,16,15,16,5,8,2,8,4,7,5,9,15,16,9,12,2,4,4,10,5,9,12,13,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,15,16,5,9,6,7,15,19,12,13,10,13,2,3,15,16,10,13,2,3,15,16,4,7,8,9,15,16,4,7,8,9,14,16,15,16,14,16,15,16,8,11,4,5,15,16,8,11,4,5,15,16,2,5,6,-113223,65,131,276,280,4,8,36,40,4,8,6,14,30,34,51,54,5,11,2,5,5,10,2,6,4,10,11,22,5,153,12,123,8,14,4,17,3,6,9,13,2,9,3,26,40,2720,46,49,45,48,131,139,2,21,36,48,52,79,22,33,5,8,5,8,5,8,5,8,5,8,5,8,5,8,5,182823,541,-182238,7,16,3,7,3,9,84,96,88,91,2,9,39,44,92,111,25,80,14,28176,1163,1232,44,48,267,272,14,48,45,63,23,33,78,119,7,11,101,105,2,21,8,90,6,13,2,5,21,52,50,66,48,112,4,23,27,39,21,48,27,36,45,123,40,69,6,28,21,31,47,58,3,72,4,8,4,8,4,15,5,8,5,152,33,11248,21,27,47,8501,300,304,60,64,104,144,5,19,3,11,9,12,11,14,3,14,106,141,361,381,62,66,52,94,10,128,3,6,133,171,24,32,24,37,87,92,4,8,4,8,4]),
	identPart = identStart + makeCharClass([1473,1,3,291,318,1,51,1,224,1,39,31,1,69,4,1,21,1,31,1,69,4,1,123,1,3,1,22,31,1,69,4,1,10,12,100,1,58,1,68,1,14,13,32,68,1,14,13,32,68,1,26,1,32,112,201,93,30,7,1,72,62070,-61854,1,3,1,63902,1,3,51,1,1607,1,-64804,1,948,1,31,1,31,32,153,1,444,440,1,335,1,32,111953,1,-111159,51,3248,1,937,30178,1,116,277,123,459,1,99,3,1,4,7,302,21063,26,1],[48,9,720,111,388,3,270,43,126,10,60,29,138,6,10,4,11,2,6,8,63,26,119,9,26,8,43,7,43,2,5,7,14,3,215,2,62,16,19,5,21,8,87,6,41,8,87,4,40,11,27,2,61,7,41,8,87,6,41,8,87,4,13,2,27,9,89,5,12,2,28,8,87,6,13,2,28,8,88,5,12,2,28,8,104,5,9,7,92,6,20,6,9,8,99,5,21,4,8,8,80,8,81,18,28,9,12,34,146,18,21,8,62560,8,-62538,2,17,5,10,2,17,10,13,13,63869,2,1523,2,57,13,46,8,74,9,-63738,28,41,9,49,8,271,11,17,10,22,8,106,15,32,8,71,3,62,8,11,27,31,9,17,8,112,3,52,15,28,8,27,7,54,8,15,8,54,12,62,18,28,8,16,8,132,19,111761,3,8,4,14,6,10,5,37,2,1572,48,-113166,37,60,2,723,12,21,11,3323,31,587,4,30198,8,514,4,146,15,28,8,16,16,32,8,38,6,33,11,57,2,51,12,29,8,89,12,39,8,402,7,14,8,873744,238,-852737,15,33,5,240,8]),
	unicodeEscape = "\\\\u[0-9a-fA-F]{4}",
	_identifier = "(([" + identStart + "]|" + unicodeEscape + ")([" + identPart + "]|" + unicodeEscape + ")*)",
	_number = "((\\.[0-9]+|[0-9](\\.[0-9]*)?)([eE][+-]?[0-9]+)?)",
    
    id = new RegExp("^" + _identifier + "$"),
    number = new RegExp("^" + _number + "$"),
    str = /^(".*"|'.*')$/,
    simple = /^([-+*\/()!<>,:\.\[\]\?]|[=!<>]=|\/\/|&&|\|\||<<<?|>>>?)$/,
    kw = /^(true|false|and|or|not)$/,
    whitespace = /^[\s\.]+$/,
    tokenizer = new RegExp([
    				_number,
    				_identifier,
    				"[-+*/%<>()!\\.:\\[\\]]",
    				"[=!<>]=",
    				"//",
    				"(\"([^\"\\\\]*(\\\\.)?)+\")",
    				"('([^'\\\\]*(\\\\.)?)+')",
    				"&&|\\|\\|",
    				"\s+",
    				"." 	// Catch-all
    			].join("|"), "g"),
    //tokenizer = /(\w+|[-+*\/%<>()!\.:\[\]]|[=!<>]=|\/\/|("([^"\\]*(\\.)?)+")|('([^'\\]*(\\.)?)+')|&&|\|\||\s+|.)/g,
    
    // Converts strings of length 3 or less to tokens.
    strToToken = function(s) {
        var i = s.length, tok = 0;
        while (i--)
            tok |= s.charCodeAt(i) << (i * 8);
        return tok;
    },
    tokid = function() { return EOS++ },
    
    EOS = 0x1000000,
    IDENTIFIER = tokid(),
    NUMBER = tokid(),
    STRING = tokid(),
    TRUE  = tokid(),
    FALSE = tokid(),
    
    keywords = {
        "true": TRUE,
        "false": FALSE,
        or: strToToken("||"),
        and: strToToken("&&"),
        not: strToToken("!")
    };


/*
 * Lexer
 */

function token(symbol, value) { return { sym: symbol, val: value } }

function lex(input) {
    var tokens = input.match(tokenizer).reverse(),
        pushBackStack = [],
        c,
        l = function(tok, val) {
            if (tok !== undefined) {
                if (val !== undefined)
                    tok = token(tok, val);
                pushBackStack.push(tok);
                return tok;
            }

            if (pushBackStack.length)
                return pushBackStack.pop();

            var t = tokens.pop();

            if (!t) {
                l(EOS, "");

            } else if (t.length <= 3 && simple.test(t)) {
                l(strToToken(t), t);

            } else if (kw.test(t)) {
                l(keywords[t], t);

            } else if (whitespace.test(t)) {

            } else if (str.test(t)) {
                l(STRING, t.substring(1, t.length - 1));

            } else if (number.test(t)) {
                l(NUMBER, t);
            
            } else if (id.test(t)) {
                l(IDENTIFIER, t);

            } else {
                throw new Error("Unexpected character: '" + t + "'");
            }

            return l();
        };

    return l;
}


/**
 *
 * @param lexer An expression lexer, as returned by joan.lexer().
 * @return An AST for the expression.
 * @throws An error if the expression cannot be parsed.
 */
function Parser() {
    var lexer,
    	result;
    
    function push() { result.push.apply(result, arguments) }
    function pop(n) { return n > 0 ? result.splice(-n) : result.pop() }


    function die(msg) {
        return function() {
        	var sym = lexer().sym;
        	lexer = result = undefined;
            throw new Error("Syntax error (unexpected symbol '" + sym + "'): " + msg)
        }
    }

    function parser(headExpr) {
        var symFunc = {},
            before = headExpr,
            or = nop,
            parser = function(opts) {
                opts = opts || {};
                if (!opts.tailOnly && before)
                    before();

                var tok = lexer(),
                    f;

                if (tok) {
                    f = symFunc[tok.sym];
                    if (f) {
                        f.call(this, tok);
                    } else {
                        lexer(tok);
                        opts.or ? opts.or() : or();
                    }
                }
            };

        parser.leftRecurse = function() { parser({ tailOnly: true }) };

        parser.consume = function(sym) {
            parser.on(sym, nop);
            return parser;
        };

        parser.on = function(sym, cb) {
            sym = sym.charCodeAt ? strToToken(sym) : sym;
            sym = sym.length ? sym : [sym];
            for (var i = sym.length; i--;)
                symFunc[sym[i]] = cb;
            return parser;
        };

        parser.or = function(cb) {
            or = cb;
            return parser;
        };

        return parser;
    }

    /**
     * Creates a parser for a simple left-recursive binary operator
     * expression.
     *
     * @param subExpr The expr with the next higher level of precedence.
     * @return A parser to handle the simple binary expression.
     */
    function binaryExpr(subExpr) {
        var f = parser(subExpr);
        f.op = function(sym, type) {
        	type = type || sym;
        	
            return f.on(sym, function(tok) {
                subExpr();
                push(ast.Op(type, 2, pop(2)));
                f.leftRecurse();
            });
        };
        return f;
    }


    var topLevelExpr = function() { ternaryExpr() };


    /**
     * Creates an expression parser to handle "list-type" expressions.
     * These are expressions separated by COMMAs and terminated by some
     * symbol. For instance, listExpr(RBRACKET, "array"), will handle
     * expressions like, "a,b,c]".
     *
     * This was created to aggregate the 2 very similar cases of argument
     * lists and array literals, which differ only in their terminating symbol.
     */
    function listExpr(termSym, cb) {
    	return (function() {
	        var length,
	        	next = parser(),
	        	list = parser();
	        
	        next.on(",", function() {
		        	topLevelExpr();
		        	length += 1;
		        	next();
		        })
		        .on(termSym, function() {
		        	cb(length);
		        })
		        .or(die("Unterminated list; expecting " + termSym));
		        
		    list.on(termSym, function() { cb(0) })
		    	.or(function() {
		    		topLevelExpr();
		    		length = 1;
		    		next();
		    	});
		    
		    list();
	   });
    }


    // Value expressions correspond to semantically important terminals.
    var primaryExpr = parser()
        .on("(", parser(topLevelExpr).consume(")").or(die("Unmatched parenthesis.")))
        .on(IDENTIFIER, function(tok) {
        	push(ast.Member(ast.Context(), ast.String(tok.val)));
        })
        .on(NUMBER, function(tok) {
        	push(ast.Number(+tok.val));
        })
        .on(STRING, function(tok) {
        	push(ast.String(tok.val));
        })
        .on(TRUE, function(tok) {
        	push(ast.Boolean(true));
        })
        .on(FALSE, function(tok) {
        	push(ast.Boolean(false));
        })
        .on("[", listExpr("]", function(length) {
        	push(length ? ast.Array(pop(length)) : ast.Array([]));
        }))
        .or(die("Expected identifier, literal, or parenthesized expression."));


    // Object access and method call expression (eg. a.b.c, x[y], add(1,2,3)).
    var accessExpr = parser(primaryExpr)
        .on(".", function() {
            (parser()
                .on(IDENTIFIER, function(tok) {
                	push(ast.String(tok.val))
                })
                .or(die("Expected an identifier for object access."))
            )();
            
            push(ast.Member.apply(undefined, pop(2)));

            accessExpr.leftRecurse();
        })
        .on("[", function() {
            parser(topLevelExpr).consume("]").or(die("Expected right bracket."))();
            
            push(ast.Member.apply(undefined, pop(2)));

            accessExpr.leftRecurse();
        });
        
        /* Function calls not currently supported.
        
        .on("(", function() {
            listExpr(")", "arguments")();
            push(ast.Call.apply(pop(2)));
        });
        
        */

    function wrap(subExpr, type) {
    	return function() {
    		subExpr();
    		push(ast.Op(type, 1, pop(1)));
    	}
    }

    // Unary expression (eg. +a, -22, !!!!true, etc.).
    var unaryExpr = parser();
    unaryExpr
        .on("+", wrap(unaryExpr, "unary_+"))
        .on("-", wrap(unaryExpr, "unary_-"))
        .on("!", wrap(unaryExpr, "unary_!"))    // Right associative !!
        .or(accessExpr);

    // Product expression (eg. 3*4 or 63 % 7).
    var prodExpr = binaryExpr(unaryExpr)
        .op("*")
        .op("/")
        .op("//")
        .op("%");

    // Term expression (eg. 3+4).
    var termExpr = binaryExpr(prodExpr)
        .op("+")
        .op("-");

    // bitShiftExpr -- <<, >>>
    var bitShiftExpr = binaryExpr(termExpr)
        .op(">>>")	// Right shift.
        .op("<<")	// Left shift.
        .op(">>");	// Right rotate.

    // Relational expression (eg. a < b, d != "asdf").
    var relExpr = binaryExpr(bitShiftExpr)
        .op("<")
        .op("<=")
        .op(">")
        .op(">=");

    var eqExpr = binaryExpr(relExpr)
        .op("==")
        .op("!=");

    // bitExpr -- |, &, ^
    var bitExpr = binaryExpr(eqExpr)
        .op("|")
        .op("&")
        .op("^");

    // Boolean binary expression (eg. or, and, xor).
    var boolExpr = binaryExpr(bitExpr)
    	.on("||", function(tok) {
            bitExpr();
            var rhs = pop(),
            	lhs = pop();
            push(ast.If(lhs, lhs, rhs));
            boolExpr.leftRecurse();
        })
        .on("&&", function(tok) {
        	bitExpr();
        	var rhs = pop(),
        		lhs = pop();
        	push(ast.If(lhs, rhs, lhs));
        	boolExpr.leftRecurse();
        })

    // ternaryExpr -- x ? x : x
    var ternaryExpr = parser(boolExpr)
        .on("?", function() {
            ternaryExpr();
            parser().consume(":").or(die("Expected ':' in ternary expression."))();
            ternaryExpr();
            
            push(ast.If.apply(undefined, pop(3)));
        });

    // Top level for expressions.
    var expr = parser(ternaryExpr)
        .consume(EOS)
        .or(die("Expected end of stream."));
    
    
    this.parse = function(lex) {
    	lexer = lex;
    	result = [];
    	
    	expr();
    	
    	var ast = result.pop();
    	lexer = result = undefined;
    	return ast;
    };
}

joan.parser = new Parser();
joan.lex = function(input) { return lex(input) }
joan.parse = function(input) { return joan.parser.parse(joan.lex(input)) };

slip.path.compiler["joan"] = new slip.path.Compiler()
	.registerPhase("parser", {
		process: joan.parse
	})
	.registerPhase("compiler", slip.path.compiler.ast);

})(this);
