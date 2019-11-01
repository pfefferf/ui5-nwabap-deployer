'use strict';

/**
 * Object type
 * @type {{file: string, folder: string}}
 */
var OBJECT_TYPE = {
    file: 'file',
    folder: 'folder'
};

/**
 * HTTP status
 * @type {{ok: number, created: number, not_authorized: number, not_found: number, not_allowed: number}}
 */
var HTTPSTAT = {
    ok: 200,
    created: 201,
    not_authorized: 403,
    not_found: 404,
    not_allowed: 405,
    int_error: 500
};

/**
 * Modification Identifier
 * @type {{create: string, update: string, delete: string}}
 */
var MODIDF = {
    create: 'create',
    update: 'update',
    delete: 'delete'
};

/**
 * Resolves file structure into single folders and files
 * @param {(string|string)} resolve file or file array
 * @param {string} sPathStartWith path has to start with that value
 * @return {Array} array with resolved folders and files
 */
function structureResolve(resolve, sPathStartWith) {
    var aToResolve = [];
    var aResolved = [];

    if (typeof resolve === 'object' && resolve instanceof Array) {
        aToResolve = resolve;
    } else if (typeof resolve === 'string') {
        aToResolve.push(resolve);
    } else {
        return null;
    }

    // resolve
    aToResolve.forEach(function (item) {
        var aSplit = item.split('/');

        for (var i = 0; i < aSplit.length; i++) {
            var aConc = aSplit.slice(0, i + 1);
            var sConc = (aConc.length > 1) ? aConc.join('/') : aConc[0];

            if (sConc.length > 0) {
                aResolved.push({
                    type: (i < (aSplit.length - 1)) ? OBJECT_TYPE.folder : OBJECT_TYPE.file,
                    id: (sConc.charAt(0) !== sPathStartWith) ? sPathStartWith + sConc : sConc
                });
            }
        }
    });

    // remove dups
    aResolved = aResolved.sort(function (sVal1, sVal2) {
        var sA = JSON.stringify(sVal1);
        var sB = JSON.stringify(sVal2);

        if (sA === sB) {
            return 0;
        } else if (sA <= sB) {
            return -1;
        } else {
            return 1;
        }
    })
        .filter(function (oItem, iPos) {
            if (iPos > 0) {
                return JSON.stringify(aResolved[iPos - 1]) !== JSON.stringify(oItem);
            } else {
                return true;
            }
        });

    return aResolved;
}

/**
 * Split a value into the path and object information
 * @param {string} sValue values like /test/test1.txt
 * @return {{path: string, obj: string}} Path object
 */
function splitIntoPathAndObject(sValue) {
    var aValues = sValue.split('/');
    var sObject = aValues.pop();
    var sPath = aValues.join('/');
    if (sPath.length > 0 && sPath.charAt(0) !== '/') {
        sPath = '/' + sPath;
    }
    return {
        path: sPath,
        obj: sObject
    };
}

/**
 *
 * @param {object} oError error
 * @return {string} response error string
 */
function createResponseError(oError) {
    if (oError) {
        return '' + oError;
    }

    return null;
}

/**
 * export
 */
exports.OBJECT_TYPE = OBJECT_TYPE;
exports.HTTPSTAT = HTTPSTAT;
exports.MODIDF = MODIDF;
exports.structureResolve = structureResolve;
exports.splitIntoPathAndObject = splitIntoPathAndObject;
exports.createResponseError = createResponseError;