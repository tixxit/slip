(function(global, undefined) {

var slip = global.slip = global.slip || {},
	joan = slip.joan = slip.joan || {},
	path = slip.path,
	ast = path.ast,
    typeOf = slip.typeOf,
    proto = "prototype",
    nop = function() { },	// Nop nop nitty nop nop.
    
    id = /^[a-zA-Z_]\w*$/,
    number = /^-?\d+(\.\d*)?([eE][-+]?\d+)?$/,
    str = /^(".*"|'.*')$/,
    simple = /^([-+*\/()!<>,:\.\[\]\?]|[=!<>]=|\/\/|&&|\|\||<<<?|>>>?)$/,
    kw = /^(true|false|and|or|not)$/,
    whitespace = /^[\s\.]+$/,
    tokenizer = /(\w+|[-+*\/%<>()!\.:\[\]]|[=!<>]=|\/\/|("([^"\\]*(\\.)?)+")|('([^'\\]*(\\.)?)+')|&&|\|\||\s+|.)/g,
    
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

            } else if (id.test(t)) {
                l(IDENTIFIER, t);

            } else if (number.test(t)) {
                l(NUMBER, t);

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
    function listExpr(termSym, type) {
        var partialType = "part_" + type,
            h = parser()
                .on(termSym, function() { pushNode(type, 0) })
                .or(binaryExpr(topLevelExpr)   // boolExpr is defined later...
                    .op(",", partialType)
                    .on(termSym, function() {
                        var last = result.pop(),
                            kids = [];
                        while (last.type == partialType) {
                            kids.push(last.children[1]);
                            last = last.children[0];
                        }
                        kids.push(last);

                        result.push(new Node(type, kids.reverse()));
                    })
                    .or(die("Unterminated list of type " + type + "; expecting " + termSym))
                );
        return h;
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
        .on("[", listExpr("]", "array"))
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
