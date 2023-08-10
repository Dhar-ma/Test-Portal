public without sharing class CustomRelatedListController {
    @AuraEnabled
    public static List<sObject> getRecords(String childObjectInfo, Id parentRecordId) {
        List<sObject> sObjectList;
        ObjectInfo objectInfo = (ObjectInfo) JSON.deserialize(childObjectInfo, CustomRelatedListController.ObjectInfo.class);
        String query = buildQuery(objectInfo, parentRecordId);
        if(query != null) {
            sObjectList = Database.query(query);
        }
       
        return sObjectList;
    }

    @AuraEnabled
    public static List<sObject> deleteRecord(sObject record, String childObjectInfo, Id parentRecordId){
        delete record;
        return getRecords(childObjectInfo, parentRecordId);
    }

    @AuraEnabled(cacheable=true)
    public static ListViewData getListViewData(){
        ListViewData listViewData = new ListViewData();
        User user = [SELECT Id, ContactId, ProfileId FROM User WHERE Id =: UserInfo.getUserId()];
        Profile profile = [SELECT Id, Name FROM Profile WHERE Id =: user.ProfileId];
        if(profile.Name == 'System Administrator') {
            listViewData.contactId = System.Label.Community_System_Administrator_Contact_Id;
        }
        else {
            listViewData.contactId = user.ContactId;
        }
        Id networkId = Network.getNetworkId();
        if(networkId != null) {
            Network network = [SELECT Id, UrlPathPrefix FROM Network WHERE Id =: networkId];
            listViewData.urlPrefix = network.UrlPathPrefix;
        }
        return listViewData;
    }

    private static String buildQuery(ObjectInfo objectInfo, Id parentRecordId) {
        if(objectInfo.fields.size() > 0) {
            String query = 'SELECT ' + objectInfo.nameField + ', ';
            // if(objectInfo.apiName == 'Case' || objectInfo.apiName == 'ServiceAppointment') {
            //     query = 'SELECT ';
            // }
            // else {
            //     query = 'SELECT Name, ' ;
            // }
            query += String.join(objectInfo.fields, ', ');
            query += ' FROM ' + objectInfo.apiName;
            query += ' WHERE ' + objectInfo.fieldApiName  + ' = \'' + parentRecordId + '\'';
            if(objectInfo.filter != null) {
                query += ' AND (' + objectInfo.filter + ')';
            }
            return query;
        }
        return null;
    }

    public class ObjectInfo {
        public String apiName;
        public List<String> fields;
        public String fieldApiName;
        public String filter;
        public String nameField;
    }

    public class ListViewData {
        @AuraEnabled
        public Id contactId {get;set;}
        @AuraEnabled
        public String urlPrefix {get;set;}

        public ListViewData() {}
    }
}