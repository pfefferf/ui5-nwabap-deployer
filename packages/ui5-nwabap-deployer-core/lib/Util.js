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
    no_content: 204,
    bad_request: 400,
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
exports.splitIntoPathAndObject = splitIntoPathAndObject;
exports.createResponseError = createResponseError;
