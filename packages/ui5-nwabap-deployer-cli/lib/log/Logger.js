const winston = require("winston");

class Logger {
    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: "YYYY-MM-DD HH:mm:ss"
                        }),
                        winston.format.colorize(),
                        winston.format.printf((msg) => {
                            if (typeof(msg.message) === "object") {
                                return `${msg.timestamp} ${msg.level}: ${JSON.stringify(msg.message, null, 4)}`;
                            }
                            return `${msg.timestamp} ${msg.level}: ${msg.message}`;
                        })
                    )
                })
            ]
        });
    }

    log(message) {
        this.logger.info(message);
    }

    error(message) {
        this.logger.error(message);
    }

    logVerbose(message) {
        this.logger.verbose(message);
    }
}

module.exports = Logger;
