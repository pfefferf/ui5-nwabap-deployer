'use strict';

var async = require('async');
var XMLDocument = require('xmldoc').XmlDocument;
var util = require('./FileStoreUtil');
var fs = require('fs');
var isBinaryFile = require('isbinaryfile');
var AdtClient = require('./AdtClient');

var FILESTORE_BASE_URL = '/sap/bc/adt/filestore/ui5-bsp/objects';
var SLASH_ESCAPED = '%2f';

/**
 * FileStore constructor
 * @public
 * @param {object} oOptions Options for FileStore
 * @param {object} oLogger
 */
var FileStore = function (oOptions, oLogger) {
    /*
     oOptions
     - conn:[server, client, useStrictSSL, proxy]
     - auth:[user, pwd]
     - ui5:[language, transportno, package, bspcontainer (max 15 chars w/o ns), bspcontainer_text, calc_appindex]
     */
    this._init(oOptions, oLogger);
};

/**
 * init
 * @param {object} oOptions Options for FileStore
 * @param {object} oLogger Logger
 */
FileStore.prototype._init = function (oOptions, oLogger) {
    // options
    this._oOptions = oOptions;
    // logger
    this._oLogger = oLogger;

    this._client = new AdtClient(oOptions.conn, oOptions.auth, oOptions.ui5.language, oLogger);
};

/**
 * Construct the base Url for server access
 * @private
 * @return {string} base URL
 */
FileStore.prototype._constructBaseUrl = function () {
    return this._oOptions.conn.server + FILESTORE_BASE_URL;
};

/**
 * Get Metadata of BSP container
 * @public
 * @param {function} fnCallback callback function
 */
FileStore.prototype.getMetadataBSPContainer = function (fnCallback) {
    var sUrl = this._constructBaseUrl() + '/' + encodeURIComponent(this._oOptions.ui5.bspcontainer);

    var oRequestOptions = {
        url: sUrl
    };

    this._client.sendRequest(oRequestOptions, function (oError, oResponse) {
        if (oError) {
            fnCallback(util.createResponseError(oError));
            return;
        } else if (oResponse.statusCode !== util.HTTPSTAT.ok && oResponse.statusCode !== util.HTTPSTAT.not_found) {
            fnCallback(new Error(`Operation Get BSP Container Metadata: Expected status code ${util.HTTPSTAT.ok} or ${util.HTTPSTAT.not_found}, actual status code ${oResponse.statusCode}, response body '${oResponse.body}'`));
            return;
        } else {
            fnCallback(null, oResponse);
            return;
        }
    });
};

/**
 * Create BSP container
 * @public
 * @param {function} fnCallback callback function
 */
FileStore.prototype.createBSPContainer = function (fnCallback) {
    var me = this;

    async.series([
        me._client.determineCSRFToken.bind(me._client),
        me.getMetadataBSPContainer.bind(me)
    ], function (oError, aResult) {
        if (oError) {
            fnCallback(util.createResponseError(oError));
            return;
        }

        if (aResult[1].statusCode === util.HTTPSTAT.not_found) {
            // create BSP Container
            var sUrl = me._constructBaseUrl() +
                '/%20/content?type=folder&isBinary=false' +
                '&name=' + encodeURIComponent(me._oOptions.ui5.bspcontainer) +
                '&description=' + encodeURIComponent(me._oOptions.ui5.bspcontainer_text) +
                '&devclass=' + encodeURIComponent(me._oOptions.ui5.package);

            if (me._oOptions.ui5.transportno) {
                sUrl += '&corrNr=' + encodeURIComponent(me._oOptions.ui5.transportno);
            }

            var oRequestOptions = {
                method: 'POST',
                url: sUrl,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept-Language': 'en-EN',
                    'accept': '*/*'
                }
            };

            me._client.sendRequest(oRequestOptions, function (oError, oResponse) {
                if (oError) {
                    fnCallback(new Error(util.createResponseError(oError)));
                    return;
                } else if (oResponse.statusCode !== util.HTTPSTAT.created) {
                    fnCallback(new Error(`Operation Create BSP Container: Expected status code ${util.HTTPSTAT.created}, actual status code ${oResponse.statusCode}, response body '${oResponse.body}'`));
                    return;
                } else {
                    fnCallback(null, oResponse);
                    return;
                }
            });
        } else {
            fnCallback(null);
        }
    });
};

/**
 * Re-calculate SAPUI5 ABAP Repository Application Index
 * @public
 * @param {function} fnCallback callback function
 */
FileStore.prototype.calcAppIndex = function (fnCallback) {

    if (!this._oOptions.ui5.calc_appindex) {
        // option to recalculate the application index is not enabled - simply fire the callback
        fnCallback(null, null);
        return;
    }

    // create the URL for appindex recalculation
    var sUrl = this._oOptions.conn.server +
        '/sap/bc/adt/filestore/ui5-bsp/appindex/' +
        encodeURIComponent(this._oOptions.ui5.bspcontainer);

    var oRequestOptions = {
        method: 'POST',
        url: sUrl,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Accept-Language': 'en-EN',
            'accept': '*/*'
        }
    };

    this._client.sendRequest(oRequestOptions, function (oError, oResponse) {
        if (oError) {
            fnCallback(new Error(util.createResponseError(oError)));
            return;
        } else if (oResponse.statusCode !== util.HTTPSTAT.ok) {
            fnCallback(new Error(`Operation Application Index Recalculation: Expected status code ${util.HTTPSTAT.ok}, actual status code ${oResponse.statusCode}, response body '${oResponse.body}'`));
            return;
        } else {
            fnCallback(null, oResponse);
            return;
        }
    });
};

/**
 * Synchronize files
 * @public
 * @param {Array} aFiles Files to be synchronized with server
 * @param {string} sCwd base folder
 * @param {function} fnCallback callback function
 */
FileStore.prototype.syncFiles = function (aFiles, sCwd, fnCallback) {
    var aArtifactsLocal = util.structureResolve(aFiles, '/');
    var aArtifactsServer = [];
    var aArtifactsSync = [];
    var aArtifactsSyncWork = [];

    var me = this;

    async.series([
        // L1, step 1: determine artifacts which have to be uploaded
        function (fnCallbackAsyncL1) {

            async.series([
                // L2, step 1: get files from server
                function (fnCallbackAsyncL2) {
                    var aFolders = [];
                    aFolders.push(me._oOptions.ui5.bspcontainer);

                    async.whilst(
                        function () {
                            return aFolders.length > 0;
                        },
                        function (fnCallbackAsyncL3) {
                            var sFolder = aFolders.shift();

                            var sUrl = me._constructBaseUrl() + '/' + encodeURIComponent(sFolder) + '/content';

                            var oRequestOptions = {
                                url: sUrl
                            };

                            me._client.sendRequest(oRequestOptions, function (oError, oResponse) {
                                if (oError) {
                                    fnCallback(new Error(util.createResponseError(oError)));
                                    return;
                                } else if (oResponse.statusCode !== util.HTTPSTAT.ok && oResponse.statusCode !== util.HTTPSTAT.not_found ) {
                                    fnCallback(new Error(`Operation Server File Determination: Expected status code ${util.HTTPSTAT.ok} or ${util.HTTPSTAT.not_found}, actual status code ${oResponse.statusCode}, response body '${oResponse.body}'`));
                                    return;
                                }

                                if (oResponse.statusCode === util.HTTPSTAT.not_found) { //BSP container does not exist
                                    fnCallbackAsyncL3(null, oResponse);
                                    return;
                                }

                                if (oResponse.statusCode !== util.HTTPSTAT.ok) {
                                    fnCallbackAsyncL3(util.createResponseError(oResponse), oResponse);
                                    return;
                                }

                                var oXML = new XMLDocument(oResponse.body);
                                var oAtomEntry = oXML.childrenNamed('atom:entry');

                                oAtomEntry.forEach(function (oChild) {
                                    var sCurrId = oChild.valueWithPath('atom:id');
                                    var sCurrType = oChild.valueWithPath('atom:category@term');

                                    aArtifactsServer.push({ type: sCurrType, id: sCurrId });

                                    if (sCurrType === util.OBJECT_TYPE.folder) {
                                        aFolders.push(sCurrId);
                                    }
                                });

                                fnCallbackAsyncL3(null, oResponse);
                            });
                        },
                        function (oError, oResult) {
                            aArtifactsServer = aArtifactsServer.map(function (oItem) {
                                var sId = oItem.id;

                                //remove bsp container at the beginning
                                if (encodeURIComponent(me._oOptions.ui5.bspcontainer).indexOf('%2F') !== -1) {
                                    sId = sId.replace('%2f', '%2F');
                                    sId = sId.replace('%2f', '%2F');
                                }
                                sId = sId.replace(encodeURIComponent(me._oOptions.ui5.bspcontainer), '');

                                var aValues = sId.split(SLASH_ESCAPED);
                                //remove empty values at the beginning (possible in case of a namespace with slashes)

                                if (aValues[0] === '') {
                                    aValues.shift();
                                }

                                oItem.id = '/' + aValues.join('/');
                                return oItem;
                            });

                            fnCallbackAsyncL2(oError, oResult);
                        }
                    );
                },

                // L2, step 2: compare against resolved artifacts
                function (fnCallbackAsyncL2) {
                    aArtifactsLocal.forEach(function (oItemLocal) {
                        var bFound = false;

                        aArtifactsServer.forEach(function (oItemServer) {
                            if (oItemLocal.type === oItemServer.type && oItemLocal.id === oItemServer.id) {
                                bFound = true;
                                aArtifactsSync.push({
                                    type: oItemLocal.type,
                                    id: oItemLocal.id,
                                    modif: util.MODIDF.update
                                });
                            }
                        });

                        if (bFound === false) {
                            aArtifactsSync.push({
                                type: oItemLocal.type,
                                id: oItemLocal.id,
                                modif: util.MODIDF.create
                            });
                        }
                    });

                    aArtifactsServer.forEach(function (oItemServer) {
                        var bFound = false;

                        aArtifactsLocal.forEach(function (oItemLocal) {
                            if (oItemLocal.type === oItemServer.type && oItemLocal.id === oItemServer.id) {
                                bFound = true;
                            }
                        });

                        if (bFound === false) {
                            aArtifactsSync.push({
                                type: oItemServer.type,
                                id: oItemServer.id,
                                modif: util.MODIDF.delete
                            });
                        }
                    });

                    fnCallbackAsyncL2(null, null);
                }

            ], function (oError, oResult) {
                fnCallbackAsyncL1(oError, oResult);
            });

        },

        // L1, step 2: order artifacts for processing
        function (fnCallbackAsyncL1) {
            /*
             order of artifacts
             1) DELETE files
             2) DELETE folders (starting with upper levels)
             3) CREATE folders (starting with lower levels)
             4) UPDATE folders -> not supported by ADT; but added to flow for completeness
             5) CREATE files
             6) UPDATE files
             */

            // level counter
            aArtifactsSync = aArtifactsSync.map(function (oItem) {
                oItem.levelCount = oItem.id.split('/').length - 1;
                return oItem;
            });

            me._oLogger.logVerbose('Artifacts to Sync: ', aArtifactsSync);

            // sort
            var aDeleteFiles = aArtifactsSync.filter(function (oItem) {
                return (oItem.type === util.OBJECT_TYPE.file && oItem.modif === util.MODIDF.delete);
            });
            var aDeleteFolders = aArtifactsSync.filter(function (oItem) {
                return (oItem.type === util.OBJECT_TYPE.folder && oItem.modif === util.MODIDF.delete);
            }).sort(function (oItem1, oItem2) {
                if (oItem1.levelCount > oItem2.levelCount) {
                    return -1;
                }
                if (oItem1.levelCount < oItem2.levelCount) {
                    return 1;
                }
                return 0;
            });

            var aCreateFolders = aArtifactsSync.filter(function (oItem) {
                return (oItem.type === util.OBJECT_TYPE.folder && oItem.modif === util.MODIDF.create);
            }).sort(function (oItem1, oItem2) {
                if (oItem1.levelCount < oItem2.levelCount) {
                    return -1;
                }
                if (oItem1.levelCount > oItem2.levelCount) {
                    return 1;
                }
                return 0;
            });
            var aUpdateFolders = aArtifactsSync.filter(function (oItem) {
                return (oItem.type === util.OBJECT_TYPE.folder && oItem.modif === util.MODIDF.update);
            });
            var aCreateFiles = aArtifactsSync.filter(function (oItem) {
                return (oItem.type === util.OBJECT_TYPE.file && oItem.modif === util.MODIDF.create);
            });
            var aUpdateFiles = aArtifactsSync.filter(function (oItem) {
                return (oItem.type === util.OBJECT_TYPE.file && oItem.modif === util.MODIDF.update);
            });

            aArtifactsSync = aDeleteFiles.concat(aDeleteFolders, aCreateFolders, aUpdateFolders, aCreateFiles, aUpdateFiles);
            aArtifactsSyncWork = aArtifactsSync.slice(0);

            fnCallbackAsyncL1(null, null);
        },

        // L1, step 3: create BSP container
        function (fnCallbackAsyncL1) {
            async.series([
                me.createBSPContainer.bind(me)
            ], function (oError, oResult) {
                fnCallbackAsyncL1(oError, oResult);
            });
        },

        // L1, step 4: do synchronization of folders and files
        function (fnCallbackAsyncL1) {

            async.whilst(
                function () {
                    return aArtifactsSyncWork.length > 0;
                },
                function (fnCallbackAsyncL2) {
                    var oItem = aArtifactsSyncWork.shift();

                    switch (oItem.type) {
                        case util.OBJECT_TYPE.folder:
                            me.syncFolder(oItem.id, oItem.modif, fnCallbackAsyncL2);
                            break;

                        case util.OBJECT_TYPE.file:
                            me.syncFile(oItem.id, oItem.modif, sCwd, fnCallbackAsyncL2);
                            break;
                    }

                },
                function (oError, oResult) {
                    fnCallbackAsyncL1(oError, oResult);
                }
            );
        },

        // L1, step 5: ensure UI5 Application Index is updated
        function (fnCallbackAsyncL1) {
            async.series([
                me.calcAppIndex.bind(me)
            ], function (oError, oResult) {
                fnCallbackAsyncL1(oError, oResult);
            });
        }

    ], function (oError) {
        fnCallback(oError, aArtifactsSync);
    });
};

/**
 * Sync folder
 * @public
 * @param {string} sFolder folder
 * @param {string} sModif modification type (create/update/delete)
 * @param {function} fnCallback callback function
 */
FileStore.prototype.syncFolder = function (sFolder, sModif, fnCallback) {
    var me = this;

    var oRequestOptions = null;
    var sUrl = null;

    switch (sModif) {
        case util.MODIDF.create:
            sUrl = me._constructBaseUrl() +
                '/' + encodeURIComponent(me._oOptions.ui5.bspcontainer) + encodeURIComponent(util.splitIntoPathAndObject(sFolder).path) +
                '/content?type=folder&isBinary=false' +
                '&name=' + encodeURIComponent(util.splitIntoPathAndObject(sFolder).obj) +
                '&devclass=' + encodeURIComponent(me._oOptions.ui5.package);

            if (me._oOptions.ui5.transportno) {
                sUrl += '&corrNr=' + encodeURIComponent(me._oOptions.ui5.transportno);
            }

            oRequestOptions = {
                method: 'POST',
                url: sUrl,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept-Language': 'en-EN',
                    'accept': '*/*'
                }
            };

            break;

        case util.MODIDF.update:
            // no action, update not supported by ADT
            fnCallback(null, null);
            return;

        case util.MODIDF.delete:
            sUrl = me._constructBaseUrl() +
                '/' + encodeURIComponent(me._oOptions.ui5.bspcontainer) + encodeURIComponent(sFolder) +
                '/content' +
                '?deleteChildren=true';

            if (me._oOptions.ui5.transportno) {
                sUrl += '&corrNr=' + encodeURIComponent(me._oOptions.ui5.transportno);
            }

            oRequestOptions = {
                method: 'DELETE',
                url: sUrl,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept-Language': 'en-EN',
                    'accept': '*/*',
                    'If-Match': '*'
                }
            };

            break;

        default:
            fnCallback('Not supported modification indicator for folder specified', null);
            return;
    }

    me._client.sendRequest(oRequestOptions, function (oError, oResponse) {
        if (oError) {
            fnCallback(new Error(util.createResponseError(oError)));
            return;
        }

        me._oLogger.log('NW ABAP UI5 Uploader: folder ' + sFolder + ' ' + sModif + 'd.');
        fnCallback(null, oResponse);
    });

};

/**
 * Sync file
 * @public
 * @param {string} sFile file
 * @param {string} sModif modification type (create/update/delete)
 * @param {string} sCwd base folder
 * @param {function} fnCallback callback function
 */
FileStore.prototype.syncFile = function (sFile, sModif, sCwd, fnCallback) {
    var me = this;

    var oRequestOptions = null;
    var sUrl = null;
    var oFileContent = null;
    var bBinaryFile = false;
    var sFileCharset = 'UTF-8';

    if (sModif === util.MODIDF.create || sModif === util.MODIDF.update) {
        oFileContent = fs.readFileSync(sCwd + sFile);

        bBinaryFile = (isBinaryFile.sync(sCwd + sFile)) ? true : false;
    }

    switch (sModif) {
        case util.MODIDF.create:
            sUrl = me._constructBaseUrl() +
                '/' + encodeURIComponent(me._oOptions.ui5.bspcontainer) + encodeURIComponent(util.splitIntoPathAndObject(sFile).path) +
                '/content?type=file' +
                '&isBinary=' + bBinaryFile +
                '&name=' + encodeURIComponent(util.splitIntoPathAndObject(sFile).obj) +
                '&devclass=' + encodeURIComponent(me._oOptions.ui5.package) +
                '&charset=' + sFileCharset;

            if (me._oOptions.ui5.transportno) {
                sUrl += '&corrNr=' + encodeURIComponent(me._oOptions.ui5.transportno);
            }

            oRequestOptions = {
                method: 'POST',
                url: sUrl,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept-Language': 'en-EN',
                    'accept': '*/*'
                }
            };


            if (oFileContent.length > 0) {
                oRequestOptions.body = oFileContent;
            } else {
                oRequestOptions.body = ' ';
            }

            break;

        case util.MODIDF.update:
            sUrl = me._constructBaseUrl() +
                '/' + encodeURIComponent(me._oOptions.ui5.bspcontainer) + encodeURIComponent(sFile) +
                '/content' +
                '?isBinary=' + bBinaryFile +
                '&charset=' + sFileCharset;

            if (me._oOptions.ui5.transportno) {
                sUrl += '&corrNr=' + encodeURIComponent(me._oOptions.ui5.transportno);
            }

            oRequestOptions = {
                method: 'PUT',
                url: sUrl,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept-Language': 'en-EN',
                    'accept': '*/*',
                    'If-Match': '*'
                }
            };

            if (oFileContent.length > 0) {
                oRequestOptions.body = oFileContent;
            } else {
                oRequestOptions.body = ' ';
            }

            break;

        case util.MODIDF.delete:
            sUrl = me._constructBaseUrl() +
                '/' + encodeURIComponent(me._oOptions.ui5.bspcontainer) + encodeURIComponent(sFile) +
                '/content';

            if (me._oOptions.ui5.transportno) {
                sUrl += '?corrNr=' + encodeURIComponent(me._oOptions.ui5.transportno);
            }

            oRequestOptions = {
                method: 'DELETE',
                url: sUrl,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Accept-Language': 'en-EN',
                    'accept': '*/*',
                    'If-Match': '*'
                }
            };

            break;

        default:
            fnCallback('Not supported modification indicator for file specified', null);
            return;
    }

    me._client.sendRequest(oRequestOptions, function (oError, oResponse) {
        if (oError) {
            fnCallback(util.createResponseError(oError));
            return;
        }

        if (oResponse.statusCode == util.HTTPSTAT.int_error) {
            if (me._oOptions.ui5.transport_use_locked) {
                if (oResponse.body) {
                    var aMatched = oResponse.body.match(/.{3}K\d{6}/g);
                    if (aMatched && aMatched.length > 0) {
                        me._oLogger.log('NW ABAP UI5 Uploader: Warning: the current BSP Application was already locked in ' + aMatched[0] + '. Transport ' + aMatched[0] + ' is used instead of ' + me._oOptions.ui5.transportno + '.');
                        me._oOptions.ui5.transportno = aMatched[0];
                        me.syncFile(sFile, sModif, sCwd, function (a, b) {
                            fnCallback(a, b);
                        });
                        return;
                    }
                }
            }
            fnCallback(util.createResponseError(oResponse.body), oResponse);
        } else {
            me._oLogger.log('NW ABAP UI5 Uploader: file ' + sFile + ' ' + sModif + 'd.');
            fnCallback(null, oResponse);
        }
    });

};

/**
 * export
 */
module.exports = FileStore;