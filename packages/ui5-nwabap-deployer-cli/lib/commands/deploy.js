const Logger = require("../log/Logger");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const configHandler = require("../config/configHandler");
const ui5DeployerCore = require("ui5-nwabap-deployer-core");

const builder = (yargs) => {
    return yargs
        .option("config", { description: "Path to configuration file, default: './ui5deployrc'", string: true })
        .option("cwd", { description: "Directory in which files are located, default: './dist'", string: true })
        .option("files", { description: "Files (Glob Pattern), default: '**/*.*'", string: true })
        .option("server", { description: "ABAP Server (form: protocol://host:port)", string: true })
        .option("client", { description: "ABAP Client", string: true })
        .option("useStrictSSL", { description: "Use Strict SSL, default: true", boolean: true })
        .option("proxy", { description: "Proxy (form: protocol://host:port)", string: true })
        .option("testMode", { description: "Test Mode deployment, default: false", boolean: true })
        .option("customQueryParams", { description: "Custom Query Parameters", array: true })
        .option("user", { description: "ABAP User", string: true })
        .option("pwd", { description: "ABAP User Password", string: true })
        .option("bearerToken", { description: "Bearer token for authorization", string: true })
        .option("language", { description: "Language for deployment, default: EN", string: true })
        .option("package", { description: "ABAP Package", string: true })
        .option("bspContainer", { description: "BSP container", string: true })
        .option("bspContainerText", { description: "BSP container text", string: true })
        .option("transportNo", { description: "Transport Number", string: true })
        .option("createTransport", { description: "Create a new transport, default: false", boolean: true })
        .option("transportText", { description: "Text for new created transport", string: true })
        .option("transportUseUserMatch", { description: "Try to find an existing transport for the user, default: false", boolean: true })
        .option("transportUseLocked", { description: "Use an existing transport in which the BSP container is locked, default: false", boolean: true });
};

const handler = async (argv) => {
    const logger = new Logger();

    logger.log("UI5 Deployer: Start deploying UI5 sources.");

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

    let argCwd = "./dist";
    if (configData && configData.cwd) {
        argCwd = configData.cwd;
    }
    if (argv.cwd) {
        argCwd = argv.cwd;
    }

    let argFiles = "**/*.*";
    if (configData && configData.files) {
        argFiles = configData.files;
    }
    if (argv.files) {
        argFiles = argv.files;
    }

    let deployOptions = configHandler.mapConfigToOptions(configData, initDeployOptions());
    deployOptions = configHandler.mapArgumentsToOptions(argv, deployOptions);

    const files = glob.sync(argFiles, {
        cwd: argCwd,
        dot: true,
        nodir: true
    });

    const fileContents = [];

    files.forEach((file) => {
        fileContents.push({
            path: file,
            content: fs.readFileSync(path.join(argCwd, file))
        });
    });

    try {
        await ui5DeployerCore.deployUI5toNWABAP(deployOptions, fileContents, logger);
        logger.log("UI5 Deployer: UI5 sources successfully deployed.");
    } catch (error) {
        if (error) {
            logger.error(error.message);
            process.exitCode = 1;
        }
    }
};

const initDeployOptions = () => {
    return {
        conn: {
            server: undefined,
            client: undefined,
            useStrictSSL: true,
            proxy: undefined,
            testMode: false,
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
            package: undefined,
            bspcontainer: undefined,
            bspcontainer_text: undefined,
            create_transport: false,
            transport_text: undefined,
            transport_use_user_match: false,
            transport_use_locked: false
        }
    };
};

module.exports = {
    command: "deploy",
    desc: "Deploy UI5 sources to a SAP ABAP system.",
    builder: builder,
    handler: handler
};
