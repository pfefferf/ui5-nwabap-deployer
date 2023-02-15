"use strict";

const Logger = require("./Logger");
const ui5DeployerCore = require("ui5-nwabap-deployer-core");
require("dotenv").config();

/**
 * UI5 Tooling Task for deploying UI5 Sources to a SAP NetWeaver ABAP system
 *
 * @param {Object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function({ workspace, options }) {
    const oLogger = new Logger();

    oLogger.log("Start deploying UI5 sources.");

    if ((options.configuration && !options.configuration.connection) && !process.env.UI5_TASK_NWABAP_DEPLOYER__SERVER) {
        return Promise.reject(new Error("Please provide a connection configuration."));
    }

    if (options.configuration && !options.configuration.connection) {
        options.configuration.connection = {};
    }

    let bTestMode = process.env.UI5_TASK_NWABAP_DEPLOYER__TESTMODE === "true";

    if (options.configuration && options.configuration.connection.testMode) {
        bTestMode = !!options.configuration.connection.testMode;
    }

    let sServer = process.env.UI5_TASK_NWABAP_DEPLOYER__SERVER;

    if (options.configuration && options.configuration.connection && options.configuration.connection.server) {
        sServer = options.configuration.connection.server;
    }

    let sClient = process.env.UI5_TASK_NWABAP_DEPLOYER__CLIENT;

    if (options.configuration && options.configuration.connection && options.configuration.connection.client) {
        sClient = options.configuration.connection.client;
    }

    if ((options.configuration && !options.configuration.authentication) &&
        (!process.env.UI5_TASK_NWABAP_DEPLOYER__USER || !process.env.UI5_TASK_NWABAP_DEPLOYER__PASSWORD)) {
        return Promise.reject(new Error("Please provide an authentication configuration or set authentication environment variables (user name and password)."));
    }

    let sUser = process.env.UI5_TASK_NWABAP_DEPLOYER__USER;
    let sPassword = process.env.UI5_TASK_NWABAP_DEPLOYER__PASSWORD;

    if (options.configuration && options.configuration.authentication && options.configuration.authentication.user) {
        sUser = options.configuration.authentication.user;
    }

    if (options.configuration && options.configuration.authentication && options.configuration.authentication.password) {
        sPassword = options.configuration.authentication.password;
    }

    if (options.configuration && !options.configuration.ui5) {
        return Promise.reject(new Error("Please provide a UI5 configuration."));
    }

    let sTransportNo = process.env.UI5_TASK_NWABAP_DEPLOYER__TRANSPORTNO;
    if (options.configuration && options.configuration.ui5 && options.configuration.ui5.transportNo) {
        sTransportNo = options.configuration.ui5.transportNo;
    }

    let sResourcePattern = "**/*.*";
    if (options.configuration && options.configuration.resources && options.configuration.resources.pattern) {
        sResourcePattern = options.configuration.resources.pattern;
    }

    return workspace.byGlob(sResourcePattern).then((resources) => {
        return Promise.all(resources.map(async (resource) => {
            if (options.projectNamespace) {
                resource.setPath(resource.getPath().replace(
                    new RegExp(`^/resources/${options.projectNamespace}`), ""));
            }
            let sPath = resource.getPath();
            if (sPath.startsWith("/")) {
                sPath = sPath.substring(1);
            }
            return {
              path: sPath,
              content: await resource.getBuffer()
            };
        }));
    }).then(async (aFiles) => {
        const oDeployOptions = {
            conn: {
                server: sServer,
                client: sClient,
                useStrictSSL: options.configuration.connection.useStrictSSL,
                proxy: options.configuration.connection.proxy,
                customQueryParams: options.configuration.connection.customQueryParams ? options.configuration.connection.customQueryParams : {},
                testMode: bTestMode
            },
            auth: {
                user: sUser,
                pwd: sPassword
            },
            ui5: {
                language: options.configuration.ui5.language,
                transportno: sTransportNo,
                package: options.configuration.ui5.package,
                bspcontainer: options.configuration.ui5.bspContainer,
                bspcontainer_text: options.configuration.ui5.bspContainerText,
                create_transport: !!options.configuration.ui5.createTransport,
                transport_text: options.configuration.ui5.transportText,
                transport_use_user_match: !!options.configuration.ui5.transportUseUserMatch,
                transport_use_locked: !!options.configuration.ui5.transportUseLocked
            }
        };

        try {
            await ui5DeployerCore.deployUI5toNWABAP(oDeployOptions, aFiles, oLogger);
            oLogger.log("UI5 sources successfully deployed.");
        } catch (oError) {
            oLogger.error(oError);
            throw new Error(oError);
        }
    }).then(() => {
        return Promise.resolve();
    }).catch((oError) => {
        return Promise.reject(oError);
    });
};

/**
 * Callback function to define the list of required dependencies. No dependencies required for this custom task.
 *
 */
module.exports.determineRequiredDependencies = async function({availableDependencies, getDependencies, getProject, options}) {
    return new Set();
};
