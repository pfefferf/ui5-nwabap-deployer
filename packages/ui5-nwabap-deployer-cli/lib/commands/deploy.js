const Logger = require("../log/Logger");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
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
        .option("customQueryParams", { description: "Custom Query Parameters", array: true })
        .option("user", { description: "ABAP User", string: true })
        .option("pwd", { description: "ABAP User Password", string: true })
        .option("language", { description: "Language for deployment, default: EN", string: true })
        .option("package", { description: "ABAP Package", string: true })
        .option("bspContainer", { description: "BSP container", string: true })
        .option("bspContainerText", { description: "BSP container text", string: true })
        .option("transportNo", { description: "Transport Number", string: true })
        .option("createTransport", { description: "Create a new transport, default: false", boolean: true })
        .option("transportText", { description: "Text for new created transport", string: true })
        .option("transportUseUserMatch", { description: "Try to find an existing transport for the user, default: false", boolean: true })
        .option("transportUseLocked", { description: "Use an existing transport in which the BSP container is locked, default: false", boolean: true })
        .option("calculateApplicationIndex", { description: "Recalculated UI5 Application Index, default: false", boolean: true });
};

const handler = async (argv) => {
    const logger = new Logger();

    logger.log("UI5 Deployer: Start deploying UI5 sources");

    let configData = undefined;
    try {
        configData = readConfigData(argv.config || "./.ui5deployrc");
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

    let deployOptions = mapConfigToDeployOptions(configData, initDeployOptions());
    deployOptions = mapArgumentsToDeployOptions(argv, deployOptions);

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
    } catch (error) {
        if (error) logger.error(error.message);
    }
};

const initDeployOptions = () => {
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
            pwd: undefined
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
            transport_use_locked: false,
            calc_appindex: false,
        }
    };
};

const readConfigData = (configFile) => {
    if (!fs.existsSync(configFile)) {
        return undefined;
    }
    return JSON.parse(fs.readFileSync(configFile, { encoding: "utf-8" }));
};

const mapConfigToDeployOptions = (configData, deployOptions) => {
    const result = Object.assign(deployOptions);

    if (!configData) {
        return result;
    }

    if (configData.server) {
        result.conn.server = configData.server;
    }
    if (configData.client) {
        result.conn.client = configData.client;
    }
    if (configData.useStrictSSL !== undefined) {
        result.conn.useStrictSSL = !!configData.useStrictSSL;
    }
    if (configData.proxy) {
        result.conn.proxy = configData.proxy;
    }
    if (configData.customQueryParams) {
        Object.keys(configData.customQueryParams).forEach((key) => {
            result.conn.customQueryParams[key] = configData.customQueryParams[key];
        });
    }

    if (configData.user) {
        result.auth.user = configData.user;
    }
    if (configData.pwd) {
        result.auth.pwd = configData.pwd;
    }

    if (configData.language) {
        result.ui5.language = configData.language;
    }
    if (configData.transportNo) {
        result.ui5.transportno = configData.transportNo;
    }
    if (configData.package) {
        result.ui5.package = configData.package;
    }
    if (configData.bspContainer) {
        result.ui5.bspcontainer = configData.bspContainer;
    }
    if (configData.bspContainerText) {
        result.ui5.bspcontainer_text = configData.bspContainerText;
    }
    if (configData.createTransport !== undefined) {
        result.ui5.create_transport = !!configData.createTransport;
    }
    if (configData.transportText) {
        result.ui5.transport_text = configData.transportText;
    }
    if (configData.transportUseUserMatch !== undefined) {
        result.ui5.transport_use_user_match = !!configData.transportUseUserMatch;
    }
    if (configData.transportUseLocked !== undefined) {
        result.ui5.transport_use_locked = !!configData.transportUseLocked;
    }
    if (configData.calculateApplicationIndex !== undefined) {
        result.ui5.calc_appindex = !!configData.calculateApplicationIndex;
    }

    return result;
};

const mapArgumentsToDeployOptions = (argv, deployOptions) => {
    const result = Object.assign(deployOptions);

    if (argv.server) {
        result.conn.server = argv.server;
    }
    if (argv.client) {
        result.conn.client = argv.client;
    }
    if (argv.useStrictSSL !== undefined) {
        result.conn.useStrictSSL = !!argv.useStrictSSL;
    }
    if (argv.proxy) {
        result.conn.proxy = argv.proxy;
    }
    if (argv.customQueryParams) {
        argv.customQueryParams.forEach((queryParam) => {
            const keyValue = queryParam.split("=");
            if (keyValue.length === 2) {
                result.conn.customQueryParams[keyValue[0]] = keyValue[1];
            }
        });
    }

    if (argv.user) {
        result.auth.user = argv.user;
    }
    if (argv.pwd) {
        result.auth.pwd = argv.pwd;
    }

    if (argv.language) {
        result.ui5.language = argv.language;
    }
    if (argv.transportNo) {
        result.ui5.transportno = argv.transportNo;
    }
    if (argv.package) {
        result.ui5.package = argv.package;
    }
    if (argv.bspContainer) {
        result.ui5.bspcontainer = argv.bspContainer;
    }
    if (argv.bspContainerText) {
        result.ui5.bspcontainer_text = argv.bspContainerText;
    }
    if (argv.createTransport !== undefined) {
        result.ui5.create_transport = !!argv.createTransport;
    }
    if (argv.transportText) {
        result.ui5.transport_text = argv.transportText;
    }
    if (argv.transportUseUserMatch !== undefined) {
        result.ui5.transport_use_user_match = !!argv.transportUseUserMatch;
    }
    if (argv.transportUseLocked !== undefined) {
        result.ui5.transport_use_locked = !!argv.transportUseLocked;
    }
    if (argv.calculateApplicationIndex !== undefined) {
        result.ui5.calc_appindex = !!argv.calculateApplicationIndex;
    }

    return result;
};

module.exports = {
    command: "deploy",
    desc: "Deploy UI5 sources to a SAP ABAP system.",
    builder: builder,
    handler: handler
};
