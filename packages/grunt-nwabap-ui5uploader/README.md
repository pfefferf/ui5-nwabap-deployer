[![npm version](https://badge.fury.io/js/grunt-nwabap-ui5uploader.svg)](https://badge.fury.io/js/grunt-nwabap-ui5uploader)

# grunt-nwabap-ui5uploader

'grunt-nwabap-ui5uploader' is a Grunt plugin which allows a developer to upload SAPUI5/OpenUI5 sources into a SAP NetWeaver ABAP system as part of the Grunt task chain. The behavior is (or should be) the same than it is known from the SAP Web IDE app deployment option "Deploy to SAPUI5 ABAP Repository" or from the "SAPUI5 ABAP Repository Team Provider" available for Eclipse via the "UI Development Toolkit for HTML5".
The plugin allows a developer to deploy the sources to a SAP NetWeaver ABAP system by a Grunt task using a different IDE than Eclipse or SAP Web IDE (for instance WebStorm). The main benefit is to integrate the deployment process into a Continuous Integration environment, in which for instance a Jenkins server executes several build steps and finally deploys the sources to a SAP NetWeaver ABAP system if all previous build steps are ok.  

Some further information can be found in the [SAP Community](https://blogs.sap.com/2016/03/25/grunt-plugin-to-upload-ui5-sources-to-netweaver-abap/).


## Getting Started

## Installation and Pre-Conditions

### Grunt
This plugin requires Grunt `1.0.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you are familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-nwabap-ui5uploader --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-nwabap-ui5uploader');
```


### ABAP Development Tool Services
The ABAP Development Tool Services have to be activated on the SAP NetWeaver ABAP System (transaction SICF, path /sap/bc/adt).
The user used for uploading the sources needs to have the authorization to use the ADT Services and to create/modify BSP applications.
The plugin is tested with NW 7.40 and NW 7.5x systems.

## Task "nwabap_ui5uploader"

### Overview
In your project's Gruntfile, add a section named `nwabap_ui5uploader` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  nwabap_ui5uploader: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  }
});
```

### Options

#### options.conn.server
Type: `String`

Defines SAP NetWeaver ABAP server (for instance 'http://myserver:8000').

#### options.conn.client
Type: `String`

Optional parameter to specify the client (transferred as sap-client URL parameter). In case the option is not specified the default client is used if specified.

#### options.conn.useStrictSSL
Type: `Boolean`
Default: `true`

SSL mode handling. In case of self signed certificates the useStrictSSL mode option can be set to `false` to allow an upload of files.

#### options.conn.proxy
Type: `String`

Optional parameter to specify proxy used for communication with SAP NetWeaver ABAP server (for instance 'http://myproxyhost:3128').

#### options.conn.customQueryParams
Type: `Object`

Optional parameter with key/value pairs of custom parameters which are added to the call to the SAP NetWeaver ABAP server. For instance:
```js
customQueryParams: {
  myCustomParameter1: 'myCustomValue1',
  myCustomParameter2: 'myCustomValue2'
}
```

#### options.auth.user
Type: `String`

Defines the user which is used for access to the SAP NetWeaver ABAP server. It is not recommended to store the user in the Grunt file. It should be passed as argument.

#### options.auth.pwd
Type: `String`

Defines the users password for access to the SAP NetWeaver ABAP server. It is not recommended to store the password in the Grunt file. It should be passed as argument. Do also not store the password as not masked value in a CI server environment. Use plugins to create masked variables (for instance the 'Mask Passwords Plugin' for Jenkins).

#### options.ui5.language
Type: `String`
Default: `EN`

Defines the objects original language.

#### options.ui5.package
Type: `String`

Defines the development package in which the BSP container for the UI5 sources is available or should be created.

#### options.ui5.bspcontainer
Type: `String`

Defines the name of the BSP container used for the storage of the UI5 sources. Length is restricted to 15 characters (exclusive customer specific namespaces, e.g. /YYY/).

#### options.ui5.bspcontainer_text
Type: `String`

Defines the description of the BSP container.

#### options.ui5.transportno
Type: `String`
Optional in case options.ui5.package is set to '$TMP'.

Defines the transport number which logs the changes. For the transport number it would also make sense to pass it via an argument.

#### options.ui5.calc_appindex
Type: `Boolean`
Default: `false`

Specify if you require the application index (program /UI5/APP_INDEX_CALCULATE) for the application to be recalculated after the BSP application is uploaded.
Note: This only works with team repository provider version 1.30.x or higher and User Interface Add-On 2.0 for SAP NetWeaver.

#### options.ui5.create_transport
Type: `Boolean`
Default: `false`

Set this option to true in case a new transport should be created each time the application is uploaded.

#### options.ui5.transport_text
Type: `String`

Optional in case options.ui5.create_transport is set to false.

Text for the new transport to be created.

#### options.ui5.transport_use_user_match
Type: `Boolean`
Default: `false`

Optional, if set to true, it will be tried to find a transport request of the given user. If no transport is found and `create_transport` is enabled a new one will be created and used for further file uploads.

#### options.ui5.transport_use_locked
Type: `Boolean`
Default: `false`

Optional, if set to true and a file upload failed due the BSP application is locked in another transport, the old (original one) one will be used to upload the files.

#### options.resources.cwd
Type: `String`

Defines the base folder which contains the sources (for instance 'build'). It should be avoided to use everything from the ``webapp`` folder, because some directories in it should not be packaged and uploaded into a BSP application. To create a build, use another grunt task to copy the relevant files to the ``build`` folder. In addition for instance you can use the [openui5_preload](https://github.com/SAP/grunt-openui5#openui5_preload) task from the ``grunt-openui5`` plugin to create a component preload file.

#### options.resources.src
Type: `String` or `array of String` 

Defines files for upload.

### Usage Examples

#### Upload to '$TMP' package

```js
var sUser = grunt.option('user');
var sPwd = grunt.option('pwd');

grunt.initConfig({
  nwabap_ui5uploader: {
    options: {
      conn: {
        server: 'http://myserver:8000',
      },
      auth: {
        user: sUser,
        pwd: sPwd
      }
    },
    upload_build: {
      options: {
        ui5: {
           package: '$TMP',
           bspcontainer: 'ZZ_UI5_LOCAL',
           bspcontainer_text: 'UI5 upload local objects'
        },
        resources: {
          cwd: 'build-folder',
          src: '**/*.*'
        }
      }
    }
  }
});
```

#### Upload to a transport tracked package

```js
var sUser = grunt.option('user');
var sPwd = grunt.option('pwd');

grunt.initConfig({
  nwabap_ui5uploader: {
    options: {
      conn: {
        server: 'http://myserver:8000',
      },
      auth: {
        user: sUser,
        pwd: sPwd
      }
    },
    upload_build: {
      options: {
        ui5: {
           package: 'ZZ_UI5_REPO',
           bspcontainer: 'ZZ_UI5_TRACKED',
           bspcontainer_text: 'UI5 upload',
           transportno: 'DEVK900000'
        },
        resources: {
          cwd: 'build-folder',
          src: '**/*.*'
        }
      }
    }
  }
});
```

#### Upload to a transport tracked package, creating a new transport for each upload

```js
var sUser = grunt.option('user');
var sPwd = grunt.option('pwd');

grunt.initConfig({
  nwabap_ui5uploader: {
    options: {
      conn: {
        server: 'http://myserver:8000',
      },
      auth: {
        user: sUser,
        pwd: sPwd
      }
    },
    upload_build: {
      options: {
        ui5: {
           package: 'ZZ_UI5_REPO',
           bspcontainer: 'ZZ_UI5_TRACKED',
           bspcontainer_text: 'UI5 upload',
           create_transport: true,
           transport_text: 'Transport for ZZ_UI5_TRACKED container'
        },
        resources: {
          cwd: 'build-folder',
          src: '**/*.*'
        }
      }
    }
  }
});
```

#### Upload to different servers

```js
var sUser = grunt.option('user');
var sPwd = grunt.option('pwd');

grunt.initConfig({
  nwabap_ui5uploader: {
    upload_build_740: {
      options: {
        conn: {
          server: 'http://myserver740:8000',
        },
        auth: {
          user: sUser,
          pwd: sPwd
        },      
        ui5: {
           package: 'ZZ_UI5_REPO',
           bspcontainer: 'ZZ_UI5_TRACKED',
           bspcontainer_text: 'UI5 upload',
           transportno: 'DEVK900000'
        },
        resources: {
          cwd: 'build-folder',
          src: '**/*.*'
        }
      }
    },
    upload_build_750: {
      options: {
        conn: {
          server: 'http://myserver750:8000',
        },
        auth: {
          user: sUser,
          pwd: sPwd
        },      
        ui5: {
           package: 'ZZ_UI5_REPO',
           bspcontainer: 'ZZ_UI5_TRACKED',
           bspcontainer_text: 'UI5 upload',
           transportno: 'DEVK900000'
        },
        resources: {
          cwd: 'build-folder',
          src: '**/*.*'
        }
      }
    }    
  }
});
```

#### Create and reuse a transport request

```js
var sUser = grunt.option('user');
var sPwd = grunt.option('pwd');

grunt.initConfig({
  nwabap_ui5uploader: {
    options: {
      conn: {
        server: 'http://myserver:8000',
      },
      auth: {
        user: sUser,
        pwd: sPwd
      }
    },
    upload_build: {
      options: {
        ui5: {
           package: 'ZZ_UI5_REPO',
           bspcontainer: 'ZZ_UI5_TRACKED',
           bspcontainer_text: 'UI5 upload',
           create_transport: true,
           transport_use_user_match: true,
           transport_text: 'Transport for ZZ_UI5_TRACKED container'
        },
        resources: {
          cwd: 'build-folder',
          src: '**/*.*'
        }
      }
    }
  }
});
```

## Release History

[CHANGELOG.md](https://github.com/pfefferf/ui5-nwabap-deployer/blob/master/packages/grunt-nwabap-ui5uploader/CHANGELOG.md)

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)
