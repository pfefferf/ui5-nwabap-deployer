'use strict';

/**
 * Logger constructor.
 * @public
 * @param {object} oGrunt Grunt object.
 */
function Logger(oGrunt) {
    this._oGrunt = oGrunt;
}

/**
 * log
 * @public
 */
Logger.prototype.log = function () {
    this._oGrunt.log.writeln.apply(this._oGrunt.log, Array.prototype.slice.call(arguments));
};

/**
 * log error
 * @public
 */
Logger.prototype.error = function () {
    this._oGrunt.fail.warn.apply(this._oGrunt.log, Array.prototype.slice.call(arguments));
};

/**
 * log verbose
 * @public
 */
Logger.prototype.logVerbose = function () {
    this._oGrunt.verbose.writeln.apply(this._oGrunt.verbose, Array.prototype.slice.call(arguments));
};

module.exports = Logger;