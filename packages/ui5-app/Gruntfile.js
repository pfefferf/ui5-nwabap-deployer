"use strict";

module.exports = function (grunt) {

    grunt.loadNpmTasks("grunt-nwabap-ui5uploader");

    const sUser = grunt.option("user");
    const sPwd = grunt.option("pwd");
    const sServer = grunt.option("server");

    grunt.initConfig({

        // test configurations
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
                        package: "$TMP",
                        bspcontainer: "ZZ_GUI5UP_TMP",
                        bspcontainer_text: "Test Grunt UI5 upload"
                    },
                    resources: {
                        cwd: "webapp",
                        src: "**/*.*"
                    }
                }
            },
            upload_webapp_empty: {
                options: {
                    ui5: {
                        package: "$TMP",
                        bspcontainer: "ZZ_GUI5UP_TMP",
                        bspcontainer_text: "Test Grunt UI5 upload"
                    },
                    resources: {
                        cwd: "webapp_empty",
                        src: "**/*.*"
                    }
                }
            },
            upload_webapp_with_transport: {
                options: {
                    ui5: {
                        package: "ZZ_FP_UI5_REPOSITORY",
                        bspcontainer: "ZZ_GUI5UP_TP02",
                        bspcontainer_text: "Test Grunt UI5 upload",
                        create_transport: true,
                        transport_text: "Test Transport",
                        calc_appindex: true
                    },
                    resources: {
                        cwd: "webapp",
                        src: "**/*.*"
                    }
                }
            }
        }            
    });

    grunt.registerTask("test", ["nwabap_ui5uploader:upload_webapp"]);
    grunt.registerTask("test_empty", ["nwabap_ui5uploader:upload_webapp_empty"]);
    grunt.registerTask("test_tp", ["nwabap_ui5uploader:upload_webapp_with_transport"]);
};
