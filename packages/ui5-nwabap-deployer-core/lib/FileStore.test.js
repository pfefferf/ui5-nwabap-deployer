const FileStore = require("./FileStore");

const FILESTORE_BASE_URL = "/sap/bc/adt/filestore/ui5-bsp/objects";
const _server = "https://example.org";
const _getParam = "spnego=disabled";
let oOptions = {
    conn: {
        server: `${_server}/?${_getParam}`,
        client: "4711",
        useStrictSSL: true,
        proxy: undefined,
    },
    auth: {
        user: "dummyUser",
        pwd: "dummyPwd",
    },
    ui5: {
        language: "DE",
        transportno: "DEVK9000",
        package: "ZMYPKG",
        bspcontainer: "ZBSP",
        bspcontainer_text: "My App",
        calc_appindex: true,
    },
};

test("support custom GET url params in base url construction", () => {
    const Client = new FileStore(oOptions, console);
    const baseUrl = Client._constructBaseUrl();
    expect(baseUrl).toMatch(`${_server}${FILESTORE_BASE_URL}?${_getParam}`);
});

describe("build complex url", () => {
    beforeEach(() => {
        oOptions.conn.server = `${_server}/?${_getParam}`; // hmmm....
        this.Client = new FileStore(oOptions, console);
    });
    test("several regular url parts get concatenated correctly (incl custom GET params)", () => {
        const aParts = [oOptions.ui5.bspcontainer, "another/deep/ref", "/in/the/url/path('...')"]; // note the diff leading "/" and special chars
        const sUrl = this.Client.buildUrl(...aParts);
        expect(sUrl).toMatch(
            `${_server}${FILESTORE_BASE_URL}` + `/${aParts[0]}` + `/${aParts[1]}` + `${aParts[2]}` + `?${_getParam}`
        );
    });

    test("several GET params mixed w/ custom url parts get concatenated correctly (incl custom GET params)", () => {
        const sUrl = this.Client.buildUrl(
            "/%20/content",
            "?type=folder",
            "&isBinary=false",
            "&name=" + encodeURIComponent(oOptions.ui5.bspcontainer),
            "&description=" + encodeURIComponent(oOptions.ui5.bspcontainer_text),
            "&devclass=" + encodeURIComponent(oOptions.ui5.package)
        );
        expect(sUrl).toMatch(
            `${_server}${FILESTORE_BASE_URL}` +
                "/%20/content" +
                `?${_getParam}` +
                "&type=folder&isBinary=false" +
                `&name=${oOptions.ui5.bspcontainer}` +
                `&description=${encodeURIComponent(oOptions.ui5.bspcontainer_text)}` +
                `&devclass=${oOptions.ui5.package}`
        );
    });
});
