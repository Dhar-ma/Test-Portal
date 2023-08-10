public class UserRegistrationFormController {

    @AuraEnabled
    public static ResponseWrapper checkMember( String memberId, String dateOfBirthStr, String last4SocialSecurity  ){
        ResponseWrapper response;
        try
        {
            /*
            if( memberId.isNumeric() ){
                String idOfmember = memberId;
                Date dateOfBirth = Date.valueOf(dateOfBirthStr);
                List<Contact> contacts =[ SELECT Id, FirstName, LastName, Member_ID__c, Email, AccountId,
                                          hed__Social_Security_Number__c 
                                          FROM Contact
                                          WHERE Member_ID__c =: idOfmember 
                                          AND Birthdate =: dateOfBirth 
                                        ];
                if( contacts <> null  && !contacts.isEmpty() &&  
                String.valueOf(contacts[0].hed__Social_Security_Number__c).containsIgnoreCase(last4SocialSecurity)){
                   // response = new ResponseWrapper( true, null, 'Member is present..!' );
                    
                    List<user> userRec =[ SELECT FirstName, LastName, email, Id, Username
                                          FROM User
                                          WHERE contactId =: contacts[0].Id
                                        ];
       
                    if( userRec <> null && !userRec.isEmpty() ){
                        Site.forgotPassword( userRec[0].Username );
                        response = new ResponseWrapper( true, null, 'Member is present, reset password link sent on user email' );
                    }else{
                        Profile studentCommProfile =  [ SELECT Id, Name FROM Profile WHERE Name = 'Student Community Plus User' ];
                        User newUserRec = new User( alias = 'standt', email = contacts[0].Email,
                                                    emailencodingkey='UTF-8', lastname = contacts[0].LastName, languagelocalekey='en_US',
                                                    firstname = contacts[0].FirstName,
                                                    localesidkey='en_US', profileid = studentCommProfile.Id , contactId = contacts[0].Id,
                                                    timezonesidkey='America/Los_Angeles', username = contacts[0].Email
                                                 );
                        newUserRec.communityNickname = contacts[0].LastName;
                        Database.insert(newUserRec);
                        //String userId  = Site.createExternalUser( newUserRec, acc.Id );
                        response = new ResponseWrapper( true, null, 'User created and email sent to user' );
                    }

                }else{
                    response = new ResponseWrapper( false, null, 'Member not present..!' );
                }
            }else{
                response = new ResponseWrapper( false, null, 'Please provide valid member Id.' );
            }*/
            response = new ResponseWrapper( false, null, 'Please provide valid member Id.' );
        }catch( Exception ex ){

            response = new ResponseWrapper( false, null, ex.getMessage() );
        }
        return response;
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> findAccounts(String searchKey) {
        String key = '%' + searchKey + '%';
        return [ SELECT Id, Name,  Phone
                 FROM Account WHERE Name LIKE :key LIMIT 10
                ];
    }

    @AuraEnabled
    public static ResponseWrapper siteSignUp( String jsonSignUpData ) {
        ResponseWrapper response;
        savepoint sp = database.setSavepoint();
        try
        {
            SignUpDataWrapper wrapperData = (SignUpDataWrapper) json.deserialize(jsonSignUpData, SignUpDataWrapper.class);
            
            Id reviewRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Review').getRecordTypeId();
            Id assistanceRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Assistance').getRecordTypeId();

            contact con = buildContact(wrapperData);
            
            if(!wrapperData.isUnemployed){
                Account acc = new  Account();                
                
                if( String.isNotBlank( wrapperData.accountId )  ){
                    acc.Id = wrapperData.accountId;
                }else if(String.isBlank(wrapperData.accountName)){
                    return new ResponseWrapper(false, null, 'Please enter Employer Name or Select Employer');
                }else{                    
                    acc.Name = wrapperData.accountName ;
                    insert acc;
                }
                
                con.AccountId = acc.Id;
                insert  con;

                //1) Student has email and the data : 
                
                if(String.isNotBlank(con.Email)){
                    
                    createCommunityUser(con);                    
                    //createCaseAndMFEforUser(con, reviewRecordTypeId, 'Employer Name : ' + acc.Name);
                    return new ResponseWrapper(true, null, 'New user created');
                }
                
/*                // 2) Student does not have email :
                
                if(String.isBlank(con.Email)){
                    
                    Case caseRec = new Case(Subject='Student Portal New Member - ' + con.LastName, 
                                            RecordTypeId = assistanceRecordTypeId,
                                            Type = 'Staff Assistance', Sub_Type__c = 'I have a General Question',
                                            ContactId = con.Id, 
                                            description='Email Address not entered, Assist Student with email address');
                    insert caseRec;   
                    return new ResponseWrapper(true, null, System.Label.Staff_Assistance_will_contact_you_for_Email_set_up);
                }
            }else{
                //3) Student UnEmployed : 
 	
                insert con; 
                if(String.isNotBlank(con.Email)){
                    // UnEmployed user has an email
                    createCommunityUser(con);                    
                    createCaseAndMFEforUser(con, reviewRecordTypeId, 'unemployed');
                    return new ResponseWrapper(true, null, System.Label.New_user_created);
                }
                if(String.isBlank(con.Email)){
                    // UnEmployed user does not have an email
                    Case caseRec = new Case(Subject='Student Portal New Member - ' + con.LastName, 
                                            RecordTypeId = assistanceRecordTypeId,
                                            Type = 'Staff Assistance', Sub_Type__c = 'I have a General Question',
                                            ContactId = con.Id, 
                                            description='Unemployed user - Email Address not entered, Assist Student with email address');
                    insert caseRec;
                    return new ResponseWrapper(true, null, System.Label.Staff_Assistance_will_contact_you_for_Email_set_up);
                }*/
            }
            return new ResponseWrapper(false, null, 'Something went wrong');
        }catch( Exception ex ){
            Database.rollback(sp);
            system.debug( ' Exception Occured '+ ex.getMessage() );
            if(ex.getMessage().containsIgnoreCase('Duplicate')){
                return new ResponseWrapper(false, null, 'Duplicate_user_or_Contact_Detected');
            }
            response = new ResponseWrapper( false, null, ex.getMessage() );
        }
        return response;
    }
    
    /*private static void createCaseAndMFEforUser(contact con, Id reviewRecordTypeId, String descriptionText){
        
        Case caseRec = new Case(Subject='Student Portal New Member - ' + con.LastName, 
                                RecordTypeId = reviewRecordTypeId,
                                Type = 'Employment Verification', Sub_Type__c = 'Manual',
                                ContactId = con.Id, 
                                description= descriptionText);
        insert caseRec;
        
        List<Account> listTemporaryFundAccount = [SELECT Id, Name FROM Account WHERE RecordType.Name='Fund'
                                                  AND Name ='Temporary Fund'];
        Id tempFundAccId;
        if(! listTemporaryFundAccount.isEmpty()){
            tempFundAccId = listTemporaryFundAccount[0].Id;
        }
        
        Member_Fund_Eligibility__c mfeRec = new Member_Fund_Eligibility__c(Type__c ='Temporary',
                                                                           Contact__c = con.Id,
                                                                           Account__c = tempFundAccId);
        insert mfeRec;
    }
    */
    private static void createCommunityUser(contact con){
        Profile studentCommProfile =  [ SELECT Id, Name FROM Profile WHERE Name = 'Student Community Plus User' ];

        User userRec = new User( alias = 'standt', email = con.Email,
                                emailencodingkey='UTF-8', lastname = con.LastName, languagelocalekey='en_US',
                                firstname = con.FirstName,
                                localesidkey='en_US', profileid = studentCommProfile.Id , contactId = con.Id,
                                timezonesidkey='America/Los_Angeles', username = con.Email );
        userRec.communityNickname = con.LastName;
        Database.insert(userRec);
        Site.forgotPassword( userRec.Username );
    }
    
    private static contact buildContact(SignUpDataWrapper wrapperData){
        contact con = new contact();
        
        con.LastName = wrapperData.lastName;
        con.Email = wrapperData.email ;
        con.FirstName = ( String.isNotBlank( wrapperData.firstName ) ? wrapperData.firstName : '' );
        con.Birthdate = (  (wrapperData.dateOfBirth <> null ) ? wrapperData.dateOfBirth : null );
        con.Phone = (  String.isNotBlank(wrapperData.phone ) ? wrapperData.phone : '' );
        //con.Member_ID__c = (  String.isNotBlank( wrapperData.memberId ) ? wrapperData.memberId : '' );
        con.MailingStreet = ( String.isNotBlank( wrapperData.address ) ? wrapperData.address : '' );
        con.MailingState = ( String.isNotBlank( wrapperData.state ) ? wrapperData.state : '' );
        con.MailingCity = ( String.isNotBlank( wrapperData.city ) ? wrapperData.city : '' );
        con.MailingPostalCode = ( String.isNotBlank( wrapperData.zip ) ? wrapperData.zip : '' );
        con.MailingCountry = ( String.isNotBlank( wrapperData.country ) ? wrapperData.country : '' );
        //con.MiddleName = ( String.isNotBlank( wrapperData.middlename ) ? wrapperData.middlename : '' );
        /*
        con.Is_UnEmployed__c = wrapperData.isUnemployed;
		
        con.hed__WorkEmail__c =  ( String.isNotBlank( wrapperData.workEmail ) ? wrapperData.workEmail : '' );
        con.MobilePhone =  ( String.isNotBlank( wrapperData.cellphone ) ? wrapperData.cellphone : '' );
        con.Emergency_Contact_First_Name__c = ( String.isNotBlank( wrapperData.emergencyContactFirstName ) ? wrapperData.emergencyContactFirstName : '' );
        con.Emergency_Contact_Last_Name__c = ( String.isNotBlank( wrapperData.emergencyContactLastName ) ? wrapperData.emergencyContactLastName : '' );
        con.Emergency_Contact_Phone__c = ( String.isNotBlank( wrapperData.emergencyContactPhone ) ? wrapperData.emergencyContactPhone : '' );
        con.Emergency_Contact_Relationship__c = ( String.isNotBlank( wrapperData.emergencyContactRelationship ) ? wrapperData.emergencyContactRelationship : '' );
        con.Are_you_an_1199_Member__c = ( String.isNotBlank( wrapperData.areYou1199Member ) ? wrapperData.areYou1199Member : '' );
		*/
        return con;
    }


    public class SignUpDataWrapper{
        @AuraEnabled
        public String firstName;
        @AuraEnabled
        public String lastName;
        @AuraEnabled
        public date dateOfBirth;
        @AuraEnabled
        public String email;
        @AuraEnabled
        public String phone;

        @AuraEnabled
        public String memberId;

        @AuraEnabled
        public String accountName;
        @AuraEnabled
        public String accountId;

        @AuraEnabled
        public String address;
        @AuraEnabled
        public String city;
        @AuraEnabled
        public String state;
        @AuraEnabled
        public String zip;
        @AuraEnabled
        public String country;
        
        @AuraEnabled
        public boolean isUnemployed;
        @AuraEnabled
        public String middlename;
        @AuraEnabled
        public String workEmail;
        @AuraEnabled
        public String cellphone;
        @AuraEnabled
        public String last4SocialSecurity;
        @AuraEnabled
        public String emergencyContactFirstName;
        @AuraEnabled
        public String emergencyContactLastName;
        @AuraEnabled
        public String emergencyContactPhone;
        @AuraEnabled
        public String emergencyContactRelationship;
        @AuraEnabled
        public String areYou1199Member;
        
    }
    public class ResponseWrapper {
        @AuraEnabled
        public Boolean isSuccess;
        @AuraEnabled
        public Object Data;
        @AuraEnabled
        public String Message;
        
        public ResponseWrapper( Boolean isSuccess, Object data, String message)
        {
            this.isSuccess = isSuccess;
            this.Data = data;
            this.Message = message;
        }
    }
}