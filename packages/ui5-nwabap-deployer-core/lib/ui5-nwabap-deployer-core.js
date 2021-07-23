"use strict";

const UI5ABAPRepoClient = require("./UI5ABAPRepoClient");
const TransportManager = require("./TransportManager");

/**
 * Set default for language option
 * @param {Object} oOptions Options
 * @returns {object} Options
 */
 function setDefaultLanguage(oOptions) {
    if (!oOptions.ui5.language) {
        oOptions.ui5.language = "EN";
    }
    return oOptions;
}

/**
 * Set default for use strict ssl option
 * @param {Object} oOptions Options
 * @returns {Object} Options
 */
 function setDefaultUseStrictSSL(oOptions) {
    if (!oOptions.conn.hasOwnProperty("useStrictSSL")) {
        oOptions.conn.useStrictSSL = true;
    }
    return oOptions;
}

/**
 * Set default test mode to false
 * @param {Object} oOptions Options
 * @returns {Object} Options
 */
function setDefaultTestMode(oOptions) {
    if (!oOptions.conn.hasOwnProperty("testMode")) {
        oOptions.conn.testMode = false;
    }
    return oOptions;
}

/**
 * Checks on Connection Options
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 * @returns {Boolean} checks successful?
 */
function checkConnectionOptions(oOptions, oLogger) {
    if (!oOptions.conn || !oOptions.conn.server) {
        oLogger.error("Connection configuration not (fully) specified (check server).");
        return false;
    }
    return true;
}

/**
 * Checks on Authentication Options
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 * @returns {Boolean} checks successful?
 */
 function checkAuthenticationOptions(oOptions, oLogger) {
    if (!oOptions.auth || (!oOptions.auth.bearer_token && (!oOptions.auth.user || !oOptions.auth.pwd)) ) {
        oLogger.error("Authentication configuration not correct (check user/password or bearer token).");
        return false;
    }
    return true;
}

/**
 * Checks on Create Transport Options
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 * @returns {Boolean} checks successful?
 */
 function checkCreateTransport(oOptions, oLogger) {
    if (oOptions.ui5.create_transport === true && typeof oOptions.ui5.transport_text !== "string") {
        oLogger.error("Please specify a description to be used for the transport to be created.");
        return false;
    }
    return true;
 }

/**
 * Checks on Deploy Options
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 * @returns {Boolean} checks successful?
 */
function checkDeployOptions(oOptions, oLogger) {
    let bCheckSuccessful = true;

    if (!checkConnectionOptions(oOptions, oLogger)) {
        bCheckSuccessful = false;
    }

    if (!checkAuthenticationOptions(oOptions, oLogger)) {
        bCheckSuccessful = false;
    }

    if (!oOptions.ui5 || !oOptions.ui5.package || !oOptions.ui5.bspcontainer || !oOptions.ui5.bspcontainer_text) {
        oLogger.error("UI5 configuration not (fully) specified (check package, BSP container, BSP container text information).");
        bCheckSuccessful = false;
    }

    if (oOptions.ui5 && oOptions.ui5.package && !oOptions.ui5.package.startsWith("$") && !oOptions.ui5.transportno &&
        oOptions.ui5.create_transport !== true && oOptions.ui5.transport_use_user_match !== true && oOptions.conn.testMode !== true) {
        oLogger.error("For non-local packages (package name does not start with a \"$\") a transport number is necessary.");
        bCheckSuccessful = false;
    }

    if (!checkCreateTransport(oOptions, oLogger)) {
        bCheckSuccessful = false;
    }

    if (oOptions.ui5 && oOptions.ui5.bspcontainer) {
        const bspcontainerExclNamespace = oOptions.ui5.bspcontainer.substring(oOptions.ui5.bspcontainer.lastIndexOf("/") + 1);
        if (bspcontainerExclNamespace.length > 15) {
            oLogger.error("BSP Container name must not be longer than 15 characters (exclusive customer specific namespace e.g. /YYY/.");
            bCheckSuccessful = false;
        }
    }

    return bCheckSuccessful;
}

/**
 * Checks on Undeploy Options
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 * @returns {Boolean} checks successful?
 */
function checkUndeployOptions(oOptions, oLogger) {
    let bCheckSuccessful = true;

    if (!checkConnectionOptions(oOptions, oLogger)) {
        bCheckSuccessful = false;
    }

    if (!checkAuthenticationOptions(oOptions, oLogger)) {
        bCheckSuccessful = false;
    }

    if (!oOptions.ui5 || !oOptions.ui5.package || !oOptions.ui5.bspcontainer ) {
        oLogger.error("Please specify a Package and a BSP container.");
        bCheckSuccessful = false;
    }

    if (oOptions.ui5 && oOptions.ui5.package && !oOptions.ui5.package.startsWith("$") && !oOptions.ui5.transportno &&
        oOptions.ui5.create_transport !== true && oOptions.conn.testMode !== true) {
        oLogger.error("For non-local packages (package name does not start with a \"$\") a transport number is necessary.");
        bCheckSuccessful = false;
    }

    if (!checkCreateTransport(oOptions, oLogger)) {
        bCheckSuccessful = false;
    }

    return bCheckSuccessful;
}

/**
 * Synchronize Files
 * @param {object} oOptions
 * @param {object} oLogger
 * @param {array} aFiles
 */
function syncFiles(oOptions, oLogger, aFiles) {
    return new Promise(async (resolve, reject) => {
        try {
            const oRepoClient = new UI5ABAPRepoClient(oOptions, oLogger);
            await oRepoClient.deployRepo(aFiles);
            resolve();
            return;
        } catch (oError) {
            reject(oError);
            return;
        }
    });
}

/**
 * Upload the files with an transport which does the user own.
 * @param {Object} oTransportManager Transport manager
 * @param {Object} oOptions File Store Options
 * @param {Object} oLogger Logger
 * @Param {Array} aFiles Files
 */
async function uploadWithTransportUserMatch(oTransportManager, oOptions, oLogger, aFiles) {
    return new Promise((resolve, reject) => {
        oTransportManager.determineExistingTransport(async function(oError, sTransportNo) {
            if (oError) {
                reject(oError);
                return;
            } else if (sTransportNo) {
                oOptions.ui5.transportno = sTransportNo;
                try {
                    await syncFiles(oOptions, oLogger, aFiles);
                    resolve();
                    return;
                } catch (oError) {
                    reject(oError);
                    return;
                }
            } else if (oOptions.ui5.create_transport === true) {
                oTransportManager.createTransport(oOptions.ui5.package, oOptions.ui5.transport_text, async function(oError, sTransportNo) {
                    if (oError) {
                        reject(oError);
                        return;
                    }
                    oOptions.ui5.transportno = sTransportNo;
                    try {
                        await syncFiles(oOptions, oLogger, aFiles);
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
        let oOptionsAdapted = {};

        oOptionsAdapted = Object.assign(oOptionsAdapted, oOptions);

        oOptionsAdapted = setDefaultLanguage(oOptionsAdapted);
        oOptionsAdapted = setDefaultUseStrictSSL(oOptionsAdapted);
        oOptionsAdapted = setDefaultTestMode(oOptionsAdapted);

        // checks on options
        if (!checkDeployOptions(oOptionsAdapted, oLogger)) {
            reject(new Error("Configuration incorrect."));
            return;
        }

        // verbose log options
        oLogger.logVerbose(`Options: ${JSON.stringify(oOptionsAdapted)}`);

        // info about test mode
        if (oOptions.conn.testMode) {
            oLogger.log("Running in Test Mode - no changes are done.");
        }

        // binary determination
        const aFilesAdapted = aFiles.map((oFile) => {
            return oFile;
        });

        // verbose log files
        oLogger.logVerbose("Files: " + aFilesAdapted);

        // sync files
        const oTransportManager = new TransportManager(oOptionsAdapted, oLogger);
        let sExistingTransportNo = null;
        try {
            sExistingTransportNo = await oTransportManager.determineExistingTransportForBspContainer(oOptionsAdapted.ui5.package, oOptionsAdapted.ui5.bspcontainer);
        } catch (oError) {
            reject(oError);
            return;
        }

        if (sExistingTransportNo && !oOptionsAdapted.ui5.transport_use_locked && ((!oOptionsAdapted.ui5 || !oOptionsAdapted.ui5.transportno) || (oOptionsAdapted.ui5 && oOptionsAdapted.ui5.transportno !== sExistingTransportNo))) {
            reject(new Error(`BSP container already locked in transport ${sExistingTransportNo}. But it was not configured to reuse a transport with an existing lock.`));
            return;
        }

        if (sExistingTransportNo && oOptionsAdapted.ui5.transport_use_locked) {
            // existing transport lock
            oOptionsAdapted.ui5.transportno = sExistingTransportNo;
            oLogger.log(`BSP Application ${oOptionsAdapted.ui5.bspcontainer} already locked in transport request ${sExistingTransportNo}. This transport request is used for deployment.`);
            try {
                await syncFiles(oOptionsAdapted, oLogger, aFilesAdapted);
                resolve({ oOptions: oOptionsAdapted });
                return;
            } catch (oError) {
                reject(oError);
                return;
            }
        }

        if (!oOptionsAdapted.ui5.package.startsWith("$") && oOptionsAdapted.ui5.transportno === undefined) {
            if (oOptionsAdapted.ui5.transport_use_user_match) {
                try {
                    await uploadWithTransportUserMatch(oTransportManager, oOptionsAdapted, oLogger, aFilesAdapted);
                    resolve({ oOptions: oOptionsAdapted });
                    return;
                } catch (oError) {
                    reject(oError);
                    return;
                }
            } else if (oOptionsAdapted.ui5.create_transport === true) {
                try {
                    let sTransportNo = "A4HK900000"; // dummy transport for test mode
                    if (!oOptionsAdapted.conn.testMode) {
                        sTransportNo = await oTransportManager.createTransportPromise(oOptionsAdapted.ui5.package, oOptionsAdapted.ui5.transport_text);
                    }
                    oOptionsAdapted.ui5.transportno = sTransportNo;
                } catch (oError) {
                    reject(oError);
                    return;
                }

                try {
                    await syncFiles(oOptionsAdapted, oLogger, aFilesAdapted);
                    resolve({ oOptions: oOptionsAdapted });
                    return;
                } catch (oError) {
                    reject(oError);
                    return;
                }
            } else {
                const oError = new Error("No transport configured and 'create transport' and 'use user match' options are disabled.");
                reject(oError);
                return;
            }
        } else {
            try {
                await syncFiles(oOptionsAdapted, oLogger, aFilesAdapted);
                resolve({ oOptions: oOptionsAdapted });
                return;
            } catch (oError) {
                reject(oError);
                return;
            }
        }
    });
};

/**
 * Central function to undeploy UI5 sources from a SAP NetWeaver ABAP system.
 * @param {Object} oOptions Options
 * @param {Object} oLogger Logger
 */
 exports.undeployUI5fromNWABAP = async function(oOptions, oLogger) {
    return new Promise(async function(resolve, reject) {
        let oOptionsAdapted = {};

        oOptionsAdapted = Object.assign(oOptionsAdapted, oOptions);

        oOptionsAdapted = setDefaultLanguage(oOptionsAdapted);
        oOptionsAdapted = setDefaultUseStrictSSL(oOptionsAdapted);
        oOptionsAdapted = setDefaultTestMode(oOptionsAdapted);

        // info about test mode
        if (oOptions.conn.testMode) {
            oLogger.log("Running in Test Mode - no changes are done.");
        }

        // checks on options
        if (!checkUndeployOptions(oOptionsAdapted, oLogger)) {
            reject(new Error("Configuration incorrect."));
            return;
        }

        // verbose log options
        oLogger.logVerbose(`Options: ${JSON.stringify(oOptionsAdapted)}`);

        // determine existing transport
        const oTransportManager = new TransportManager(oOptionsAdapted, oLogger);
        let sExistingTransportNo = null;
        try {
            sExistingTransportNo = await oTransportManager.determineExistingTransportForBspContainer(oOptionsAdapted.ui5.package, oOptionsAdapted.ui5.bspcontainer);
        } catch (oError) {
            reject(oError);
            return;
        }

        if (sExistingTransportNo && !oOptionsAdapted.ui5.transport_use_locked && ((!oOptionsAdapted.ui5 || !oOptionsAdapted.ui5.transportno) || (oOptionsAdapted.ui5 && oOptionsAdapted.ui5.transportno !== sExistingTransportNo))) {
            reject(new Error(`BSP container already locked in transport ${sExistingTransportNo}. But it was not configured to reuse a transport with an existing lock.`));
            return;
        }

        // use existing transport if required
        if (sExistingTransportNo && oOptionsAdapted.ui5.transport_use_locked) {
            oOptionsAdapted.ui5.transportno = sExistingTransportNo;
            oLogger.log(`BSP Application ${oOptionsAdapted.ui5.bspcontainer} already locked in transport request ${sExistingTransportNo}. This transport request is used for undeploy.`);
        }

        // create new transport if necessary
        let oRepoClient = new UI5ABAPRepoClient(oOptionsAdapted, oLogger);
        let isRepoExisting = false;
        try {
            isRepoExisting = await oRepoClient.isRepoExisting();
        } catch (oError) {
            reject(oError);
        }

        if (oOptionsAdapted.ui5.create_transport && !sExistingTransportNo && isRepoExisting) {
            try {
                const sTransportNo = await oTransportManager.createTransportPromise(oOptionsAdapted.ui5.package, oOptionsAdapted.ui5.transport_text);
                oOptionsAdapted.ui5.transportno = sTransportNo;
            } catch (oError) {
                reject(oError);
                return;
            }
        }

        // undeploy
        try {
            oRepoClient = new UI5ABAPRepoClient(oOptionsAdapted, oLogger);
            await oRepoClient.undeployRepo();
            resolve({ oOptions: oOptionsAdapted });
            return;
        } catch (oError) {
            reject(oError);
            return;
        }
    });
 };
