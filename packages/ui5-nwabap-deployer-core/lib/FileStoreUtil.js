"use strict";

/**
 * Object type
 * @type {{file: string, folder: string}}
 */
const OBJECT_TYPE = {
    file: "file",
    folder: "folder"
};

/**
 * HTTP status
 * @type {{ok: number, created: number, bad_request: number, not_authorized: number, not_found: number, not_allowed: number}}
 */
const HTTPSTAT = {
    ok: 200,
    created: 201,
    bad_rquest: 400,
    not_authorized: 403,
    not_found: 404,
    not_allowed: 405,
    int_error: 500
};

/**
 * Modification Identifier
 * @type {{create: string, update: string, delete: string}}
 */
const MODIDF = {
    create: "create",
    update: "update",
    delete: "delete"
};

/**
 * Resolves file structure into single folders and files
 * @param {(Array)} resolve file object array
 * @param {string} sPathStartWith path has to start with that value
 * @return {Array} array with resolved folders and files
 */
function structureResolve(aResolve, sPathStartWith) {
    let aToResolve = [];
    let aResolved = [];

    if (aResolve.length === 0) {
        return [];
    }

    aToResolve = aResolve;

    // resolve
    aToResolve.forEach(function(oItem) {
        const aSplit = oItem.path.split("/");

        for (let i = 0; i < aSplit.length; i++) {
            const aConc = aSplit.slice(0, i + 1);
            const sConc = (aConc.length > 1) ? aConc.join("/") : aConc[0];

            if (sConc.length > 0) {
                const oResolved = {
                    id: (sConc.charAt(0) !== sPathStartWith) ? sPathStartWith + sConc : sConc,
                    type: (i < (aSplit.length - 1)) ? OBJECT_TYPE.folder : OBJECT_TYPE.file
                };

                if (oResolved.type === OBJECT_TYPE.file) {
                    oResolved.path = oItem.path;
                    oResolved.content = oItem.content;
                    oResolved.isBinary = oItem.isBinary;
                }

                aResolved.push(oResolved);
            }
        }
    });

    // remove dups
    aResolved = aResolved.sort(function(oVal1, oVal2) {
        const sA = JSON.stringify(oVal1.id);
        const sB = JSON.stringify(oVal2.id);

        if (sA === sB) {
            return 0;
        } else if (sA <= sB) {
            return -1;
        } else {
            return 1;
        }
    })
        .filter(function(oItem, iPos) {
            if (iPos > 0) {
                return JSON.stringify(aResolved[iPos - 1].id) !== JSON.stringify(oItem.id);
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
    const aValues = sValue.split("/");
    const sObject = aValues.pop();
    let sPath = aValues.join("/");
    if (sPath.length > 0 && sPath.charAt(0) !== "/") {
        sPath = "/" + sPath;
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
        return String(oError);
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
