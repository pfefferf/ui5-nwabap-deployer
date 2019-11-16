"use strict";

const PREFIX = "NWABAP UI5UPLOADER: ";

class Logger {
    constructor(oGrunt) {
        this._oGrunt = oGrunt;
    }

    log(message) {
        this._oGrunt.log.writeln(PREFIX + message);
    }

    error(message) {
        this._oGrunt.fail.warn(PREFIX + message);
    }

    logVerbose(message) {
        this._oGrunt.verbose.writeln(PREFIX + message);
    }
}

module.exports = Logger;
