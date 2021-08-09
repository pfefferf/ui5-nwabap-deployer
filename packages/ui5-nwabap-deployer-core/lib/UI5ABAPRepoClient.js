"use strict";

const AdtClient = require("./AdtClient");
const yazl = require("yazl");
const util = require("./Util");

module.exports = class UI5ABAPRepoClient {
    /**
     * UI5ABAPRepoClient constructor
     * @public
     * @param {object} oOptions Options for deployment
     * @param {object} oLogger
     */
    constructor(oOptions, oLogger) {
        this.init(oOptions, oLogger);
    }

    /**
     * Init client
     * @param {object} oOptions Options for deployment
     * @param {object} oLogger
     */
    init(oOptions, oLogger) {
        this._oOptions = oOptions;
        this._oLogger = oLogger;
        this._client = new AdtClient(oOptions.conn, oOptions.auth, oOptions.ui5.language, oLogger);
    }

    /**
     * Construbt UI5 ABAP Repository Service URL
     * @returns {string} UI5 ABAP Repository Service URL
     */
    getServiceUrl() {
        return `${this._oOptions.conn.server}/sap/opu/odata/UI5/ABAP_REPOSITORY_SRV/Repositories`;
    }

    /**
     * Check if Repo is existing
     * @returns (boolean) repository existing
     */
    async isRepoExisting() {
        await this._client.determineCSRFTokenPromise();

        const sUrl = `${this.getServiceUrl()}('${encodeURIComponent(this._oOptions.ui5.bspcontainer)}')`;

        const oRequestOptions = {
            method: "GET",
            url: sUrl,
            headers: {
                "Content-Type": "application/json"
            },
            body: {}
        };

        const oResponse = await this._client.sendRequestPromise(oRequestOptions);
        return oResponse.statusCode === util.HTTPSTAT.ok ? true : false;
    }

    /**
     * UI5 repo deployment
     * @param {Array} aFiles Files to be deployed
     */
    async deployRepo(aFiles) {
        const isRepoExisting = await this.isRepoExisting();
        await this._client.determineCSRFTokenPromise();

        function stream2buffer(readableStream) {
            return new Promise((resolve, reject) => {
              const chunks = [];
              readableStream.on("data", (chunk) => {
                chunks.push(chunk);
              }).on("end", () => {
                resolve(Buffer.concat(chunks));
              }).on("error", (err) => {
                reject(err);
              });
            });
          }

        const zip = new yazl.ZipFile();

        aFiles.forEach((file) => {
            zip.addBuffer(file.content, file.path);
        });
        zip.end({ forceZip64Format: false });

        const zipBuffer = await stream2buffer(zip.outputStream);

        let sUrl = `${this.getServiceUrl()}`;

        if (isRepoExisting) {
            sUrl = sUrl + `('${encodeURIComponent(this._oOptions.ui5.bspcontainer)}')`;
        }

        sUrl = sUrl + "?CodePage='UTF8'";

        if (this._oOptions.ui5.transportno) {
            sUrl = sUrl + "&TransportRequest=" + this._oOptions.ui5.transportno;
        }

        if (this._oOptions.conn.testMode) {
            sUrl = sUrl + "&TestMode=TRUE";
        }

        const oRequestOptions = {
            method: isRepoExisting ? "PUT" : "POST",
            url: sUrl,
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                "Name": this._oOptions.ui5.bspcontainer,
                "Package": this._oOptions.ui5.package,
                "Description": this._oOptions.ui5.bspcontainer_text,
                "ZipArchive": zipBuffer.toString("base64"),
                "Info": "ui5-nwabap-deployer-core"
            }
        };

        const oResponse = await this._client.sendRequestPromise(oRequestOptions);

        if (this.doesResponseContainAnError(oResponse)) {
            throw new Error(util.createResponseError(typeof oResponse.body === "object" ? JSON.stringify(oResponse.body, null, 4) : oResponse.body));
        }
    }

    /**
     * UI5 repo undeployment
     */
    async undeployRepo() {
        const isRepoExisting = await this.isRepoExisting();
        await this._client.determineCSRFTokenPromise();

        if (!isRepoExisting) {
            throw new Error(util.createResponseError(`BSP Container ${this._oOptions.ui5.bspcontainer} does not exist. Undeploy cancelled.`));
        }

        let sUrl = `${this.getServiceUrl()}`;
        sUrl = sUrl + `('${encodeURIComponent(this._oOptions.ui5.bspcontainer)}')`;

        sUrl = sUrl + "?CodePage='UTF8'";

        if (this._oOptions.ui5.transportno) {
            sUrl = sUrl + "&TransportRequest=" + this._oOptions.ui5.transportno;
        }

        if (this._oOptions.conn.testMode) {
            sUrl = sUrl + "&TestMode=TRUE";
        }

        const oRequestOptions = {
            method: "DELETE",
            url: sUrl
        };

        const oResponse = await this._client.sendRequestPromise(oRequestOptions);

        if (this.doesResponseContainAnError(oResponse)) {
            throw new Error(util.createResponseError(typeof oResponse.body === "object" ? JSON.stringify(oResponse.body, null, 4) : oResponse.body));
        }
    }

    /**
     * Check if response contains an error.
     * @param {Object} oResponse Request response
     * @returns {boolean} Info if response contains an error
     */
    doesResponseContainAnError(oResponse) {
        let bErrorOccurred = false;

        let errorDetails = null;

        if (oResponse.body && oResponse.body.errordetails) {
            errorDetails = oResponse.body.errordetails;
        }

        if (oResponse.body && oResponse.body.error && oResponse.body.error.innererror && oResponse.body.error.innererror.errordetails && oResponse.body.error.innererror.errordetails.length > 0) {
            errorDetails = oResponse.body.error.innererror.errordetails;
        }

        if (errorDetails) {
            const idx = errorDetails.findIndex((errordetail) => {
                return errordetail.severity === "error";
            });

            bErrorOccurred = idx !== -1;
        } else if (oResponse.statusCode !== util.HTTPSTAT.ok && oResponse.statusCode !== util.HTTPSTAT.created && oResponse.statusCode !== util.HTTPSTAT.no_content) {
            bErrorOccurred = true;
        }

        return bErrorOccurred;
    }
};
