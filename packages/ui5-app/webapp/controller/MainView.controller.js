sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("de.fpf.test.controller.MainView", {
		onPress: function(){
			MessageToast.show('Button pressed', {duration: 2000});
		}
	});

});