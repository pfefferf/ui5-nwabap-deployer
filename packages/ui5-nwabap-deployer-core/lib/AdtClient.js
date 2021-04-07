"use strict";

const axios = require("axios");
const rax = require("retry-axios");
const https = require("https");
const util = require("./FileStoreUtil");
const ADT_BASE_URL = "/sap/bc/adt/";

/**
 *
 * @param {object} oConnection
 * @param {string} oConnection.server NW server
 * @param {string} oConnection.client NW Client
 * @param {boolean} oConnection.useStrictSSL use strict SSL connection
 * @param {string} oConnection.proxy proxy
 * @param {object} oAuth
 * @param {string} oAuth.user user
 * @param {string} oAuth.pwd password
 * @param {string} sLanguage language
 * @param {Logger} oLogger logger
 * @constructor
 */
function AdtClient(oConnection, oAuth, sLanguage, oLogger) {
    this._oOptions = {
        auth: oAuth,
        conn: oConnection,
        lang: sLanguage
    };

    // remove suffix slashes from server URL
    if (this._oOptions.conn && this._oOptions.conn.server) {
        this._oOptions.conn.server = this._oOptions.conn.server.replace(/\/*$/, "");
    }

    this._oLogger = oLogger;
}

/**
 * Construct the base Url for server access
 * @private
 * @return {string} base URL
 */
AdtClient.prototype._constructBaseUrl = function() {
    return this._oOptions.conn.server + ADT_BASE_URL;
};

/**
 * Determine a CSRF Token which is necessary for POST/PUT/DELETE operations; also the sapCookie is determined
 * @private
 * @param {function} fnCallback callback function
 * @return {void}
 */
AdtClient.prototype.determineCSRFToken = function(fnCallback) {
    if (this._sCSRFToken !== undefined) {
        fnCallback();
        return;
    }

    const sUrl = this.buildUrl(ADT_BASE_URL + "discovery");

    const oRequestOptions = {
        url: sUrl,
        headers: {
            "X-CSRF-Token": "Fetch",
            "accept": "*/*"
        }
    };

    this.sendRequest(oRequestOptions, function(oError, oResponse) {
        if (oError) {
            fnCallback(oError);
            return;
        } else if (oResponse.statusCode !== util.HTTPSTAT.ok) {
            fnCallback(new Error(`Operation CSRF Token Determination: Expected status code ${util.HTTPSTAT.ok}, actual status code ${oResponse.statusCode}, response body '${oResponse.body}'`));
            return;
        } else {
            this._sCSRFToken = oResponse.headers["x-csrf-token"];
            this._sSAPCookie = "";
            for (let i = 0; i < oResponse.headers["set-cookie"].length; i++) {
                this._sSAPCookie += oResponse.headers["set-cookie"][i] + ";";
            }

            fnCallback(null);
            return;
        }
    }.bind(this));
};

AdtClient.prototype.buildUrl = function(sUrl) {
    return this._oOptions.conn.server + sUrl;
};

/**
 * Send a request to the server (adds additional information before sending, e.g. authentication information)
 * @param {object} oRequestOptions request options object
 * @param {function} fnRequestCallback Callback for request
 */
AdtClient.prototype.sendRequest = async function(oRequestOptions, fnRequestCallback) {
    const that = this;

    const oAxiosReqOptions = {};
    oAxiosReqOptions.url = oRequestOptions.url || "";
    oAxiosReqOptions.method = oRequestOptions.method || "GET";
    oAxiosReqOptions.headers = oRequestOptions.headers || {};
    oAxiosReqOptions.data = oRequestOptions.body;

    oAxiosReqOptions.httpsAgent = new https.Agent({
        rejectUnauthorized: that._oOptions.conn.useStrictSSL
    });

    if (that._oOptions.auth) {
        oAxiosReqOptions.auth = {
            username: that._oOptions.auth.user,
            password: that._oOptions.auth.pwd
        };
    }

    if (that._oOptions.conn.proxy) {
        try {
            const oProxyUrl = new URL(that._oOptions.conn.proxy);

            oAxiosReqOptions.proxy = {
                host: oProxyUrl.hostname,
                port: oProxyUrl.port
            };

            if (oProxyUrl.username && oProxyUrl.password) {
                oAxiosReqOptions.proxy.auth = {
                    username: oProxyUrl.username,
                    password: oProxyUrl.password
                };
            }
        } catch (oError) {
            fnRequestCallback(oError, null);
        }
    }

    const fnAddQueryParam = (oOptions, sParamName, sParamValue) => {
        if (!sParamValue) {
            return;
        }

        if (!oOptions.hasOwnProperty("params")) {
            oOptions.params = {};
        }
        oOptions.params[sParamName] = sParamValue;
    };

    fnAddQueryParam(oAxiosReqOptions, "sap-language", that._oOptions.lang);
    fnAddQueryParam(oAxiosReqOptions, "sap-client", that._oOptions.conn.client);

    if (that._oOptions.conn.customQueryParams) {
        Object.keys(that._oOptions.conn.customQueryParams).forEach((sKey) => {
            fnAddQueryParam(oAxiosReqOptions, sKey, encodeURIComponent(that._oOptions.conn.customQueryParams[sKey]));
        });
    }

    const fnAddHeader = (oOptions, sHeaderKey, sHeaderValue) => {
        if (!sHeaderValue) {
            return;
        }

        if (!oOptions.hasOwnProperty("headers")) {
            oOptions.headers = {};
        }
        oOptions.headers[sHeaderKey] = sHeaderValue;
    };

    fnAddHeader(oAxiosReqOptions, "x-csrf-token", this._sCSRFToken);
    fnAddHeader(oAxiosReqOptions, "cookie", this._sSAPCookie);

    rax.attach();
    oAxiosReqOptions.raxConfig = {
       retry: 5,
       retryDelay: 500,
       onRetryAttempt: (oRaxError) => {
            const oCfg = rax.getConfig(oRaxError);
            that._oLogger.log("Connection error has occurred; retry attempt " + oCfg.currentRetryAttempt);
       }
    };

    oAxiosReqOptions.validateStatus = (status) => {
        return status < 999; // request must always return a response
    };

    oAxiosReqOptions.maxBodyLength = Infinity;
    oAxiosReqOptions.maxContentLength = Infinity;

    try {
        const oResponse = await axios(oAxiosReqOptions);
        oResponse.statusCode = oResponse.status;
        oResponse.body = oResponse.data;
        fnRequestCallback(null, oResponse);
    } catch (oRequestError) {
        if (oRequestError.response) {
            fnRequestCallback(oRequestError.message + "\n\rError message body: " + oRequestError.response.data, null);
        } else {
            fnRequestCallback(oRequestError.message, null);
        }
    }
};

module.exports = AdtClient;
