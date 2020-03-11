## 1.0.8 (2020-03-20)

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