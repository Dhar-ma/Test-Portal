({
	doInit : function(component, event, helper) {
        
        helper.component = component;
        
		component.set("v.NewAsset",{});
        component.set("v.Assets",{});
        var loanApplicationId = component.get("v.ResidentialLoanApplication").Id;
        if(loanApplicationId){
            helper.getAssetList(loanApplicationId);
        }
        //helper.getPicklistValues('Asset');
	},
    
    showAssetsForm: function(component, event, helper) {
        //helper.getLoanApplicantMap();
        var actionName = event.getSource().get("v.title");
        console.log('showAssetsForm actionName: ',actionName);
        component.set("v.NewAsset", {});
        
        //component.set("v.showAssetsForm", true);
        if(actionName == 'ScheduleAForm'){
            component.set("v.showScheduleAForm", true);
        }
        if(actionName == 'ScheduleBForm'){
            component.set("v.showScheduleBForm", true);
        }
        if(actionName == 'ScheduleCForm'){
            component.set("v.showScheduleCForm", true);
        }
        if(actionName == 'ScheduleDForm'){
            component.set("v.showScheduleDForm", true);
        }
        if(actionName == 'ScheduleFForm'){
            component.set("v.showScheduleFForm", true);
        }
       
    },
    
    hideAssetsForm: function(component, event, helper) {
		/*var actionName = event.getSource().get("v.title");
        console.log('hideAssetsForm actionName: ',actionName);
        //component.set("v.showAssetsForm", false);*/
        
        component.set("v.showScheduleAForm", false);
        component.set("v.showScheduleBForm", false);
        component.set("v.showScheduleCForm", false);
        component.set("v.showScheduleDForm", false);
        component.set("v.showScheduleFForm", false);
    },
    
    editAssetForm : function(component, event, helper){
        var selectedItem = event.currentTarget.dataset.row;
        var actionName = event.currentTarget.title;
        console.log('actionName : ',actionName);
        
        if(actionName == 'ScheduleAForm'){
            var Assets = component.get("v.ScheduleAAssets");
            component.set("v.NewAsset", Assets[selectedItem]);
            component.set("v.showScheduleAForm", true);
        }
        if(actionName == 'ScheduleBForm'){
            var Assets = component.get("v.ScheduleBAssets");
            component.set("v.NewAsset", Assets[selectedItem]);
            component.set("v.showScheduleBForm", true);
        }
        if(actionName == 'ScheduleCForm'){
            var Assets = component.get("v.ScheduleCAssets");
            component.set("v.NewAsset", Assets[selectedItem]);
            component.set("v.showScheduleCForm", true);
        }
        if(actionName == 'ScheduleDForm'){
            var Assets = component.get("v.ScheduleDAssets");
            component.set("v.NewAsset", Assets[selectedItem]);
            component.set("v.showScheduleDForm", true);
        }
        if(actionName == 'ScheduleFForm'){
            var Assets = component.get("v.ScheduleFAssets");
            component.set("v.NewAsset", Assets[selectedItem]);
            component.set("v.showScheduleFForm", true);
        }
    },
    
    saveAssetForm: function(component, event, helper) {
        var assetForm = component.get("v.NewAsset");
        console.log('AssetForm',JSON.stringify(assetForm));
        
        var actionName = event.getSource().get("v.title");
        console.log('actionName : ',actionName);
        
        var valid = helper.validateForm(actionName);
        console.log('isValid : ',valid);
        
        var loanApplicationId = component.get("v.ResidentialLoanApplication").Id;
        if(loanApplicationId){
            if(valid){
                console.log('valid loan application : ');
                helper.saveAssetForm("7",actionName);  
            }else{
                helper.showErrorToast('Please enter all required fields');
            }
        }else{
            console.log('else : ');
            helper.showErrorToast('Please complete previous steps');
        }
    },
})