const fieldInput = document.getElementById('input')
const fieldOutput = document.querySelector('#result')
const variablesSet = document.querySelector('.variables-set')
const colorCodesSupport = document.getElementById('color-codes-support')
let countOfValues = 1;
let parsed = ''

const parseHandler = () => {
    collectVariables()
    let input = fieldInput.value
    parsed = parser.parse(input)
    if (colorCodesSupport.checked) {
        result = colorize(parsed)
    } else {
        result = parsed
    }
    fieldOutput.innerHTML = result
}

const colorCodesSupportHandler = () => {
    if (colorCodesSupport.checked) {
        fieldOutput.innerHTML = colorize(parsed)
    } else {
        fieldOutput.innerHTML = parsed
    }
}

const addValueHandler = () => {
    let value = document.createElement('div')
    value.className = 'variable-' + countOfValues
    value.innerHTML = '<div class="key"><p>key:</p> <input class="variable-key" type="text" placeholder="amount"></div><div class="value"><p>value:</p> <input class="variable-value" type="text" placeholder="1"><button  onclick="removeVariable(\'' + countOfValues + '\');">X</button></div>'
    variablesSet.append(value)
    countOfValues++
}

function collectVariables() {
    parser.clearVariables()
    let list = document.querySelectorAll('.variables-set > [class^="variable-"');
    for (let i = 0; i < list.length; i++) {
        let key = list[i].querySelector('.variable-key').value;
        let value = list[i].querySelector('.variable-value').value;
        if (key.length > 0 && value.length > 0) {
            parser.set(key, value)
        }
    }
}

function colorize(str) {
    let current = str.indexOf('&')
    if (current == -1) return str
        let result = str.substring(0, current)
    let amountOfResets = 0;

    while (current != -1) {
        if (current >= str.length) break;
        let color = str.charAt(current + 1)
        let style = getStyleByColor(color)

        if (style == '') { // invalid color code
            result += str.indexOf("&", current + 2) == -1 ? str.substring(current) : str.substring(current, str.indexOf("&", current + 2))
        } else if (style == 'r') {// reset colors
            for (let i = 0; i < amountOfResets; i++) result += '</span>'
                amountOfResets = 0
            result += str.indexOf("&", current + 2) == -1 ? str.substring(current + 2) : str.substring(current + 2, str.indexOf("&", current + 2))
        } else { // valid color code
            result += '<span style=\"' + style + '\">' + (str.indexOf("&", current + 2) == -1 ? str.substring(current + 2) : str.substring(current + 2, str.indexOf("&", current + 2)))
            amountOfResets++;
        }

        if (str.indexOf("&", current + 1) == -1) {
            result.substring(current + 2)
            break;
        }
        current = str.indexOf("&", current + 1)
    }
    for (let i = 0; i < amountOfResets; i++) result += '</span>'
        return result;
}

function getStyleByColor(id) {
    switch(id) {
    case '0': return 'color: #000000;'
    case '1': return 'color: #0000AA;'
    case '2': return 'color: #00AA00;'
    case '3': return 'color: #00AAAA;'
    case '4': return 'color: #AA0000;'
    case '5': return 'color: #AA00AA;'
    case '6': return 'color: #FFAA00;'
    case '7': return 'color: #AAAAAA;'
    case '8': return 'color: #555555;'
    case '9': return 'color: #5555FF;'
    case 'a': return 'color: #AA0000;'
    case 'b': return 'color: #55FFFF;'
    case 'c': return 'color: #FF5555;'
    case 'd': return 'color: #FF55FF;'
    case 'e': return 'color: #FFFF55;'
    case 'f': return 'color: #FFFFFF;'
    case 'l': return 'font-weight: bold'
    case 'm': return 'text-decoration: line-through;'
    case 'n': return 'text-decoration: underline;'
    case 'o': return 'font-style: italic;'
    case 'r': return 'r'
    default: return '';
    }
}

function removeVariable(num) {
    let v = document.querySelector('.variable-' + num)
    if (v) v.remove()
}

document.getElementById('parse-btn').addEventListener('click', parseHandler);
document.getElementById('add-value-btn').addEventListener('click', addValueHandler);
colorCodesSupport.addEventListener('click', colorCodesSupportHandler)




/*

    StringParser

*/

class Parser {
    constructor() {
        this.OPEN_BRACKET = '{';
        this.CLOSE_BRACKET = '}';
        this.OPEN_PARENTHESIS = '(';
        this.CLOSE_PARENTHESIS = ')';
        this.SINGLE_QUOTE = '\'';
        this.COMMA = ',';
        this.variables = new Map();
        this.functions = new Map();
        this.functions.set("ADD", new ADD());
        this.functions.set("AND", new AND());
        this.functions.set("CONCAT", new CONCAT());
        this.functions.set("DIV", new DIV());
        this.functions.set("ENDSWITH", new ENDSWITH());
        this.functions.set("EQ", new EQ());
        this.functions.set("FALSE", new FALSE());
        this.functions.set("GT", new GT());
        this.functions.set("GTEQ", new GTEQ());
        this.functions.set("IF", new IF());
        this.functions.set("JOIN", new JOIN());
        this.functions.set("LT", new LT());
        this.functions.set("LTEQ", new LTEQ());
        this.functions.set("MOD", new MOD());
        this.functions.set("MUL", new MUL());
        this.functions.set("NOT", new NOT());
        this.functions.set("OR", new OR());
        this.functions.set("STARTSWITH", new STARTSWITH());
        this.functions.set("SUB", new SUB());
        this.functions.set("TRUE", new TRUE());
    }
    set(key, value) {
        this.variables.set(key, value);
    }
    unset(key) {
        this.variables.delete(key);
    }
    clearVariables() {
        this.variables.clear();
    }
    parse(line) {
        let currentIndex = line.indexOf(this.OPEN_BRACKET);
        if (currentIndex < 0) {
            return line;
        }
        let content = this.getContent(line, currentIndex);
        if (content == null) {
            return line;
        }
        let builder = [];
        builder.push(line.substring(0, currentIndex));
        while (true) {
            let parsed = this.parseCode(this.extractCodeBody(content));
            builder.push(parsed == null ? content : parsed);
            currentIndex += content.length;
            let nextIndex = line.indexOf(this.OPEN_BRACKET, currentIndex);
            if (nextIndex == -1) {
                builder.push(line.substring(currentIndex, line.length));
                return builder.join('');
            }
            let next = this.getContent(line, nextIndex);
            if (next == null) {
                return line;
            }
            builder.push(line.substring(currentIndex, nextIndex));
            currentIndex = nextIndex;
            content = next;
        }
    }
    numeric(line) {
        return parseFloat(line);
    }
    isNumeric(line) {
        return line.match(/-?\d+(\.\d+)?/) != null;
    }
    isString(line) {
        line = line.trim();
        if (line.length < 2) {
            return false;
        }
        let index = line.indexOf(this.SINGLE_QUOTE);
        if (index == -1) {
            return false;
        }
        let str = this.getContent(line, index);
        return str != null && str === line;
    }
    extractString(line) {
        line = line.trim();
        return line.substring(1, line.length - 1);
    }
    parseCode(line) {
        if (this.variables.has(line)) {
            return this.variables.get(line);
        }
        if (this.isString(line)) {
            return this.parse(this.extractString(line));
        }
        let index = line.indexOf(this.OPEN_PARENTHESIS);
        if (index <= 0) {
            return null;
        }
        let functionName = line.substring(0, index);
        let func = this.functions.get(functionName);
        if (func == null) {
            return null;
        }
        return func.parse(this, this.extractFunctionBody(line));
    }
    retrieveArguments(line) {
        let args= [];
        let index = 0;
        let content = this.getContent(line, index);
        while (content != null && index <= line.length) {
            args.push(content.trim());
            index += content.length + 1;
            content = this.getContent(line, index);
        }
        return args;
    }
    extractFunctionBody(line) {
        line = line.trim();
        let index = line.indexOf(this.OPEN_PARENTHESIS);
        return line.substring(index + 1, line.length - 1).trim();
    }
    extractCodeBody(line) {
        line = line.trim();
        let index = line.indexOf(this.OPEN_BRACKET);
        return line.substring(index + 1, line.length - 1).trim();
    }
    getContent(line, start) {
        let stringType = 'NONE';
        let counterString = 0;
        let counterOP = 0;
        let counterCP = 0;
        let counterOB = 0;
        let counterCB = 0;
        for (let index = start; index < line.length; index++) {
            let token = line.charAt(index);
            let shouldCheck = false;
            if (token === this.OPEN_BRACKET) {
                counterOB++;
            } else if (token === this.CLOSE_BRACKET) {
                counterCB++;
                shouldCheck = true;
            } else if (token === this.OPEN_PARENTHESIS) {
                counterOP++;
            } else if (token === this.CLOSE_PARENTHESIS) {
                counterCP++;
                shouldCheck = true;
            } else if (token === this.SINGLE_QUOTE) {
                if (stringType === 'NONE') {
                    stringType = 'SINGLE_QUOTE';
                    counterString++;
                } else if (stringType === 'SINGLE_QUOTE') {
                    counterString++;
                }
                if (counterString % 2 === 0) {
                    shouldCheck = true;
                }
            } else if (token === this.COMMA) {
                if (counterString % 2 === 0 && counterOB === counterCB && counterOP === counterCP) {
                    return line.substring(start, index);
                }
            }
            if (shouldCheck && counterOB === counterCB && counterOP === counterCP && counterString % 2 === 0) {
                return line.substring(start, index + 1);
            }
        }
        if (counterOB === counterCB && counterOP === counterCP && counterString % 2 === 0 && start < line.length) {
            return line.substring(start);
        }
        return null;
    }
}

class ADD {
    parse(parser, content) {
        let args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        var str1 = parser.parseCode(args[0]);
        var str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) + parser.numeric(str2));
        }
        return null;
    }
}

class AND {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length === 0) {
            return null;
        }
        const list = args.map(argument => {
            const parsed = parser.parseCode(argument);
            return parsed === null ? argument : parsed;
        })
        const result = list.every(s => {
            return s === "TRUE"
        });
        return String(result).toUpperCase();
    }
}

class CONCAT {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        let builder = '';
        for (let i = 0; i < args.length; i++) {
            let argument = args[i];
            let parsed = parser.parseCode(argument);
            if (parsed === null) parsed = argument;
            builder += (parsed);
        }
        return builder;

    }
}

class DIV {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) / parser.numeric(str2));
        }
        return null;

    }
}

class ENDSWITH {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length < 2) {
            return null;
        }
        let str = parser.parseCode(args[0]);
        str = str == null ? args[0] : str;
        for (let i = 1; i < args.length; i++) {
            const argument = args[i];
            let parsed = parser.parseCode(argument);
            parsed = parsed == null ? argument : parsed;
            if (str.endsWith(parsed)) {
                return "TRUE";
            }
        }
        return "FALSE";
    }
}

class EQ {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let first = parser.parseCode(args[0]);
        let second = parser.parseCode(args[1]);
        first = first === null ? args[0] : first;
        second = second === null ? args[1] : second;
        return String(first === second).toUpperCase();


    }
}

class FALSE {
    parse(parser, content) {
        return 'FALSE';
    }
}

class GT {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) > parser.numeric(str2)).toUpperCase();
        }
        return null;

    }
}

class GTEQ {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) >= parser.numeric(str2)).toUpperCase();
        }
        return null;
    }
}

class IF {
    parse(parser, content) {
        let args = parser.retrieveArguments(content);
        if (args.length !== 3) {
            return null;
        }
        let condition = parser.parseCode(args[0]);
        if (condition === null) {
            return null;
        }
        if (condition === "TRUE") {
            return parser.parseCode(args[1]);
        } else if (condition === "FALSE") {
            return parser.parseCode(args[2]);
        } else {
            return null;
        }
    }
}

class JOIN {
    parse(parser, content) {
        let args = parser.retrieveArguments(content);
        if (args.length < 2) {
            return null;
        }
        for (let i = 1; i < args.length; i++) {
            let argument = args[i];
            let parsed = parser.parseCode(argument);
            if (parsed == null) parsed = argument;
            args[i] = parsed;
        }
        let delimiter = args[0];
        let parsed = parser.parseCode(delimiter);
        return args.slice(1).join(parsed == null ? delimiter : parsed);
    }
}


class LT {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) < parser.numeric(str2)).toUpperCase();
        }
        return null;
    }
}

class LTEQ {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) <= parser.numeric(str2)).toUpperCase();
        }
        return null;
    }
}

class MOD {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) % parser.numeric(str2));
        }
        return null;
    }
}

class MUL {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) * parser.numeric(str2));
        }
        return null;
    }
}

class NOT {
    parse(parser, content) {
        let parsed = parser.parseCode(content);
        parsed = parsed === null ? content : parsed;
        if (parsed === "TRUE") {
            return "FALSE";
        } else if (parsed === "FALSE") {
            return "TRUE";
        } else {
            return null;
        }
    }
}

class OR {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length === 0) {
            return null;
        }
        const list = args.map(argument => {
            const parsed = parser.parseCode(argument);
            return parsed === null ? argument : parsed;
        })
        for (let i = 0; i < list.length; i++) {
            if (list[i] === 'TRUE') {
                return 'TRUE'
            }
        }
        return 'FALSE'
    }
}

class STARTSWITH {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length < 2) {
            return null;
        }
        let str = parser.parseCode(args[0]);
        str = str == null ? args[0] : str;
        for (let i = 1; i < args.length; i++) {
            const argument = args[i];
            let parsed = parser.parseCode(argument);
            parsed = parsed == null ? argument : parsed;
            if (str.startsWith(parsed)) {
                return "TRUE";
            }
        }
        return "FALSE";
    }
}

class SUB {
    parse(parser, content) {
        const args = parser.retrieveArguments(content);
        if (args.length !== 2) {
            return null;
        }
        let str1 = parser.parseCode(args[0]);
        let str2 = parser.parseCode(args[1]);
        str1 = str1 === null ? args[0] : str1;
        str2 = str2 === null ? args[1] : str2;
        if (parser.isNumeric(str1) && parser.isNumeric(str2)) {
            return String(parser.numeric(str1) - parser.numeric(str2));
        }
        return null;



    }
}

class TRUE {
    parse(parser, content) {
        return 'TRUE';
    }
}

const parser = new Parser();






// const OPEN_BRACKET = '{';
// const CLOSE_BRACKET = '}';
// const OPEN_PARENTHESIS = '(';
// const CLOSE_PARENTHESIS = ')';
// const SINGLE_QUOTE = '\'';
// const COMMA = ',';
//
// const variables = new Map();
// const functions = new Map();
//
//
// functions.set('ADD', (content) => {
//     if (arguments.length !== 2) {
//         return null;
//     }
//
//     let str1 = parseCode(arguments.get(0));
//     let str2 = parseCode(arguments.get(1));
//
//     str1 = str1 == null ? arguments.get(0) : str1;
//     str2 = str2 == null ? arguments.get(1) : str2;
//
//     if (isNumeric(str1) && isNumeric(str2)) {
//         return String.valueOf(numeric(str1) + numeric(str2));
//     }
//
//     return null;
// })
//
// functions.set('AND', (content) => {
//     let arguments = retrieveArguments(content);
//     for (let argument in arguments) {
//         let parsed = parseCode(argument);
//         parsed = parsed == null ? argument : parsed
//         if (parsed === 'FALSE') {
//             return 'FALSE'
//         }
//     }
//
//     return 'TRUE'
// })
//
// functions.set('CONCAT', (content) => {
//     let arguments = retrieveArguments(content);
//     let builder = '';
//     for (let argument in arguments) {
//         let parsed = parseCode(argument);
//         if (parsed == null) parsed = argument;
//         builder += (parsed);
//     }
//     return builder;
// })
//
// functions.set('DIV', (content) => {
//     console.log(content)
//     let arguments = retrieveArguments(content);
//     if (arguments.length !== 2) {
//         return null;
//     }
//
//     let str1 = parseCode(arguments[0]);
//     let str2 = parseCode(arguments[1]);
//
//     str1 = str1 == null ? arguments[0] : str1;
//     str2 = str2 == null ? arguments[1] : str2;
//
//     if (isNumeric(str1) && isNumeric(str2)) {
//         return String.valueOf(numeric(str1) / numeric(str2))  ;
//     }
//
//     return null;
// })
//
// functions.set('ENDSWITH', (content) => {
//     let arguments = retrieveArguments(content);
//     if (arguments.size() < 2) {
//         return null;
//     }
//
//     let str = parseCode(arguments[0]);
//     str = str == null ? arguments[0] : str;
//
//     for (let i = 1; i < arguments.size(); i++) {
//         let argument = arguments.get(i);
//         let parsed = parseCode(argument);
//         parsed = parsed == null ? argument : parsed;
//         if (str.endsWith(parsed)) {
//             return "TRUE";
//         }
//     }
//     return "FALSE";
// })
//
// functions.set('EQ', (content) => {
//     let arguments = retrieveArguments(content);
//         if (arguments.size() != 2) {
//             return null;
//         }
//
//         let first = parseCode(arguments.get(0));
//         let second = parseCode(arguments.get(1));
//
//         first = first == null ? arguments.get(0) : first;
//         second = second == null ? arguments.get(1) : second;
//
//         return String.valueOf(first.equals(second)).toUpperCase();
// })
//
// functions.set('FALSE', (content) => {
//     return 'FALSE'
// })
//
// functions.set('TRUE', (content) => {
//     return 'true';
// });
//
//
//
// function set(key, value) {
//     variables.set(key, value);
// }
//
// function unset(key) {
//     variables.delete(key);
// }
//
// function clearVariables() {
//     variables.clear();
// }
//
// function parse(line) {
//     let currentIndex = line.indexOf(OPEN_BRACKET);
//     if (currentIndex < 0) {
//         return line;
//     }
//
//     let content = getContent(line, currentIndex);
//     if (content == null) {
//         return line;
//     }
//
//     let builder = '';
//     builder += (line.substring(0, currentIndex))
//
//     while (true) {
//         let parsed = parseCode(extractCodeBody(content));
//         builder += (parsed == null ? content : parsed);
//
//         currentIndex += content.length;
//         let nextIndex = line.indexOf(OPEN_BRACKET, currentIndex);
//         if (nextIndex == -1) {
//             builder += (line.substring(currentIndex, line.length))
//             return builder;
//         }
//
//         let next = getContent(line, nextIndex);
//         if (next == null) {
//             return line;
//         }
//
//         builder += (line.substring(currentIndex, nextIndex))
//         currentIndex = nextIndex;
//         content = next;
//     }
// }
//
// function numeric(line) {
//     return Number(line);
// }
//
// function isNumeric(line) {
//     return !isNaN(line)
// }
//
// function isString(line) {
//     line = line.trim();
//     if (line.length < 2) {
//         return false;
//     }
//     let index = line.indexOf(SINGLE_QUOTE);
//     if (index == -1) {
//         return false;
// //            index = line.indexOf(DOUBLE_QUOTE);
// //            if (index == -1) {
// //                return false;
// //            }
//     }
//     let str = getContent(line, index);
//     return str != null && str.equals(line);
// }
//
// function extractString(line) {
//     line = line.trim();
//     return line.substring(1, line.length - 1);
// }
//
// function parseCode(line) {
//     if (variables.has(line)) {
//         return variables.get(line);
//     }
//
//     if (isString(line)) {
//         return parse(extractString(line));
//     }
//
//     let index = line.indexOf(OPEN_PARENTHESIS);
//     if (index <= 0) {
//         return null;
//     }
//
//     let functionName = line.substring(0, index);
//     let fun = functions.get(functionName);
//     if (fun == null) {
//         return null;
//     }
//
//     return fun(extractFunctionBody(line));
// }
//
// function retrieveArguments(line) {
//     let arguments = []
//     let index = 0;
//     let content = getContent(line, index);
//     while (content != null && index <= line.length) {
//         arguments.push(content.trim());
//         index += content.length + 1;
//         content = getContent(line, index);
//     }
//     return arguments;
// }
//
// function extractFunctionBody(line) {
//     line = line.trim();
//     let index = line.indexOf(OPEN_PARENTHESIS);
//     return line.substring(index + 1, line.length - 1).trim();
// }
//
// function extractCodeBody(line) {
//     line = line.trim();
//     let index = line.indexOf(OPEN_BRACKET);
//     return line.substring(index + 1, line.length - 1).trim();
// }
//
// function getContent(line, start) {
//     let stringType = StringType.NONE;
//     let counterString = 0;
//     let counterOP = 0;
//     let counterCP = 0;
//     let counterOB = 0;
//     let counterCB = 0;
//
//         // TODO: add additional checks to be sure that close bracket goes before open bracket
//
//         // TODO: add support for double-quoted strings
//
//     for (let index = start; index < line.length; index++) {
//         const token = line.charAt(index);
//         let shouldCheck = false;
//
//         if (token == OPEN_BRACKET) {
//             counterOB++;
//         } else if (token == CLOSE_BRACKET) {
//             if (counterOB > counterCB) {
//                 counterCB++;
//                 shouldCheck = true;
//             }
//         } else if (token == OPEN_PARENTHESIS) {
//             counterOP++;
//         } else if (token == CLOSE_PARENTHESIS) {
//             if (counterOP > counterCP) {
//                 counterCP++;
//                 shouldCheck = true;
//             }
//         } else if (token == SINGLE_QUOTE) {
//             if (stringType == StringType.NONE) {
//                 stringType = StringType.SINGLE_QUOTE;
//                 counterString++;
//             } else if (stringType == StringType.SINGLE_QUOTE) {
//                 counterString++;
//             }
//
//             if (counterString % 2 == 0) {
//                 shouldCheck = true;
//             }
// //            } else if (token == DOUBLE_QUOTE) {
// //                if (stringType == StringType.NONE) {
// //                    stringType = StringType.DOUBLE_QUOTE;
// //                    counterString++;
// //                } else if (stringType == StringType.DOUBLE_QUOTE) {
// //                    counterString++;
// //                }
// //
// //                if (counterString % 2 == 0) {
// //                    shouldCheck = true;
// //                }
//         } else if (token == COMMA) {
//             if (counterString % 2 == 0 && counterOB == counterCB && counterOP == counterCP) {
//                 return line.substring(start, index);
//             }
//         }
//
//         if (shouldCheck && counterOB == counterCB && counterOP == counterCP && counterString % 2 == 0) {
//             return line.substring(start, index + 1);
//         }
//
//     }
//
//         /*
//             TODO
//          */
//     if (counterOB == counterCB && counterOP == counterCP && counterString % 2 == 0 && start < line.length) {
//         return line.substring(start);
//     }
//
//     return null;
// }
//
//
//
// const StringType = {
//
//     NONE:'NONE',
//     SINGLE_QUOTE: 'SINGLE_QUOTE',
//     DOUBLE_QUOTE: 'DOUBLE_QUOTE'
//
// }