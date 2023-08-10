@isTest
public without sharing class CustomRelatedListControllerTest {
    @isTest
    static void testController() {
        Account account = new Account(
            Name='TestAccount',
            AccountNumber='Test1234'
        );
        insert account;
        Contact contact = new Contact(
            FirstName='Test',
            LastName='User',
            AccountId=account.Id
        );
        insert contact;

        ObjectInfo objectInfo = new ObjectInfo(
            'Contact',
            new List<String>(),
            'AccountId',
            'FirstName = \'Test\''
        );
        String childObjectInfo = JSON.serialize(objectInfo);
        
        // Test Null
        List<sObject> resultList = CustomRelatedListController.getRecords(childObjectInfo, account.Id);
        System.assertEquals(null, resultList);

        // Test Return Values
        objectInfo.fields = new List<String>{'FirstName', 'LastName'};
        childObjectInfo = JSON.serialize(objectInfo);
        resultList = CustomRelatedListController.getRecords(childObjectInfo, account.Id);
        System.assertNotEquals(0, resultList.size());

        // Test Delete
        resultList = CustomRelatedListController.deleteRecord(contact, childObjectInfo, account.Id);
        System.assertEquals(0, resultList.size());
        
    }

    public class ObjectInfo {
        public String apiName {get;set;}
        public List<String> fields {get;set;}
        public String fieldApiName {get;set;}
        public String filter {get;set;}

        public ObjectInfo(String apiName, List<String> fields, String fieldApiName, String filter) {
            this.apiName = apiName;
            this.fields = fields;
            this.fieldApiName = fieldApiName;
            this.filter = filter;
        }
    }
}