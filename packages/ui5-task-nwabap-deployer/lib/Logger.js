const oLogger = require("@ui5/logger").getLogger("builder:customtask:nwabap-deployer");

class Logger {
    log(message) {
        oLogger.info(message);
    }

    error(message) {
        oLogger.error(message);
    }

    logVerbose(message) {
        oLogger.verbose(message);
    }
}

module.exports = Logger;
