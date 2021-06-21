#! /usr/bin/env node
const scriptName = "ui5-deployer";
const yargs = require("yargs");
const deployCommand = require("../lib/commands/deploy");
const undeployCommand = require("../lib/commands/undeploy");

yargs.usage("\nUI5 Deployer to deploy UI5 sources to a SAP ABAP system.")
    .scriptName(scriptName)
    .command(deployCommand)
    .command(undeployCommand)
    .demandCommand(1, "Command required. Please have a look at the help documentation above.")
    .strictCommands(true)
    .strictOptions(true)
    .help(true)
    .locale("en")
    .argv;
