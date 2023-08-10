public class WorkGroupTypeSelection {
    
	@AuraEnabled
    public static ActionResult getWorkGroupTypeMap(){
        
        Map<String,List<WorkTypeGroup>> workTypeGroupMap = new Map<String,List<WorkTypeGroup>>();
        try{
            List<WorkTypeGroup> workTypeGroupList = [SELECT Id, Name, AdditionalInformation , Group_Type__c 
                                                     FROM WorkTypeGroup];
            
            for(WorkTypeGroup workGroup : workTypeGroupList){
                if(!workTypeGroupMap.containsKey(workGroup.Group_Type__c) && workGroup.Group_Type__c != NULL){
                    workTypeGroupMap.put(workGroup.Group_Type__c, new List<WorkTypeGroup>());
                    workTypeGroupMap.get(workGroup.Group_Type__c).add(workGroup);
                }else if(workGroup.Group_Type__c != NULL){
                    workTypeGroupMap.get(workGroup.Group_Type__c).add(workGroup);
                }
            }            
            return new ActionResult(new map<string, object>{'workTypeGroupMap'=>workTypeGroupMap,
                'appointmentTypes'=>getCaseTypeMetadataRecords(),
                'isMortgageCommunity' => getEnableCommunityRecords()});
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
    
    @AuraEnabled
    public static ActionResult getAppointmentTypes(){
        try{
            
            return new ActionResult(new map<string, object>{
                'appointmentTypes'=>getPicklistValues('ServiceAppointment', 'AppointmentType')
            });
                    
        }catch(Exception exec){
            System.debug('getAssetPicklistValues Exception'+exec);
            return new ActionResult(exec);
        }
    }
    
    public static List<String> getCaseTypeMetadataRecords(){
        
        Mortgage_Case_Type_List__mdt[] Group_Type_List = [SELECT MasterLabel, QualifiedApiName, Case_Type__c 
                                                     FROM Mortgage_Case_Type_List__mdt];
        
        List<String> GroupTypeList = new List<String>();
        
        for(Mortgage_Case_Type_List__mdt record:Group_Type_List) {
            GroupTypeList.add(record.Case_Type__c);
        }
        
        return GroupTypeList;
    }
    
    public static Boolean getEnableCommunityRecords(){
        
        Enable_Mortgage_Community__mdt[] Community_List = [SELECT MasterLabel, QualifiedApiName, Enable_Mortgage_Community__c 
                                                            FROM Enable_Mortgage_Community__mdt];
        if(!Community_List.isEmpty()){
            return Community_List[0].Enable_Mortgage_Community__c;
        }
        return false;
    }
    
    public static List<String> getPicklistValues(String ObjectApi_name,String Field_name){ 
        
        List<String> lstPickvals=new List<String>();
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(ObjectApi_name);
        Sobject Object_name = targetType.newSObject();
        Schema.sObjectType sobject_type = Object_name.getSObjectType(); 
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); 
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap(); 
        List<Schema.PicklistEntry> pick_list_values = field_map.get(Field_name).getDescribe().getPickListValues(); 
        for (Schema.PicklistEntry a : pick_list_values) { 
            lstPickvals.add(a.getValue());
        }        
        return lstPickvals;
    }
}