## 2.1.1 (2023-02-15)

### Fixes
- Support UI5 Tooling 3.0 in respect to reduce build time by defining that no dependencies are required.

## 2.1.0 (2021-07-21)

### Features
- New option `testMode` for deployment execution in test mode.

## 2.0.0 (2021-06-18)

### Features
- Usage of /UI5/ABAP_REPOSITORY_SRV service for deployment instead of Team Provider API. 
  </br>Team Provider API was set to deprecated. As a consequence starting from version 2.0.0 this deployer supports only systems with at least SAP_UI 753 component installed.
  </br>For all previous versions, version 1.x.x of this deployer needs to be used.

## 1.0.15 (2020-09-25)

### Feature
- Support of `connection.customQueryParams` configuration option to be able to transfer custom parameters to the backend (for instance to bypass SAML2 or SPNEGO authentication).

## 1.0.14 (2020-09-04)

### Fixes
- Fixed issue of undefined properties in case no complete connection configuration is provided.

## 1.0.13 (2020-08-31)

### Features
- New environment variable `UI5_TASK_NWABAP_DEPLOYER__CLIENT` to support setting of SAP client via environment.

## 1.0.12 (2020-04-29)

### Fixes
- Throw error in case connection configuration details are missing (instead of just writing a log entry).

## 1.0.11 (2020-04-27)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.6 + setting for automatic update of ui5-nwabap-deployer-core package.

## 1.0.10 (2020-04-15)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.5.
- Update dependency to new UI5 Tooling 2.0 release.

## 1.0.9 (2020-03-17)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.4.

## 1.0.8 (2020-03-11)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.3.

## 1.0.7 (2020-03-06)

### Fixes
- In case of errors, UI5 tooling build infrastructure logic was not correctly informed. Thanks to [@vobu](https://twitter.com/vobu) for the fix.

## 1.0.6 (2020-01-24)

### General
- Update dependency for ui5-nwabap-deployer-core package to v1.0.2.

## 1.0.5 (2019-12-20)

### General
- Optimization to use files provided by UI5 Tooling workspace. Before that change, files were read again from file system. Due to that change option `resources.path` is not used anymore.

### Features
- Support of `.env` file to define environment variables for local development purposes; applied by the [dotenv](https://www.npmjs.com/package/dotenv) module. 

## 1.0.4 (2019-12-02)

### Fixes
- In case that all UI5 Tooling tasks were excluded (via the --exclude-task option) and just the deployer task was executed, an error occurred, because of the missing resources.

## 1.0.3 (2019-11-28)

### Features
- `configuration.resources.path` is optional; if not set `dist` is used by default.
- New supported environment variable `UI5_TASK_NWABAP_DEPLOYER__TRANSPORTNO` to be able to set transport number in a dynamic way in the pipeline. Avoids hard coded transport numbers in ui5.yaml configuration files which need to updated again and again.

## 1.0.2 (2019-11-28)

### Fixes
- Ensure that files are available in resources path when deployment is started.

## 1.0.1 (2019-11-26)

### Fixes
- Missing ui5.yaml file in published NPM package. 

## 1.0.0 (2019-11-16)

### General
- Initial release.