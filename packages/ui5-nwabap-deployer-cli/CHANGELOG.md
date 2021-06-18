## 2.0.0 (2021-06-18)

### Features
- Usage of /UI5/ABAP_REPOSITORY_SRV service for deployment instead of Team Provider API. 
  </br>Team Provider API was set to deprecated. As a consequence starting from version 2.0.0 this deployer supports only systems with at least SAP_UI 753 component installed.
  </br>For all previous versions, version 1.x.x of this deployer needs to be used.

## 1.0.4 (2021-05-02)

### Fixes
- Exit process; use exitCode instead of hard process.exit call.

## 1.0.3 (2021-05-02)

### Fixes
- Exit process with status 1 in case of errors.

## 1.0.2 (2021-04-30)

### Features
- Support for bearer token authorization.

## 1.0.1 (2021-04-10)

### Fixes
- Correction of typos in demandCommand message.

## 1.0.0 (2021-04-10)

### General
- Initial release.