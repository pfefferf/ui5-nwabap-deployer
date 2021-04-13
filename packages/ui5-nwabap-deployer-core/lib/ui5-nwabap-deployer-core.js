"use strict";

const FileStore = require("./FileStore");
const TransportManager = require("./TransportManager");
const isBinaryFile = require("isbinaryfile").isBinaryFileSync;

/**
 * Checks on Options
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 * @returns {Boolean} checks successful?
 */
function checkOptions(oOptions, oLogger) {
    let bCheckSuccessful = true;

    if (!oOptions.conn || !oOptions.conn.server) {
        oLogger.error("Connection configuration not (fully) specificed (check server).");
        bCheckSuccessful = false;
    }

    if (!oOptions.auth || !oOptions.auth.user || !oOptions.auth.pwd) {
        oLogger.error("Authentication configuration not (fully) specified (check user name and password).");
        bCheckSuccessful = false;
    }

    if (!oOptions.ui5 || !oOptions.ui5.package || !oOptions.ui5.bspcontainer || !oOptions.ui5.bspcontainer_text) {
        oLogger.error("UI5 configuration not (fully) specified (check package, BSP container, BSP container text information).");
        bCheckSuccessful = false;
    }

    if (oOptions.ui5 && oOptions.ui5.package && !oOptions.ui5.package.startsWith("$") && !oOptions.ui5.transportno &&
        oOptions.ui5.create_transport !== true && oOptions.ui5.transport_use_user_match !== true) {
        oLogger.error("For non-local packages (package name does not start with a \"$\") a transport number is necessary.");
        bCheckSuccessful = false;
    }

    if (oOptions.ui5.create_transport === true && typeof oOptions.ui5.transport_text !== "string") {
        oLogger.error("Please specify a description to be used for the created transport.");
        bCheckSuccessful = false;
    }

    if (oOptions.ui5 && oOptions.ui5.bspcontainer) {
        const bspcontainerExclNamespace = oOptions.ui5.bspcontainer.substring(oOptions.ui5.bspcontainer.lastIndexOf("/") + 1);
        if (bspcontainerExclNamespace.length > 15) {
            oLogger.error("BSP Container option must not be longer than 15 characters (exclusive customer specific namespace e.g. /YYY/.");
            bCheckSuccessful = false;
        }
    }

    return bCheckSuccessful;
}

/**
 * Synchronize Files
 * @param {object} oFileStoreOptions
 * @param {object} oLogger
 * @param {array} aFiles
 */
function syncFiles(oFileStoreOptions, oLogger, aFiles) {
    return new Promise((resolve, reject) => {
        const oFileStore = new FileStore(oFileStoreOptions, oLogger);

        oFileStore.syncFiles(aFiles, function(oError) {
            if (oError) {
                oLogger.error(oError);
                reject(oError);
                return;
            }
            resolve();
        });
    });
}

/**
 * Upload the files with an transport which does the user own.
 * @param {Object} oTransportManager Transport manager
 * @param {Object} oFileStoreOptions File Store Options
 * @param {Object} oLogger Logger
 * @Param {Array} aFiles Files
 */
async function uploadWithTransportUserMatch(oTransportManager, oFileStoreOptions, oLogger, aFiles) {
    return new Promise((resolve, reject) => {
        oTransportManager.determineExistingTransport(async function(oError, sTransportNo) {
            if (oError) {
                reject(oError);
                return;
            } else if (sTransportNo) {
                oFileStoreOptions.ui5.transportno = sTransportNo;
                try {
                    await syncFiles(oFileStoreOptions, oLogger, aFiles);
                    resolve();
                    return;
                } catch (oError) {
                    reject(oError);
                    return;
                }
            } else if (oFileStoreOptions.ui5.create_transport === true) {
                oTransportManager.createTransport(oFileStoreOptions.ui5.package, oFileStoreOptions.ui5.transport_text, async function(oError, sTransportNo) {
                    if (oError) {
                        reject(oError);
                        return;
                    }
                    oFileStoreOptions.ui5.transportno = sTransportNo;
                    try {
                        await syncFiles(oFileStoreOptions, oLogger, aFiles);
                        resolve();
                        return;
                    } catch (oError) {
                        reject(oError);
                        return;
                    }
                });
            } else {
                reject(new Error("No transport found and create transport was disabled!"));
                return;
            }
        });
    });
}

/**
 * Central function to deploy UI5 sources to a SAP NetWeaver ABAP system.
 * @param {Object} oOptions Options
 * @param {Array} aFiles Files to deploy
 * @param {Object} oLogger Logger
 */
exports.deployUI5toNWABAP = async function(oOptions, aFiles, oLogger) {
    return new Promise(async function(resolve, reject) {
        let oFileStoreOptions = {};

        oFileStoreOptions = Object.assign(oFileStoreOptions, oOptions);

        if (!oFileStoreOptions.ui5.language) {
            oFileStoreOptions.ui5.language = "EN";
        }

        if (!oFileStoreOptions.conn.hasOwnProperty("useStrictSSL")) {
            oFileStoreOptions.conn.useStrictSSL = true;
        }

        // checks on options
        if (!checkOptions(oFileStoreOptions, oLogger)) {
            reject(new Error("Configuration incorrect."));
            return;
        }

        // verbose log options
        oLogger.logVerbose("Options: " + JSON.stringify(oFileStoreOptions));

        // binary determination
        const aFilesAdapted = aFiles.map((oFile) => {
            oFile.isBinary = isBinaryFile(oFile.content);
            return oFile;
        });

        // verbose log files
        oLogger.logVerbose("Files: " + aFilesAdapted);

        // sync files
        const oTransportManager = new TransportManager(oFileStoreOptions, oLogger);
        let sExistingTransportNo = null;
        try {
            sExistingTransportNo = await oTransportManager.determineExistingTransportForBspContainer(oFileStoreOptions.ui5.package, oFileStoreOptions.ui5.bspcontainer);
        } catch (oError) {
            reject(oError);
            return;
        }

        if (sExistingTransportNo && oFileStoreOptions.ui5.transport_use_locked) {
            // existing transport lock
            oFileStoreOptions.ui5.transportno = sExistingTransportNo;
            oLogger.log(`BSP Application ${oFileStoreOptions.ui5.bspcontainer} already locked in transport request ${sExistingTransportNo}. This transport request is used for deployment.`);
            try {
                await syncFiles(oFileStoreOptions, oLogger, aFilesAdapted);
                resolve();
                return;
            } catch (oError) {
                reject(oError);
                return;
            }
        }

        if (!oFileStoreOptions.ui5.package.startsWith("$") && oFileStoreOptions.ui5.transportno === undefined) {
            if (oFileStoreOptions.ui5.transport_use_user_match) {
                try {
                    await uploadWithTransportUserMatch(oTransportManager, oFileStoreOptions, oLogger, aFilesAdapted);
                    resolve();
                    return;
                } catch (oError) {
                    reject(oError);
                    return;
                }
            } else if (oFileStoreOptions.ui5.create_transport === true) {
                // create new transport
                oTransportManager.createTransport(oFileStoreOptions.ui5.package, oFileStoreOptions.ui5.transport_text, async function(oError, sTransportNo) {
                    if (oError) {
                        reject(oError);
                        return;
                    }

                    oFileStoreOptions.ui5.transportno = sTransportNo;

                    try {
                        await syncFiles(oFileStoreOptions, oLogger, aFilesAdapted);
                        resolve();
                        return;
                    } catch (oError) {
                        reject(oError);
                        return;
                    }
                });
            } else {
                const oError = new Error("No transport configured and 'create transport' and 'use user match' options are disabled.");
                reject(oError);
                return;
            }
        } else {
            try {
                await syncFiles(oFileStoreOptions, oLogger, aFilesAdapted);
                resolve();
                return;
            } catch (oError) {
                reject(oError);
                return;
            }
        }
    });
};
