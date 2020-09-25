"use strict";

const Logger = require("./lib/Logger");
const path = require("path");
const ui5Deployercore = require("ui5-nwabap-deployer-core");

module.exports = function(grunt) {
    grunt.registerMultiTask("nwabap_ui5uploader", "UI5 source upload to SAP NetWeaver ABAP", async function() {
        const oLogger = new Logger(grunt);
        // eslint-disable-next-line no-invalid-this
        const done = this.async();

        // options
        // eslint-disable-next-line no-invalid-this
        const oOptions = this.options({
            resources: {}
        });

        // get file names
        if (!oOptions.resources || !oOptions.resources.cwd || !oOptions.resources.src) {
            grunt.fail.warn("Resources configuration not (fully) specified.");
            done();
            return;
        }

        const aFiles = [];

        grunt.file.expand({
            cwd: oOptions.resources.cwd,
            filter: "isFile",
            dot: true
        }, oOptions.resources.src).forEach(function(sFilePath) {
            const sCompleteFilePath = path.join(oOptions.resources.cwd, sFilePath);
            aFiles.push({
                path: sFilePath,
                content: grunt.file.read(sCompleteFilePath, { encoding: null})
            });
        });

        const oDeployOptions = {
            conn: {
                server: oOptions.conn.server,
                client: oOptions.conn.client,
                useStrictSSL: oOptions.conn.useStrictSSL,
                proxy: oOptions.conn.proxy,
                customQueryParams: oOptions.conn.customQueryParams ? oOptions.conn.customQueryParams : {}
            },
            auth: {
                user: oOptions.auth.user,
                pwd: oOptions.auth.pwd
            },
            ui5: {
                language: oOptions.ui5.language,
                transportno: oOptions.ui5.transportno,
                package: oOptions.ui5.package,
                bspcontainer: oOptions.ui5.bspcontainer,
                bspcontainer_text: oOptions.ui5.bspcontainer_text,
                create_transport: !!oOptions.ui5.create_transport,
                transport_text: oOptions.ui5.transport_text,
                transport_use_user_match: !!oOptions.ui5.transport_use_user_match,
                transport_use_locked: !!oOptions.ui5.transport_use_locked,
                calc_appindex: !!oOptions.ui5.calc_appindex
            }
        };

        try {
            await ui5Deployercore.deployUI5toNWABAP(oDeployOptions, aFiles, oLogger);
        } catch (oError) {
            oLogger.error(oError);
        }

        done();
    });
};
