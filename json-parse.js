(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root['Parse'] = factory();
    }
})(this, function() {
    /**
     * @author Liu Chaofan
     * @license MIT
     */
    function Parse(str) {
        if (!(this instanceof Parse)) return new Parse(str);
        str = str || '';
        this.input = str;
        this.tokens = [];
        this.at = 0;
        this.value = undefined;
        this.stack = [];
        this.skipSpace();
        this.value = this.parse();
        if (this.input[this.at] !== undefined)
            throw new SyntaxError(`Invalid token at ${this.at}`);
    }

    Parse.prototype.valueOf = function() {
        return this.value;
    };

    Parse.prototype.skipSpace = function() {
        while (/^\s/.test(this.input[this.at])) this.at++;
    };

    Parse.prototype.parse = function() {
        var ch = this.input[this.at];
        if (ch === '{') {
            return this.parseObject();
        }
        if (ch === '[') {
            return this.parseArray();
        }
        if (ch === '"') {
            return this.parseString();
        }
        if (/^[+-]?\d+(\.\d+)?/.test(this.input.slice(this.at))) {
            return this.parseNumber();
        }
        return this.parseWorld();
    };

    Parse.prototype.toString = function() {
        return Parse.stringify(this.value);
    };

    Parse.prototype.parseWorld = function() {
        this.stack.push('world');
        var input = this.input.slice(this.at);
        var value;
        var i = 0;
        switch (true) {
            case /^true/.test(input):
                value = true;
                i += 4;
                break;
            case /^false/.test(input):
                value = false;
                i += 5;
                break;
            case /^null/.test(input):
                value = null;
                i += 4;
                break;
            default:
                throw new SyntaxError(`Invalid token at ${this.at + i}`);
        }
        this.at += i;
        this.tokens.push({
            type: 'world',
            value: value
        });
        this.stack.pop();
        return value;
    };

    Parse.prototype.parseString = function() {
        this.stack.push('string');
        var input = this.input.slice(this.at);
        var value = '';
        var i = 0;
        var ch;
        var startSign = input[i];
        while ((ch = input[++i])) {
            if (ch && ch === startSign && input[i - 1] !== '\\') {
                i++;
                break;
            }
            value += ch;
        }
        this.at += i;
        this.tokens.push({
            type: 'string',
            value: value
        });
        this.stack.pop();
        return value;
    };

    Parse.prototype.parseNumber = function() {
        this.stack.push('number');
        var input = this.input.slice(this.at);
        var i = 0;
        var value = input.match(/^[+-]?\d+(\.\d+)?/)[0];
        i = value.length;
        value = Number(value);
        this.tokens.push({
            type: 'number',
            value: value
        });
        this.at += i;
        this.stack.pop();
        return value;
    };

    Parse.prototype.parseObject = function() {
        this.stack.push('object');
        var input = this.input;
        var value = {};
        var ch = input[++this.at];
        while ((ch = input[this.at]) && ch !== '}') {
            this.skipSpace();
            var k = this.parseString();
            this.skipSpace();
            if ((ch = input[this.at]) !== ':')
                throw new SyntaxError(`Invalid token at ${this.at}`);
            this.at++;
            this.skipSpace();
            var v = this.parse();
            value[k] = v;
            this.skipSpace();
            if (input[this.at] === ',' && input[this.at + 1] !== '}') {
                this.at++;
            }
        }
        this.at++;
        this.tokens.push({
            type: 'object',
            value: value
        });
        this.stack.pop();
        return value;
    };

    Parse.prototype.parseArray = function() {
        this.stack.push('array');
        var input = this.input;
        var value = [];
        var ch = input[++this.at];
        while ((ch = input[this.at]) && ch !== ']') {
            this.skipSpace();
            value.push(this.parse());
            this.skipSpace();
            if ((ch = input[this.at]) === ',' && input[this.at + 1] !== ']') {
                this.at++;
            }
        }
        this.at++;
        this.tokens.push({
            type: 'array',
            value: value
        });
        this.stack.pop();
        return value;
    };

    Parse.stringify = function stringify(value) {
        var str = '';
        if (typeof value === 'number') {
            return str + String(value);
        }
        if (typeof value === 'string') {
            for (var i = value.length; i--; ) {
                if (value[i] === '"')
                    value = value.slice(0, i) + '\\' + value.slice(i);
            }
            return str + '"' + value + '"';
        }
        if (typeof value === 'boolean') {
            return str + String(value);
        }
        if (value === null) {
            return str + 'null';
        }
        if (Array.isArray(value)) {
            str += '[';
            for (var i = 0; i < value.length; i++) {
                var _str = '';
                var v = stringify(value[i]);
                if (v === undefined) {
                    v = 'null';
                }
                _str += v;
                if (i !== value.length - 1) {
                    _str += ',';
                }
                str += _str;
            }
            str += ']';
            return str;
        }
        if (typeof value === 'object') {
            str += '{';
            var keys = Object.keys(value);
            for (var i = 0; i < keys.length; i++) {
                var _str = '';
                _str += stringify(keys[i]);
                _str += ':';
                var v = stringify(value[keys[i]]);
                if (v === undefined) continue;
                _str += v;
                if (i < keys.length - 1) {
                    _str += ',';
                }
                str += _str;
            }
            str += '}';
            return str;
        }
    };

    return Parse;
});
