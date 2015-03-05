!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.kolaHooks=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ExecutionChainTimeout = (function () {
    function ExecutionChainTimeout(kommand) {
        this.name = "ExecutionChainTimeout";
        this.message = "Execution timeout";
        this.kommand = kommand;
    }
    return ExecutionChainTimeout;
})();
exports.ExecutionChainTimeout = ExecutionChainTimeout;
var ExecutionChain = (function () {
    function ExecutionChain(payload, kontext, options) {
        this.payload = payload;
        this.kontext = kontext;
        this.options = options;
        this.currentIndex = 0;
        this.executed = {};
    }
    ExecutionChain.prototype.now = function () {
        this.next();
        return this;
    };
    ExecutionChain.prototype.onDone = function (index, error) {
        //if this index is equal to currentIndex then call next
        //if not, ignore, but if it has an error, let it call on error
        clearTimeout(this.timeoutId);
        if (error && this.options.errorCommand) {
            this.options.errorCommand(error, this.kontext);
            if (this.options.fragile)
                return;
        }

        this.currentIndex++;
        this.next();
    };
    ExecutionChain.prototype.next = function () {
        var _this = this;
        if (this.executed[this.currentIndex])
            return;
        if (this.currentIndex < this.options.commands.length) {
            var command = this.options.commands[this.currentIndex];
            var done;
            if (command.length > 2) {
                done = function (error) {
                    _this.onDone(_this.currentIndex, error);
                };
                var onTimeout = function () {
                    _this.onDone(_this.currentIndex, new ExecutionChainTimeout(command));
                };
                this.timeoutId = setTimeout(onTimeout, this.options.timeout);
                command(this.payload, this.kontext, done);
            }
            else {
                ;
                command(this.payload, this.kontext);
                this.currentIndex++;
                this.next();
            }
            this.executed[this.currentIndex] = true;
        }
    };
    return ExecutionChain;
})();
exports.ExecutionChain = ExecutionChain;
var ExecutionChainFactory = (function () {
    function ExecutionChainFactory(commandChain) {
        this.commandChain = commandChain;
    }
    ExecutionChainFactory.prototype.breakChainOnError = function (value) {
        this.chainBreaksOnError = value;
        return this;
    };
    ExecutionChainFactory.prototype.onError = function (command) {
        this.onErrorCommand = command;
        return this;
    };
    ExecutionChainFactory.prototype.timeout = function (ms) {
        this.timeoutMs = ms;
        return this;
    };
    ExecutionChainFactory.prototype.execute = function (payload, kontext) {
        return new ExecutionChain(payload, kontext, {
            "commands": this.commandChain,
            "errorCommand": this.onErrorCommand,
            "fragile": this.chainBreaksOnError,
            "timeout": this.timeoutMs
        }).now();
    };
    return ExecutionChainFactory;
})();
exports.ExecutionChainFactory = ExecutionChainFactory;
function executes(kommand) {
    return new ExecutionChainFactory(kommand);
}
exports.executes = executes;

},{}]},{},[1])(1)
});