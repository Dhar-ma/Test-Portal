public without sharing class EligibilityAndUserRegistrationController {

    @AuraEnabled
    public static ActionResult checkUserType(string contactStr){ 
        try{
            Boolean isLoggedIn = false;
            String userType = UserInfo.getUserType();
            if (userType != 'Guest') {
                isLoggedIn = true;
            }            
            return new ActionResult(new map<string, object>{'isLoggedIn'=>isLoggedIn});
        }catch(Exception exec){
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
   @AuraEnabled
    public static ActionResult createNewUser(string contactStr){
        
        savepoint sp = database.setSavepoint();
        try{
            
            Map<String, object> mapData = new Map<String, object>();
            
            Contact contactdata = (Contact) Json.deserialize(contactStr, Contact.class);
            //Account accountdata = (Account) Json.deserialize(accountStr, Account.class);
            
            if(isUserExists(contactdata.Email)){                                                
                return new ActionResult('This email address has already been used to create an account. Please check your email to reset password');
            }
            
            Contact searchedContact = findContact(contactdata);
            
            if(searchedContact != null){
                createCommunityUser(searchedContact);
                return new ActionResult(new map<String,object>{'message'=> 'User created successfully. Please check your email.'});
            }else{
                Loan_Account_Owner_Setting__c accountOwnerStng = Loan_Account_Owner_Setting__c.getOrgDefaults();
				
                Account accountdata = new Account();
                
                if(contactdata.LastName != null && contactdata.FirstName != null){
                    accountdata.Name = contactdata.FirstName+' '+contactdata.LastName;
                }else if(contactdata.LastName != null){
                    accountdata.Name = contactdata.LastName;
                }else if(contactdata.FirstName != null){
                    accountdata.Name = contactdata.FirstName;
                }
                
                
                if(accountOwnerStng != null){
                    accountdata.ownerId = accountOwnerStng.Owner_Id__c;
                }
                
                insert accountdata;
                
                contactdata.AccountId = accountdata.id;
                insert contactdata;
                createCommunityUser(contactdata);
                return new ActionResult(new map<String,object>{'message'=> 'User created successfully. Please check your email.'});
            }
        }catch(Exception exec){
            database.rollback(sp);
            System.debug(exec);
            return new ActionResult(exec);
        }
    }
    
    private static Contact findContact(Contact contactTobeSearched){
        
        Boolean contactFound = false;
        
        List<Contact> contacts =[SELECT Id, FirstName, LastName, Birthdate, Email,
                                 AccountId, Social_Security_Number__c
                                 FROM Contact
                                 WHERE Email =: contactTobeSearched.Email 
                                 AND LastName=: contactTobeSearched.LastName
                                 AND FirstName=: contactTobeSearched.FirstName
                                ];
        
        if( contacts != null  && !contacts.isEmpty() ) {
            for(contact contactRec : contacts){
                
                if(contactTobeSearched.Birthdate != null && contactRec.Birthdate == contactTobeSearched.Birthdate){
                    contactTobeSearched = contactRec;
                    contactFound = true;
                    break;
                }
                
                if(contactRec.Social_Security_Number__c != null
                   && String.valueOf(contactRec.Social_Security_Number__c).containsIgnoreCase(String.valueOf(contactTobeSearched.Social_Security_Number__c))){
                       
                       contactTobeSearched = contactRec;
                       contactFound = true;                            
                   }
                
                if(contactRec.Email != null && contactRec.Email.equals(contactTobeSearched.Email)){
                    contactTobeSearched = contactRec;
                    contactFound = true;                            
                } 
            }
        }
        if(contactFound == false){
            return null;
        }
        return contactTobeSearched;
    }
    
    private static void createCommunityUser(contact con){
        Profile commProfile =  [ SELECT Id, Name FROM Profile WHERE Name = 'Customer Community Plus User Custom' ];

        User userRec = new User( alias = 'standt', email = con.Email,
                                emailencodingkey='UTF-8', lastname = con.LastName, languagelocalekey='en_US',
                                firstname = con.FirstName,
                                localesidkey='en_US', profileid = commProfile.Id , contactId = con.Id,
                                timezonesidkey='America/Los_Angeles', username = con.Email );
        userRec.communityNickname = getFormattedNickName(con.FirstName, con.LastName);
        Database.insert(userRec);
        Site.forgotPassword( userRec.Username );
    }
    
    public static String getFormattedNickName( String firstName, String lastName ){
		
		if( String.isNotBlank( firstName ) && String.isNotBlank( lastName ) ){
			return firstName.capitalize() + lastName.substring(0,1).toUpperCase(); 
		}
		return null;
	}
    
	public Static Boolean isUserExists( String email ){
		if ( String.isNotBlank( email) ){
			User user;          // if Email already present (check for duplicate)       
			try{
				user = [ SELECT CommunityNickname, Username
						 FROM User
						 WHERE Username  =: email 
                        AND Profile.Name= 'Customer Community Plus User Custom'
					   ];
                Site.forgotPassword( user.Username );
			}catch(Exception e){
				System.debug(' exception in to fetch UserName: ' + e.getMessage() );
			}
			if( user != NULL){
				return true ;
			}
		}
		return false;
	}
}