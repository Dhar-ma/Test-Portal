/**
*@Class Name : ServiceAppointmentDetailControllerTest
*@Purpose    : Test functionality of ServiceAppointmentDetailController apex class.
*/
@isTest
public class ServiceAppointmentDetailControllerTest {
    
    /**
    * @MethodName   : setupTestData
    * @Purpose      : Method to Crate test data
    */
    @testSetup
    static void setupTestData(){
        Account account = CreateAccount();
        System.assertNotEquals(null, account);
        
        Contact contact = CreateContact(account.Id);
        System.assertNotEquals(null, contact);
        
        User userRec = CerateUserRecord(contact.Id);
        System.assertNotEquals(null, userRec);
        
        WorkTypeGroup groupType = CreateWorkTypeGroup();
        System.assertNotEquals(null, groupType);
        
        ServiceResource resource = CreateServiceResource();
        System.assertNotEquals(null, resource);
        
        ZoomAppCredentials__c zoomCredentials = CreateCustomSettingRecord();
        System.assertNotEquals(null, zoomCredentials); 
        
       	ServiceAppointment serviceAppt = createServiceAppointmentRecords(contact.Id,resource.Id,groupType.Id,account.Id);
        System.assertNotEquals(null, serviceAppt);
    }
    
    /**
    * @MethodName   : UpdateServiceAppointmentPositiveTest
    * @Purpose      : Test method to test functionality of UpdateServiceAppointment() of ServiceAppointmentDetailController
    */
    @isTest
    public static void UpdateServiceAppointmentPositiveTest(){
        ServiceAppointment serviceAppt = [SELECT Id FROM ServiceAppointment LIMIT 1];
        ActionResult result = ServiceAppointmentDetailController.UpdateServiceAppointment(serviceAppt.Id);
        System.assertNotEquals(null, result);
    }
    
    /**
    * @MethodName   : UpdateServiceAppointmentNegativeTest
    * @Purpose      : Test method to test functionality of UpdateServiceAppointment() of ServiceAppointmentDetailController
    */
    @isTest
    public static void UpdateServiceAppointmentNegativeTest(){
        ActionResult result2 = ServiceAppointmentDetailController.UpdateServiceAppointment(null);
        System.assertNotEquals(null, result2);
    }
    
	//Function to create ServiceAppointment records for test class  
    public static ServiceAppointment createServiceAppointmentRecords(Id contactId,Id resourceId, Id groupTypeId,Id accountId){
        
        
        ServiceAppointment appointment = new ServiceAppointment();
        appointment.ContactId = contactId;
        appointment.DurationType = 'Hours';
        appointment.Subject = 'Insurance';
        appointment.Street = 'Street';
        appointment.City = 'City';
        appointment.State = 'State';
        appointment.PostalCode = '12345';
        appointment.Country = 'Country';
        appointment.ParentRecordId = accountId;
        appointment.Description = 'Appointment Description Test';
        appointment.Work_Type_Group__c = groupTypeId;
        appointment.Service_Resource__c = resourceId;
        appointment.SchedStartTime = DateTime.now().addDays(2);
        appointment.SchedEndTime = appointment.SchedStartTime.addHours(1);
        
        insert appointment;
        return appointment;
    }
    
    //Function to create Account record for test class  
    public static Account CreateAccount(){
        Account account = new Account();
        account.Name = 'TestAccount';
        insert account;
        return account;
    }
    
    //Function to create Contact record for test class
    public static Contact CreateContact(Id accountId){
        Contact contact = new Contact();
        contact.LastName = 'TestLastName';
        contact.FirstName = 'FirstName';
        contact.MobilePhone = '9876543218';
        contact.Phone = '6548723';
        contact.Email = 'emstest@gmail.com';
        contact.Social_Security_Number__c = 123456;
        contact.AccountId = accountId;
        insert contact;
        return contact;
    }
    
    //Function to create User record for test class
    public static User CerateUserRecord(Id contactId){
        
        Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User Custom'].Id;
        
        User userObj = new User(
            LastName = 'LastName',
            Email =  ProfileId+'@gmail.com',
            Username = ProfileId+'ems'+'@gmail.com',
            CompanyName = 'EMS',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ContactId = contactId
        );
        return userObj;
    }
    
    //Function to create WorkTypeGroup record for test class  
    public static WorkTypeGroup CreateWorkTypeGroup(){
        
        WorkTypeGroup groupType = new WorkTypeGroup();
        
        groupType.Name = 'Get a Quote';
        groupType.Description = 'Test Description';
        groupType.Group_Type__c = 'Insurance';
        groupType.IsActive = True;
        groupType.AdditionalInformation = 'Life Insurance';
        insert groupType;
        return groupType;
    }
    
    //Function to create ServiceResource record for test class  
    public static ServiceResource CreateServiceResource(){
        
        Id ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id;
        
        User userObj = new User(
            LastName = 'LastName',
            Email =  'test@gmail.com',
            Username = 'emstest@gmail.com',
            CompanyName = 'EMS',
            Alias = 'ResUser',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId  = ProfileId
        );
        insert userObj;
        
        ServiceResource resource = new ServiceResource();
        resource.Name = 'Test Resource';
        resource.IsActive = true;
        resource.Description = 'Description';
        resource.RelatedRecordId = userObj.Id;
        resource.ResourceType = 'T';
        insert resource;
        return resource;
    }
    
    //Function to create Custom Setting record for test class  
    public static ZoomAppCredentials__c CreateCustomSettingRecord(){
        ZoomAppCredentials__c zoomCred = new ZoomAppCredentials__c();
        zoomCred.API_Key__c = 'sDDep6URSQGT9m44UPwrCg';
        zoomCred.API_Secret__c = '2cT2mxsLXeM4MMlJxUdfQMMFi6zgLYeiT4fm';
        insert zoomCred;
        return zoomCred;
    }
}