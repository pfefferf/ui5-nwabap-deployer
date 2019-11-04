/*
 * grunt-nwabap-ui5uploader
 * https://github.com/pfefferf/grunt-nwabap-ui5uploader
 *
 * Copyright (c) 2016 - 2019 Florian Pfeffer
 * Licensed under the Apache-2.0 license.
 */

'use strict';

module.exports = function (grunt) {

    const sUser = grunt.option('user');
    const sPwd = grunt.option('pwd');
    const sServer = grunt.option('server');

    grunt.initConfig({

        //  test configurations
        nwabap_ui5uploader: {
            options: {
                conn: {
                    server: sServer
                },
                auth: {
                    user: sUser,
                    pwd: sPwd
                }
            },
            upload_webapp: {
                options: {
                    ui5: {
                        package: '$TMP',
                        bspcontainer: 'ZZ_GUI5UP_TMP',
                        bspcontainer_text: 'Test Grunt UI5 upload'
                    },
                    resources: {
                        cwd: 'test/webapp',
                        src: '**/*.*'
                    }
                }
            },
            upload_webapp_empty: {
                options: {
                    ui5: {
                        package: '$TMP',
                        bspcontainer: 'ZZ_GUI5UP_TMP',
                        bspcontainer_text: 'Test Grunt UI5 upload'
                    },
                    resources: {
                        cwd: 'test/webapp_empty',
                        src: '**/*.*'
                    }
                }
            },
            upload_webapp_with_transport: {
                options: {
                    ui5: {
                        package: 'ZZ_FP_UI5_REPOSITORY',
                        bspcontainer: 'ZZ_GUI5UP_TP02',
                        bspcontainer_text: 'Test Grunt UI5 upload',
                        create_transport: true,
                        transport_text: 'Test Transport',
                        calc_appindex: true
                    },
                    resources: {
                        cwd: 'test/webapp',
                        src: '**/*.*'
                    }
                }
            }
        }            
    });

    grunt.loadTasks('lib');

    grunt.registerTask('test', ['nwabap_ui5uploader:upload_webapp']);
    grunt.registerTask('test_empty', ['nwabap_ui5uploader:upload_webapp_empty']);
    grunt.registerTask('test_tp', ['nwabap_ui5uploader:upload_webapp_with_transport']);
};
