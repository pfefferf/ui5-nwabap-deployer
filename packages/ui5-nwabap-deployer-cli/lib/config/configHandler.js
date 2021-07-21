const fs = require("fs");

const readConfigData = (configFile) => {
    if (!fs.existsSync(configFile)) {
        return undefined;
    }
    return JSON.parse(fs.readFileSync(configFile, { encoding: "utf-8" }));
};

const mapConfigToOptions = (configData, options) => {
    const result = Object.assign(options);

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
    if (configData.testMode !== undefined) {
        result.conn.testMode = !!configData.testMode;
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
    if (configData.bearerToken) {
        result.auth.bearer_token = configData.bearerToken;
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

    return result;
};

const mapArgumentsToOptions = (argv, options) => {
    const result = Object.assign(options);

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
    if (argv.testMode !== undefined) {
        result.conn.testMode = !!argv.testMode;
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
    if (argv.bearerToken) {
        result.auth.bearer_token = argv.bearerToken;
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

    return result;
};

module.exports = {
    readConfigData: readConfigData,
    mapConfigToOptions: mapConfigToOptions,
    mapArgumentsToOptions: mapArgumentsToOptions
};
