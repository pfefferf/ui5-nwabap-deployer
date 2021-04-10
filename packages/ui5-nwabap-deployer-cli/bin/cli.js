#! /usr/bin/env node
const scriptName = "ui5-deployer";
const yargs = require("yargs");
const deployCommand = require("../lib/commands/deploy");

yargs.usage("\nUI5 Deployer to deploy UI5 sources to a SAP ABAP system.")
    .scriptName(scriptName)
    .command(deployCommand)
    .demandCommand(1, "Command required. Please hava look at the help documentation above.")
    .strictCommands(true)
    .strictOptions(true)
    .help(true)
    .locale("en")
    .argv;
