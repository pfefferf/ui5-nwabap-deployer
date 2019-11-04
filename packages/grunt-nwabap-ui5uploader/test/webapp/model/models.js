sap.ui.define([
	"sap/ui/model/resource/ResourceModel"
], function(ResourceModel) {
	"use strict";

	return {
		createResourceModel: function(sBundleName) {
			var oResourceModel = new ResourceModel({
				"bundleName": sBundleName
			});
			return oResourceModel;
		}

	};

});