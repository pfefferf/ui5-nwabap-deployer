## 1.0.10 (2020-09-25)

### Feature
- Support of `connection.customQueryParams` configuration option to be able to transfer custom parameters to the backend (for instance to bypass SAML2 or SPNEGO authentication).

## 1.0.9 (2020-09-17)

### Fixes
- Set ADT Client request body length to maximum; avoids errors that request body is longer than defined max. value.

## 1.0.8 (2020-09-04)

### Fixes
- Fixed access to undefined response object in case no connection to backend can be established.

## 1.0.7 (2020-05-15)

### Fixes
- Client option was not considered.

## 1.0.6 (2020-04-27)

### Fixes
- Proxy option was not considered correctly.

## 1.0.5 (2020-04-15)

### Fixes
- Local package detection considers all packages starting with a `$` sign, instead of just the `$TMP` package.

## 1.0.4 (2020-03-17)

### General
- Replaced deprecated `request` module.
- Updated to `async` version 3.

## 1.0.3 (2020-03-11)

### Fixes
- In case the `ui5.transport_use_user_match` option was used, but no transport exists, the option `ui5.create_transport` was ignored.

## 1.0.2 (2020-01-24)

### Fixes
- Upload of files with special characters (e.g. ~) in name was confirmed, but the upload failed, because some special characters are not allowed for file names.

## 1.0.1 (2019-12-20)

### General
- Enhanced interface to accept file contents.

## 1.0.0 (2019-11-16)

### General
- Initial release.