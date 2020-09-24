const AdtClient = require("./AdtClient");

const CTS_BASE_URL = "/sap/bc/adt/cts/transports";
const _server = "https://example.org";
const _getParam = "spnego=disabled";

test("remove suffix slash(es) from server url", () => {
    const Client = new AdtClient(
        { server: "https://example.org/", client: "007", useStrictSSL: false, proxy: undefined },
        { user: "dummyUsr", pwd: "dummyPwd" },
        undefined,
        console
    );

    expect(Client._oOptions.conn.server).toMatch("https://example.org");
});

test("carry custom url GET parameter through", () => {
    const Client = new AdtClient(
        { server: `${_server}/?${_getParam}`, client: "007", useStrictSSL: false, proxy: undefined },
        { user: "dummyUsr", pwd: "dummyPwd" },
        undefined,
        console
    );
    const sUrl = Client.buildUrl(CTS_BASE_URL);
    expect(sUrl).toMatch(`${_server}${CTS_BASE_URL}?${_getParam}`);
});

test("manage custom url GET parameter + runtime GET parameters", () => {
    const Client = new AdtClient(
        { server: `${_server}/?${_getParam}`, client: "007", useStrictSSL: false, proxy: undefined },
        { user: "dummyUsr", pwd: "dummyPwd" },
        undefined,
        console
    );
    const sManualGetParams = "?_action=FIND&trfunction=K";
    const sUrl = Client.buildUrl(CTS_BASE_URL + sManualGetParams);
    expect(sUrl).toMatch(`${_server}${CTS_BASE_URL}?${sManualGetParams.substring(1)}&${_getParam}`);
});
