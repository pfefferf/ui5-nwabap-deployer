# ui5-nwabap-deployer
UI5 Deployer to SAP NetWeaver ABAP application server

This monorepo manages following packages which are used for deploying UI5 sources to a SAP NetWeaver ABAP application server.
- [grunt-nwabap-ui5uploader](./packages/grunt-nwabap-ui5uploader/README.md): Grunt task to deploy UI5 sources.
- [ui5-task-nwabap-deployer](./packages/ui5-task-nwabap-deployer/README.md): UI5 Tooling custom task to deploy UI5 sources.

Both tools use as base the [ui5-nwabap-deployer-core](./packages/ui5-nwabap-deployer-core/README.md) package which provides the core functionality for the UI5 source deployment.