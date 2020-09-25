## 1.0.07 (2020-09-25)

### Feature
- Support of `options.conn.customQueryParams` configuration option to be able to transfer custom parameters to the backend (for instance to bypass SAML2 or SPNEGO authentication).

## 1.0.6 (2020-04-27)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.6 + setting for automatic update of ui5-nwabap-deployer-core package.

## 1.0.5 (2020-04-15)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.5.

## 1.0.4 (2020-03-17)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.4.

## 1.0.3 (2020-03-11)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.3.

## 1.0.2 (2020-01-24)

### Fixes
- Update depedency to ui5-nwabap-deployer-core to fix an issue regarding upload of files with special characters in their name.

## 1.0.1 (2019-12-20)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.2.

## 1.0.0 (2019-11-24)

### General
- Usage of ui5-nwabap-deployer-core package.

## 0.3.4 (2019-05-16)

### Features
- In case the creation of a transport request is required via option `options.ui5.create_transport`, the number of the created transport request is logged in form "Creation of transport request required. Number of created transport request: \<created transport request number\>".

## 0.3.3 (2019-01-14)

### Fixes
- Fixed issue regarding response status code check (thanks to [BurnerPat](https://github.com/BurnerPat)).

## 0.3.2 (2019-01-03)

### General
- More detailed information in case an ADT API call fails (expected HTTP Status Code, actual HTTP Status Code, response body).

## 0.3.1 (2018-11-26)

### Fixes
- Fixed issue in check if a transport for the user exists.

## 0.3.0 (2018-11-19)

### General
- Replaced `unirest` library by `request` library, because of a better maintenance support.
- Removal of duplicated code.
- Support for Node versions < 5.0.0 skipped.

## 0.2.10 (2018-09-07)

### Features
- Option `options.conn.proxy` added to specify a proxy for SAP NetWeaver ABAP server communcation (thanks to [anomistu](https://github.com/anomistu)).

## 0.2.9 (2018-06-01)

### Fixes
- Removal of ISO-8859-1 to avoid side issues when project is edited in different editors.

## 0.2.8 (2018-05-02)

### Fixes
- Fixed issue that "properties" files were uploaded with UTF-8 charset instead of ISO-8859-1 charset (thanks to [stockbal](https://github.com/stockbal)).

## 0.2.7 (2018-04-06)

### Fixes
- Fixed issues for `transport_use_user_match' option (thanks to [stockbal](https://github.com/stockbal)).

## 0.2.6 (2018-04-05)

### Fixes
- Fixed issues for `create_transport` option (thanks to [stockbal](https://github.com/stockbal)).

## 0.2.5 (2018-03-22)

### Fixes
- Increased the backoff reconnect time interval.

## 0.2.4 (2018-03-22)

### Features
- Reconnect if request was aborted due to a syscall error.

## 0.2.3 (2018-03-13)

### Fixes
- In case of using the parameter to use a locked transport, an error occurred if no response body was available when the check was done for a locked transport.

## 0.2.2 (2018-02-27)

### General
- NPM package dependencies updated.

### Features
- Options `options.ui5.transport_use_user_match` and `options.ui5.transport_use_locked` added for specific cases. These options allow to reuse an existing not released transport for a user or the usage of a not released transport by which the UI5 application BSP container is locked. Thanks to [@mxschmitt](https://github.com/mxschmitt) for adding these options.

## 0.2.1 (2018-01-23)

### Features
- Option `options.ui5.create_transport` and `options.ui5.transport_text` added to be able to create a new transport for each upload. Thanks to [@themasch](https://github.com/themasch) for adding that feature.

## 0.2.0 (2017-05-29)

### General
- Grunt dependency updated to 1.0.1, to avoid security vulnerabilities of 0.4.5.

## 0.1.19 (2017-02-10)

### General
- Adjustment of copyright information (year).
- Now also tested with NW ABAP 7.51.

## 0.1.18 (2016-12-14)

### Fixes
- Application index was recalculated independent of option setting.

## 0.1.17 (2016-12-12)

### Fixes
- Error forwarding in case CSRF Token determination fails.

## 0.1.16 (2016-11-18)

### General
- Switched from JSHint to ESLint linting.
- Support for Node versions < 4.0.0 skipped.
- Logging changed to an "immediate" logging. Folder/File actions are displayed immediately instead of collecting them. 
- Slashes at the end of a defined server URL are ignored.

## 0.1.15 (2016-10-25)

### General
- Code simplification regarding sap-language parameter.

## 0.1.14 (2016-10-21)

### Fixes
- BSP container length check excludes customer specific namespaces.
- Deletion requests are fired with sap-language parameter.

## 0.1.13 (2016-09-30)

### General
- Readme update.

## 0.1.12 (2016-09-28)

### General
- Update dependency to Unirest 0.5.1

### Fixes
- Client parameter handling

## 0.1.11 (2016-09-27)

### General
- Added Travis CI support.

## 0.1.10 (2016-08-04)

### Fixes
- Crash caused by empty files fixed.

## 0.1.9 (2016-08-01)

### Features
- Option `options.conn.client` added to be able to specify a SAP client (in case no default client is maintained in system).

## 0.1.8 (2016-07-25)

### Features
- Option `options.ui5.calc_appindex` steers if the SAPUI5 application index is recalculated (program /UI5/APP_INDEX_CALCULATE). Thanks to [@olirogers](https://github.com/olirogers) for adding this feature.

## 0.1.7 (2016-06-17)

### Fixes
- Ensure ES 5.1 compatibility.

## 0.1.6 (2016-06-13)

### Fixes
- Namespace handling for file comparison.

## 0.1.5 (2016-06-13)

### Features
- Option `options.conn.useStrictSSL` steers if a strict SSL mode check has to be executed. In case of self signed certificates it can be set to `false` to allow an upload of files.

### Fixes
- Correct encoding of namespaces for file upload.

## 0.1.4 (2016-06-08)

### Features
- Option `options.ui5.language` introduced to be able to specify objects original language (e.g. for BSP Container).

## 0.1.3 (2016-04-01)

### General
- Readme update.

## 0.1.2 (2016-03-30)

### General
- Minor issues.

## 0.1.1 (2016-03-25)

### General
- Readme update.

## 0.1.0 (2016-03-25)

### General
- Initial release.