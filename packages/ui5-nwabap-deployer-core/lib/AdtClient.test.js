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

    // make sure existing API prior to GET parameter support doesn't break
    expect(Client._oOptions.conn.server).toMatch("https://example.org");
    expect(Client.buildUrl(CTS_BASE_URL)).toMatch(`${_server}${CTS_BASE_URL}`);
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
