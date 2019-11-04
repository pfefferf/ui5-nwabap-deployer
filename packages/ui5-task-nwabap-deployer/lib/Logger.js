const log = require("@ui5/logger").getLogger("builder:customtask:nwabap-deployer");

class Logger {
    log(... messages) {
        log.info(messages);
    }

    error(... messages) {
        log.error(messages);
    }

    logVerbose(... messages) {
        log.verbose(messages);
    }
}

module.exports = Logger;