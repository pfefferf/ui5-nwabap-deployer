const Logger = require("../log/Logger");
const configHandler = require("../config/configHandler");
const ui5DeployerCore = require("ui5-nwabap-deployer-core");

const builder = (yargs) => {
    return yargs
        .option("config", { description: "Path to configuration file, default: './ui5deployrc'", string: true })
        .option("server", { description: "ABAP Server (form: protocol://host:port)", string: true })
        .option("client", { description: "ABAP Client", string: true })
        .option("useStrictSSL", { description: "Use Strict SSL, default: true", boolean: true })
        .option("proxy", { description: "Proxy (form: protocol://host:port)", string: true })
        .option("customQueryParams", { description: "Custom Query Parameters", array: true })
        .option("user", { description: "ABAP User", string: true })
        .option("pwd", { description: "ABAP User Password", string: true })
        .option("bearerToken", { description: "Bearer token for authorization", string: true })
        .option("language", { description: "Language for deployment, default: EN", string: true })
        .option("package", { description: "ABAP Package", string: true })
        .option("bspContainer", { description: "BSP container", string: true })
        .option("transportNo", { description: "Transport Number", string: true })
        .option("createTransport", { description: "Create a new transport, default: false", boolean: true })
        .option("transportText", { description: "Text for new created transport", string: true })
        .option("transportUseLocked", { description: "Use an existing transport in which the BSP container is locked, default: false", boolean: true });
};

const handler = async (argv) => {
    const logger = new Logger();

    logger.log("UI5 Deployer: Start undeploying UI5 sources.");

    let configData = undefined;
    try {
        configData = configHandler.readConfigData(argv.config || "./.ui5deployrc");
    } catch (error) {
        logger.error(`Error reading configuration file. Error: ${error.message}`);
        return;
    }

    if (argv.config && !configData) {
        logger.error(`No configuration found in config file '${argv.config}'. Please check the file and the content.`);
        return;
    }

    let undeployOptions = configHandler.mapConfigToOptions(configData, initUndeployOptions());
    undeployOptions = configHandler.mapArgumentsToOptions(argv, undeployOptions);

    try {
        await ui5DeployerCore.undeployUI5fromNWABAP(undeployOptions, logger);
        logger.log("UI5 Deployer: UI5 sources successfully undeployed.");
    } catch (error) {
        if (error) {
            logger.error(error.message);
            process.exitCode = 1;
        }
    }
};

const initUndeployOptions = () => {
    return {
        conn: {
            server: undefined,
            client: undefined,
            useStrictSSL: true,
            proxy: undefined,
            customQueryParams: {}
        },
        auth: {
            user: undefined,
            pwd: undefined,
            bearerToken: undefined
        },
        ui5: {
            language: "EN",
            transportno: undefined,
            bspcontainer: undefined,
            create_transport: false,
            transport_text: undefined,
            transport_use_locked: false
        }
    };
};

module.exports = {
    command: "undeploy",
    desc: "Undeploy UI5 sources from a SAP ABAP system.",
    builder: builder,
    handler: handler
};
