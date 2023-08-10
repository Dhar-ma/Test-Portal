({
	initiateFlow : function(component) {
        console.log('initiateFlow');
        var inputVariables = [
            {
                name : 'workGroupType',
                type : 'String',
                value : '0VS5w000000YqFMGA0'
            }
        ];
        component.set("v.isFlowOpen",true);
        var flow = component.find("flowData");
        flow.startFlow("Guest_Branch_Selection",inputVariables);
    }
})