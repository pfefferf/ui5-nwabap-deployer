[![npm version](https://badge.fury.io/js/ui5-nwabap-deployer-cli.svg)](https://badge.fury.io/js/ui5-nwabap-deployer-cli)

# ui5-nwabap-deployer-cli

`ui5-nwabap-deployer-cli` is a CLI tooling which allows to deploy UI5 sources to a SAP NetWeaver ABAP application server.

## Install

### Global Installation
```bash
npm install -g ui5-nwabap-deployer-cli
```

Global installation makes the command `ui5-deployer` globally available.

### Local Installation
```bash
npm install ui5-nwabap-deployer-cli --save-dev
```
Local installation requires the execution of the tool like `./node_modules/.bin/ui5-deployer`.

## CLI Options for `ui5-deployer`

Following base CLI options are available:
- `help`: shows the CLI help, execute `ui5-deployer --help`
- `version`: shows the CLI version, execute `ui5-deployer --version`

## CLI Commands for `ui5-deployer`

### deploy

The `deploy` command deploys UI5 sources to an ABAP system. It provides following arguments.

|Option|Description|Mandatory|Default Value|
|:-|:-|:-|:-|
|config |Configuration file containing options for. By default for a file './.ui5deployrc' is searched. If not file is found, it is ignored. Options defined in the configuration file are always overwritten in case they are applied on the command line. Consider to never store the user and password in the config file if the file is shared, provide them as command line arguments.|-|-|
|cwd |Directory in which files for deployment are available.|X|./dist|
|files |Glob pattern to match files for deployment.|X|**/\*.\*|
|server |SAP NetWeaver ABAP application server information in form protocol://host:port|X|-|
|client |Client of SAP NetWeaver ABAP application server; if not set default client of server is used.|-|-|
|user |User used for logon to SAP NetWeaver ABAP application server.|X|-|
|pwd |Password used for logon to SAP NetWeaver ABAP application server|X|-|
|useStrictSSL |SSL mode handling. In case of self signed certificates the useStrictSSL mode option can be set to false to allow a deployment of files.|-|true|
|proxy |Proxy to be used for communication to SAP NetWeaver ABAP application server, form protocol://host:port|-|-|
|customQueryParams |Additional query parameters to be appended to the server calls. To be provied in form `parameterName=parameterValue`|-|-|
|language |Language for deployment.|-|EN|
|package |Defines the development package in which the BSP container for the UI5 sources is available or should be created.|X|-|
|bspContainer |Defines the name of the BSP container used for the storage of the UI5 sources. Length is restricted to 15 characters (exclusive customer specific namespaces, e.g. /YYY/).|X|-|
|bspContainerText |Defines the description of the BSP container.|X|-|
|transportNo |Defines the transport number which logs the changes|X (in case sources are not deployed as local objects)|-|
|createTransport |Set this option to true in case a new transport should be created each time the application is deployed.|-|false|
|transportText |Text for transport to be created.|X (in case a transport has to be created)|-|
|transportUseLocked |If a deplyoment failed due to the BSP application is locked in another transport, the old (original one) transport will be used to deploy the files.|-|false|
|transportUseUserMatch |It will be tried to find a transport request of the given user. If no transport is found and createTransport is enabled a new one will be created and used for further file deployments.|-|false|
|calculateApplicationIndex |Specify if you require the application index (program /UI5/APP_INDEX_CALCULATE) for the application to be recalculated after the BSP application is deployed. Note: This only works with team repository provider version 1.30.x or higher and User Interface Add-On 2.0 for SAP NetWeaver.|-|false|

Providing the options for the `deploy` command can be done by a configuration file. By default the command searches for a file `./ui5deployrc`. Using the option `--config` an alternative file name can be provided. In the configuration file all options can be provided which are available as command line arguments. The configuration must be provided as JSON object.

Configuration file example with dummy data. Consider: Do not configure the user and password in the file is shared, provide them as command line arguments.
```json
{
    "cwd": "./dist",
    "files": "**/*.*",
    "server": "http://localhost:8000",
    "client": "100",
    "user": "testuser",
    "pwd": "abcd1234",    
	"useStrictSSL": false,
    "proxy": "http://proxy:3000",
    "customQueryParams": {
        "parameter1": "Test",
        "parameter2": 1234
    },
    "language": "EN",
    "package": "ZZ_UI5_REPOSITORY",
    "bspContainer": "ZZ_UI5_TEST",
    "bspContainerText": "Test UI5 Upload",
    "transportNo": "A4HK900000",
    "createTransport": false,
    "transportText": "Test Transport",
    "transportUseLocked": false,
    "transportUseUserMatch": false,
    "calculateApplicationIndex": true
}
```
In a configuration file not all options must be maintained. It is possible to maintain standard options in the configuration file and provide other ones as command line arguments (like the user and password or the transport number). If an option is defined in the configuration file and provided as command line argument, always the value from the command line argument is taken.

## Examples for `deploy` command

### Deploy an UI5 app with creation/reusage of transport - command line arguments only

```bash
ui5-deployer deploy --server http://localhost:8000 --client "001" --user DEVELOPER --pwd myDeveloperPwd --package ZZ_UI5_REPOSITORY --bspContainer ZZ_UI5_TEST --bspContainerText "Crazy UI5 App" --createTransport true --transportText "UI5 App Development" --transportUseLocked true --calculateApplicationIndex true
```

### Deploy an UI5 app - specific configuration file + user/password as command line arguments
```bash
ui5-deployer deploy --config ./.myspecificui5deployconfig --user DEVELOPER --pwd myDeveloperPwd 
```

## Release History

[CHANGELOG.md](https://github.com/pfefferf/ui5-nwabap-deployer/blob/master/packages/ui5-nwabap-deployer-cli/CHANGELOG.md)

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)
