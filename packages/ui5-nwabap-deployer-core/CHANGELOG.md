## 1.0.17 (20201-04-13)

### Fixes
- Removed mandatory check on client, because if no client is provided in configuration the default client will be used.

## 1.0.16 (2021-04-10)

### Fixes
- Additional check that server and client information is provided.

## 1.0.15 (2021-04-07)

### Fixes
- `useStrictSSL` option was not considered correctly.

## 1.0.14 (2021-03-24)

### Fixes
- Do not create an additional unused transport when a transport creation is required, but the usage of an existing transport is required too (and a transport with a lock on the BSP application exists).

## 1.0.13 (2021-03-19)

### Fixes
- Correct Content-Type header setting for creation of a transport request on ABAP system >= 7.5 (thanks to [ffleige](https://github.com/ffleige)). 

## 1.0.12 (2021-03-18)

### Fixes
- Removed logging of `retry-axios` error object due to possible circular dependencies.

## 1.0.11 (2021-01-25)

### Fixes
- Option to use a transport in which the object is already locked did not work in case a BSP container was created and then removed, but the transport lock entry still exists.

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