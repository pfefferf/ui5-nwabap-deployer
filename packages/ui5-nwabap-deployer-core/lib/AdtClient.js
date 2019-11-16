"use strict";

const request = require("request");
const util = require("./FileStoreUtil");
const backoff = require("backoff");
const ADT_BASE_URL = "/sap/bc/adt/";


/**
 *
 * @param {object} oConnection
 * @param {string} oConnection.server
 * @param {string} oConnection.client
 * @param {boolean} oConnection.useStrictSSL
 * @param {string} oConnection.proxy
 * @param {object} oAuth
 * @param {string} oAuth.user
 * @param {string} oAuth.pwd
 * @param {string} [sLanguage]
 * @param {Logger} [oLogger]
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
            this._sSAPCookie = oResponse.headers["set-cookie"];
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
AdtClient.prototype.sendRequest = function(oRequestOptions, fnRequestCallback) {
    const me = this;
    const oMutableRequestOptions = oRequestOptions;

    if (me._oOptions.auth) {
        oMutableRequestOptions.auth = {
            user: me._oOptions.auth.user,
            pass: me._oOptions.auth.pwd,
            sendImmediately: true
        };
    }

    oMutableRequestOptions.strictSSL = me._oOptions.conn.useStrictSSL;

    if (me._oOptions.conn.proxy) {
        oMutableRequestOptions.proxy = me._oOptions.conn.proxy;
    }

    if (me._oOptions.conn.client) {
        if (!oMutableRequestOptions.hasOwnProperty("qs")) {
            oMutableRequestOptions.qs = {};
        }
        oMutableRequestOptions.qs["sap-client"] = encodeURIComponent(me._oOptions.conn.client);
    }

    if (me._oOptions.lang) {
        if (!oMutableRequestOptions.hasOwnProperty("qs")) {
            oMutableRequestOptions.qs = {};
        }
        oMutableRequestOptions.qs["sap-language"] = encodeURIComponent(me._oOptions.lang);
    }

    if (this._sCSRFToken) {
        if (!oMutableRequestOptions.hasOwnProperty("headers")) {
            oMutableRequestOptions.headers = {};
        }
        oMutableRequestOptions.headers["x-csrf-token"] = this._sCSRFToken;
    }

    if (this._sSAPCookie) {
        if (!oMutableRequestOptions.hasOwnProperty("headers")) {
            oMutableRequestOptions.headers = {};
        }
        oMutableRequestOptions.headers["cookie"] = this._sSAPCookie;
    }

    const call = backoff.call(request, oRequestOptions, function(oError, oResponse) {
        fnRequestCallback(oError, oResponse);
    });

    call.retryIf(function(oError, oResponse) {
        if (oError !== undefined) {
            me._oLogger.log("Connection error has occurred, retrying (" + call.getNumRetries() + "): " + JSON.stringify(oError));
            return true;
        }
        return false;
    });

    call.setStrategy(new backoff.ExponentialStrategy({
        initialDelay: 500,
        maxDelay: 5000
    }));

    call.failAfter(10);

    call.start();
};

module.exports = AdtClient;
