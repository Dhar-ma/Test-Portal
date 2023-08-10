({
    doInit: function(component, event, helper) {
        helper.component = component;
        helper.getWorkTypesMap();
    },
    
    showWorkTypeGroupSelection: function(component, event, helper) {
        
        component.set("v.showWorkTypes",false);
        component.set("v.showWorkTypeGroups",true);
        var type = event.srcElement.value;
                
        console.log(' Work type : ',type);
        var workTypeGroupMap = component.get("v.workTypeWorkGroupMap");
        
        console.log('workGoups : ',workTypeGroupMap[type]);
        component.set("v.workGoups",workTypeGroupMap[type]);
        component.set("v.selectedGroupType",type);
        console.log('selectedGroupType :',component.get("v.selectedGroupType"));
    },
    
    showGroupSelection: function(component, event, helper) {
        
        component.set("v.selectedAdditionalInfo",'');
        component.set("v.additionalInfoList",[]);
        var workGroups = component.get("v.workGoups");
        var type = event.srcElement.id;
        component.set("v.selectedWorkTypeGroup",type);
        console.log('selectedWorkTypeGroup :',component.get("v.selectedWorkTypeGroup"));
        var title = event.srcElement.value;
        component.set("v.appointmentTopic",title);
        console.log('appointmentTopic :',component.get("v.appointmentTopic"));
        var addInfoList;
        for(var group in workGroups){
            if(workGroups[group].Id == type){
                if(workGroups[group].AdditionalInformation){
                    addInfoList = workGroups[group].AdditionalInformation.split(';');
                }
            }
        }
        var inforList = [];
        if(addInfoList){
            for(var key in addInfoList){
                inforList.push({"value": addInfoList[key], "label": addInfoList[key]});
            }
            component.set("v.additionalInfoList",inforList);
            console.log('additionalInfoList :',component.get("v.additionalInfoList"));
        }
        
    },
    
    handleChange: function (component, event) {
        var info = event.getParam('value')
        var inforString = info.toString();
        component.set("v.selectedAdditionalInfo",inforString);
        console.log('selectedAdditionalInfo :',component.get("v.selectedAdditionalInfo"));
    },
    
    showWorkTypesSection: function (component, event) {
        component.set("v.showWorkTypes",true);
        component.set("v.showWorkTypeGroups",false);
    },
})