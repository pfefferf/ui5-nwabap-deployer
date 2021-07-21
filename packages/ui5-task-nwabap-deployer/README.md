[![npm version](https://badge.fury.io/js/ui5-task-nwabap-deployer.svg)](https://badge.fury.io/js/ui5-task-nwabap-deployer)

# ui5-task-nwabap-deployer

`ui5-task-nwabap-deployer` is a custom UI5 Tooling task which allows to directly deploy the builded sources to a SAP NetWeaver ABAP application server. 

Starting from version 2.0.0 this deployer uses the OData Service [/UI5/ABAP_RESPOSITORY_SRV](https://ui5.sap.com/#/topic/a883327a82ef4cc792f3c1e7b7a48de8) for deploying UI5 sources. Please make sure that the service is activated on your system (for details you can check SAP note [2999557](https://launchpad.support.sap.com/#/notes/2999557)). The new service does some sanity checks like e.g. virus scans. If you have not configured virus scan profiles or want to disable virus scanning please have a look to SAP note [2437892](https://launchpad.support.sap.com/#/notes/2437892).
</br>Current deployer versions starting from version 2.0.0 can be used with SAP systems on which component SAP_UI 753 is installed. On systems with a lower version of component SAP_UI, you have to use version 1.x.x of this deployer.

## Install
```bash
npm install ui5-task-nwabap-deployer --save-dev
```

## Configuration Options (in `$yourapp/ui5.yaml`)

- resources
    - pattern: optional `string` | `array` glob pattern to match files for deployment (e.g. `**/*.*` to match all files); if not set `**/*.*` is used
- connection
    - server: `string` SAP NetWeaver ABAP application server information in form `protocol://host:port` (alternative: set environment variable `UI5_TASK_NWABAP_DEPLOYER__SERVER`)
    - client: optional `string` Client of SAP NetWeaver ABAP application server; if not set default client of server is used (alternative: set environment variable `UI5_TASK_NWABAP_DEPLOYER__CLIENT`)
    - useStrictSSL: optional `true|false` SSL mode handling. In case of self signed certificates the useStrictSSL mode option can be set to false to allow a deployment of files; default value: `true`
    - proxy: optional `string` Proxy to be used for communication to SAP NetWeaver ABAP application server (e.g. `http://myproxyhost:3128`).
    - testMode: optional `boolean` Do deployment in test mode (alternative: set environment variable UI5_TASK_NWABAP_DEPLOYER__TESTMODE).
    - customQueryParams: option key/value query parameter values added to the call to the SAP NetWeaver ABAP application server
- authentication
    - user: `string`User used for logon to SAP NetWeaver ABAP application server (alternative: set environment variable `UI5_TASK_NWABAP_DEPLOYER__USER`)
    - password: `string` Password used for logon to SAP NetWeaver ABAP application server (alternative: set environment variable `UI5_TASK_NWABAP_DEPLOYER__PASSWORD`)
- ui5
    - language: optional `string` Language for deployment (e.g. EN); default value `EN`
    - package: `string` Defines the development package in which the BSP container for the UI5 sources is available or should be created.
    - bspContainer: `string` Defines the name of the BSP container used for the storage of the UI5 sources. Length is restricted to 15 characters (exclusive customer specific namespaces, e.g. /YYY/).
    - bspContainerText: `string` Defines the description of the BSP container.
    - transportNo: optional (in case package is set to `$TMP`) `string` Defines the transport number which logs the changes (alternative: set environment variable `UI5_TASK_NWABAP_DEPLOYER__TRANSPORTNO`).
    - createTransport: optional `true|false` Set this option to true in case a new transport should be created each time the application is deployed.
    - transportText: optional `string` Text for transport to be created.
    - transportUseUserMatch: optional `true|false` It will be tried to find a transport request of the given user. If no transport is found and createTransport is enabled a new one will be created and used for further file deployments.
    - transportUseLocked: optional `true|false` If a deployment failed due to the BSP application is locked in another transport, the old (original one) transport will be used to deploy the files.

## Usage

1. Define the dependency in `$yourapp/package.json`
```json
...
"devDependencies": {
    // ...
    "ui5-task-nwabap-deployer": "*"
    // ...
},
"ui5": {
    "dependencies": [
        // ...
        "ui5-task-nwabap-deployer",
        // ...
    ]
}
...
```

2. Configure it in `$yourapp/ui5.yaml`
```yaml
builder:
  customTasks:
  - name: ui5-task-nwabap-deployer
    afterTask: generateVersionInfo
    configuration: 
      resources:
        pattern: "**/*.*"
      connection:
        server: http://myserver:8000
        customQueryParams:
          myCustomParameter1: myCustomValue1
          myCustomParameter2: myCustomValue2
      authentication:
        user: myUser
        password: myPassword
      ui5:
        language: EN
        package: ZZ_UI5_REPO
        bspContainer: ZZ_UI5_TRACKED
        bspContainerText: UI5 Upload
        transportNo: DEVK900000    
```

## Further Information

### Environment Variables
For development purposes environment variables can be stored in a `.env` file. They are automatically applied by the [dotenv](https://www.npmjs.com/package/dotenv) module.

## Release History

[CHANGELOG.md](https://github.com/pfefferf/ui5-nwabap-deployer/blob/master/packages/ui5-task-nwabap-deployer/CHANGELOG.md)

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)
