# ui5-nwabap-deployer
UI5 Deployer to SAP NetWeaver ABAP application server

This monorepo manages following packages which are used for deploying UI5 sources to a SAP NetWeaver ABAP application server.
- [grunt-nwabap-ui5uploader](./packages/grunt-nwabap-ui5uploader/README.md): Grunt task to deploy UI5 sources.
- [ui5-task-nwabap-deployer](./packages/ui5-task-nwabap-deployer/README.md): UI5 Tooling custom task to deploy UI5 sources.
- [ui5-nwabap-deployer-cli](./packages/ui5-nwabap-deployer-cli/README.md): CLI to deploy UI5 sources.

All tools use as base the [ui5-nwabap-deployer-core](./packages/ui5-nwabap-deployer-core/README.md) package which provides the core functionality for the UI5 source deployment.

Starting from version 2.0.0 the deployer functionalities use the OData Service [/UI5/ABAP_RESPOSITORY_SRV](https://ui5.sap.com/#/topic/a883327a82ef4cc792f3c1e7b7a48de8) for deploying UI5 sources. Please make sure that the service is activated on your system (for details you can check SAP note [2999557](https://launchpad.support.sap.com/#/notes/2999557)). The new service does some sanity checks like e.g. virus scans. If you have not configured virus scan profiles or want to disable virus scanning please have a look to SAP note [2437892](https://launchpad.support.sap.com/#/notes/2437892).
</br>Current deployer versions starting from version 2.0.0 can be used with SAP systems on which component SAP_UI 753 is installed. On systems with a lower version of component SAP_UI, you have to use version 1.x.x of this deployer.