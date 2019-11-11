'use strict';

const Logger = require('./lib/Logger');
const ui5Deployercore = require('ui5-nwabap-deployer-core');

module.exports = function(grunt) {

    grunt.registerMultiTask('nwabap_ui5uploader', 'UI5 source upload to SAP NetWeaver ABAP', async function () {

        const oLogger = new Logger(grunt);
        const done = this.async();

        // options
        var oOptions = this.options({
            resources: {}
        });

        // get file names
        if (!oOptions.resources || !oOptions.resources.cwd || !oOptions.resources.src) {
            grunt.fail.warn('Resources configuration not (fully) specified.');
            done();
            return;
        }

        var aFiles = [];

        grunt.file.expand({
            cwd: oOptions.resources.cwd,
            filter: 'isFile',
            dot: true
        }, oOptions.resources.src).forEach(function (sFile) {
            aFiles.push(sFile);
        });

        const oDeployOptions = {
            resources: {
                fileSourcePath: oOptions.resources.cwd
            },
            conn: {
                server: oOptions.conn.server,
                client: oOptions.conn.client,
                useStrictSSL: oOptions.conn.useStrictSSL,
                proxy: oOptions.conn.proxy
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
        
        // deploy
        try {
            await ui5Deployercore.deployUI5toNWABAP(oDeployOptions, aFiles, oLogger);
        } catch (oError) {
            // ignore, due to logging in core
        }

        done();

    });

};