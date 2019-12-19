## 1.0.5 (2019-12-20)

### General
- Optimization to use files provided by UI5 Tooling workspace. Before that change, files were read again from file system. Due to that change option `resources.path` is not used anymore.

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