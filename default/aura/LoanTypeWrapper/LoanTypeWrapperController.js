({
	doInit : function(component, event, helper) {
        helper.component = component;
        
        if(helper.getURLParameter('id')){
            var recordId = helper.getURLParameter('id');
            console.log('recordId :',recordId);
            helper.getCosumerType(recordId);
        }else{
            helper.getLoanType();
        }
        //helper.getLoanType();
    },
    
    showLoanSelection : function(component, event, helper) {
        var type = event.srcElement.id;
        component.set("v.selectedLoanType",type);
        console.log('selectedLoanType :',component.get("v.selectedLoanType"));
    },
    
    showSelectedLoanProgram : function(component, event, helper) {
        console.log('showSelectedLoanProgram');
        component.set("v.showLoanType",true);
        component.set("v.showSelectLoanType",false);
        
    },
})