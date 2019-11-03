'use strict';

var util = require('util');
var fsutil = require('./FileStoreUtil');
var CTS_BASE_URL = '/sap/bc/adt/cts/transports';
var AdtClient = require('./AdtClient');
var XMLDocument = require('xmldoc').XmlDocument;

/**
 * creates and releases transport requests
 * @param {object}  oOptions
 * @param {object}  oOptions.conn               connection info
 * @param {string}  oOptions.conn.server        server url
 * @param {string}  oOptions.conn.client        sap client id
 * @param {boolean} oOptions.conn.useStrictSSL  force encrypted connection
 * @param {string}  oOptions.conn.proxy         set connection proxy
 * @param {string}  oOptions.auth.user          username
 * @param {string}  oOptions.auth.pwd           password
 * @param {Logger}  oLogger
 * @constructor
 */
function TransportManager(oOptions, oLogger) {
    this._client = new AdtClient(oOptions.conn, oOptions.auth, undefined, oLogger);
    this._oLogger = oLogger;
}

TransportManager.prototype.createTransport = function (sPackageName, sRequestText, fnCallback) {
    var sPayload = this.getCreateTransportPayload(sPackageName, sRequestText);

    var sUrl = this._client.buildUrl(CTS_BASE_URL);
    this._client.determineCSRFToken(function () {
        var oRequestOptions = {
            method: 'POST',
            url: sUrl,
            headers: {
                'accept': '*/*'
            },
            body: sPayload
        };

        this._client.sendRequest(oRequestOptions, function (oError, oResponse) {
            if (oError) {
                fnCallback(new Error(fsutil.createResponseError(oError)));
                return;
            } else if (oResponse.statusCode !== fsutil.HTTPSTAT.ok) {
                fnCallback(new Error(`Operation Create Transport: Expected status code ${fsutil.HTTPSTAT.ok}, actual status code ${oResponse.statusCode}`));
                return;
            } else {
                var sTransportNo = oResponse.body.split('/').pop();
                this._oLogger.log('Creation of transport request required. Number of created transport request: ' + sTransportNo);
                fnCallback(null, sTransportNo);
                return;
            }
        }.bind(this));
    }.bind(this));
};

/**
 * Determines if a transport with the given text already exists. If true the callback returns the transport no
 * otherwise the cb returns null.
 * @param {Function} fnCallback
 */
TransportManager.prototype.determineExistingTransport = function (fnCallback) {
    var sUrl = this._client.buildUrl(CTS_BASE_URL + '?_action=FIND&trfunction=K');

    var oRequestOptions = {
        url: sUrl,
        headers: {
            'accept': '*/*'
        }
    };

    this._client.sendRequest(oRequestOptions, function (oError, oResponse) {
        if (oError) {
            fnCallback(new Error(fsutil.createResponseError(oError)));
            return;
        } else if (oResponse.statusCode !== fsutil.HTTPSTAT.ok) {
            fnCallback(new Error(`Operation Existing Transport Determination: Expected status code ${fsutil.HTTPSTAT.ok}, actual status code ${oResponse.statusCode}`));
            return;
        } else {
            if (!oResponse.body) {
                return fnCallback(null, null);
            }
            var oParsed = new XMLDocument(oResponse.body);
            var transportNo = oParsed.valueWithPath('asx:values.DATA.CTS_REQ_HEADER.TRKORR');
            fnCallback(null, transportNo);
            return;
        }
    });
};

TransportManager.prototype.getCreateTransportPayload = function (sPackageName, sRequestText) {
    var sTemplate = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">' +
        '<asx:values>' +
        '<DATA>' +
        '<OPERATION>I</OPERATION>' +
        '<DEVCLASS>%s</DEVCLASS>' +
        '<REQUEST_TEXT>%s</REQUEST_TEXT>' +
        '</DATA>' +
        '</asx:values>' +
        '</asx:abap>';

    return util.format(sTemplate, sPackageName, sRequestText);
};

module.exports = TransportManager;