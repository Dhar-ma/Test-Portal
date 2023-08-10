public class UserTaskActionLWCCtrl {

    @AuraEnabled
    public static ActionResult createQuestionTask(Id recordId, String taskJsonStr){
       
        Savepoint sp = Database.setSavepoint();
        
        try {
            String sObjName = recordId.getSObjectType().getDescribe().getName();
            
            if(sObjName.equalsIgnoreCase('ResidentialLoanApplication')){
                return createQuestionTaskForApplication(recordId, taskJsonStr);
            }else if(sObjName.equalsIgnoreCase('Case')){
                return createQuestionTaskForCase(recordId, taskJsonStr);
            }else{
                return new ActionResult('Sobject Type is not configured for this component');
            }
            
        }catch(Exception exp) {
            Database.rollback(sp);
            return new ActionResult( exp.getMessage());
        }        
    }
    
    private static ActionResult createQuestionTaskForCase(Id caseId, String taskJsonStr){
        
        Case caseRec = [SELECT Id, ContactId, Contact.Name, AccountId, Status
                        FROM Case
                        WHERE Id =:caseId];
        
        if(caseRec.ContactId == null){
            return new ActionResult('Contact not specified on Case record');
        }
        
        List<User> listUserRec = [SELECT Id FROM user WHERE ContactId =: caseRec.ContactId];
        
        if(listUserRec.isEmpty()){
            
            String contactName = caseRec.ContactId != null ? caseRec.Contact.Name : '';
            
            return new ActionResult('Community user not found for the contact ['+contactName+'] on case record');
        }
        
        Task task = (Task) Json.deserialize(taskJsonStr, task.class);
        task.WhoId = caseRec.ContactId;
        task.WhatId = caseId;
        task.OwnerId = listUserRec[0].Id;            
        //task.Subject = 'Please confirm/answer the question'; 
        task.Status = 'Open';
        task.Type = 'User Action';
        task.Action_Type__c = 'Question';
        
        insert task;
        
        return new ActionResult( new map<String,object>{'Success'=>'Task created successfully'});
    }
    
    private static ActionResult createQuestionTaskForApplication(Id appId, String taskJsonStr){
        ResidentialLoanApplication loanApp = [SELECT Id, Name, CreatedById, CreatedBy.ContactId
                                       FROM ResidentialLoanApplication
                                       WHERE Id =:appId];
        
        Task task = (Task) Json.deserialize(taskJsonStr, task.class);
        task.WhoId = loanApp.CreatedBy.ContactId;
        task.WhatId = loanApp.Id;
        task.OwnerId = loanApp.CreatedById;
        //task.Subject = 'Please confirm/answer the question';
        task.Status = 'Open';
        task.Type = 'User Action';
        task.Action_Type__c = 'Question';
        
        insert task;   
        
        return new ActionResult( new map<String,object>{'Success'=>'Task created successfully'});
    }
    
    @AuraEnabled
    public static ActionResult fetchMemberDocumentList(String appId){
        try {
            
            List<File_Type__c> listFile_Type = [SELECT Id, Name FROM File_Type__c ];
            
            return new ActionResult( new map<String,object>{'listFile_Type'=> listFile_Type});
        }catch(Exception exp) {
            return new ActionResult( exp.getMessage());
        }        
    }
    
    @AuraEnabled
    public static ActionResult createReUploadTask(Id recordId, String selectedDocumentsStr, String taskJsonStr){
        Savepoint sp = Database.setSavepoint();
        try {
            
            String sObjName = recordId.getSObjectType().getDescribe().getName();
            
            if(sObjName.equalsIgnoreCase('ResidentialLoanApplication')){
                return createUploadTaskForApplication(recordId, taskJsonStr, selectedDocumentsStr);
            }else if(sObjName.equalsIgnoreCase('Case')){
                return createUploadTaskForCase(recordId, taskJsonStr, selectedDocumentsStr);
            }else{
                return new ActionResult('Sobject Type is not configured for this component');
            }            
        }catch(Exception exp) {
            Database.rollback(sp);
            return new ActionResult( exp.getMessage() + exp.getStackTraceString());
        }        
    }   
    
    private static ActionResult createUploadTaskForCase(Id caseId, String taskJsonStr, String selectedDocumentsStr){
        List<File_Type__c> listDocument = (List<File_Type__c>) Json.deserialize(selectedDocumentsStr, List<File_Type__c>.class);
        
        List<String> listDocNameList = new List<String>();
        for(File_Type__c doc :listDocument){
            
            listDocNameList.add(doc.name);
        }
        String docNames = String.join(listDocNameList, ', ');
        
        Case caseRec = [SELECT Id, ContactId, Contact.Name, AccountId, Status
                        FROM Case
                        WHERE Id =:caseId];
        
        if(caseRec.ContactId == null){
            return new ActionResult('Contact not specified on Case record');
        }
        
        List<User> listUserRec = [SELECT Id FROM user WHERE ContactId =: caseRec.ContactId];
        
        if(listUserRec.isEmpty()){
            
            String contactName = caseRec.ContactId != null ? caseRec.Contact.Name : '';
            
            return new ActionResult('Community user not found for the contact ['+contactName+'] on case record');
        }
        
        Task task = (Task) Json.deserialize(taskJsonStr, task.class);
        task.WhoId = caseRec.ContactId;
        task.WhatId = caseId;
        task.OwnerId = listUserRec[0].Id;            
        task.Subject = 'Upload Documents: '+ docNames; 
        task.Status = 'Open';
        task.Type = 'User Action';
        task.Action_Type__c = 'Document Upload';
        
        insert task;
        
        List<Case_Document__c> listDocumentsTobeInserted =  new List<Case_Document__c>();
        
        for(File_Type__c doc :listDocument){
            Case_Document__c newDoc = new Case_Document__c();
            newDoc.name = doc.name;
            newDoc.Case__c = caseRec.Id;
            newDoc.Task_Id__c = task.Id;
            newDoc.File_Type__c = doc.Id;
            listDocumentsTobeInserted.add(newDoc);
        }
        insert listDocumentsTobeInserted;        
        return new ActionResult( new map<String,object>{'Success'=>'Task created successfully'});
      }
    
    
    private static ActionResult createUploadTaskForApplication(Id appId, String taskJsonStr, String selectedDocumentsStr){
        List<File_Type__c> listDocument = (List<File_Type__c>) Json.deserialize(selectedDocumentsStr, List<File_Type__c>.class);
        
        ResidentialLoanApplication loanApp = [SELECT Id, Name, CreatedById, CreatedBy.ContactId
                                         FROM ResidentialLoanApplication
                                         WHERE Id =:appId];
          
          
          List<String> listDocNameList = new List<String>();
          for(File_Type__c doc :listDocument){
              
              listDocNameList.add(doc.name);
          }
          String docNames = String.join(listDocNameList, ', ');
          
          Task task = (Task) Json.deserialize(taskJsonStr, task.class);
          task.WhoId = loanApp.CreatedBy.ContactId;
          task.WhatId = loanApp.Id;
          task.OwnerId = loanApp.CreatedById;                  
          task.Subject = 'Upload Documents: '+ docNames; 
          task.Status = 'Open';
          task.Type = 'User Action';
          task.Action_Type__c = 'Document Upload';
          
          insert task;
          
          List<Required_Application_Document__c> listDocumentsTobeInserted =  new List<Required_Application_Document__c>();
          
          for(File_Type__c doc :listDocument){
              Required_Application_Document__c newDoc = new Required_Application_Document__c();
              newDoc.name = doc.name;
              newDoc.Residential_Loan_Application__c = loanApp.Id;
              newDoc.Task_Id__c = task.Id;
              newDoc.File_Type__c = doc.Id;
              listDocumentsTobeInserted.add(newDoc);
          }
          insert listDocumentsTobeInserted;        
          return new ActionResult( new map<String,object>{'Success'=>'Task created successfully'});
      }
    
    
    @AuraEnabled
    public static ActionResult fetchTaskDetails(String taskId){
        try {
            
            Task taskRec = [SELECT Id, Subject, Description, Action_Type__c, Answer__c, WhatId
                            FROM Task
                            WHERE Id =: taskId];
 			String sObjName = taskRec.WhatId.getSObjectType().getDescribe().getName();
            String fileTypeIds = getRequiredDocumentFileIdsForTask(taskRec.Id, sObjName);
            
            return new ActionResult( new map<String,object>{'taskRec'=> taskRec, 'fileTypeIds'=>fileTypeIds, 'sObjName'=>sObjName});
        }catch(Exception exp) {
            return new ActionResult( exp.getMessage());
        }        
    }
    
    private static String getRequiredDocumentFileIdsForTask(String taskId, String sObjName){
        Set<String> requiredDocumentIds = new Set<String>();
                
        if(sObjName.equalsIgnoreCase('ResidentialLoanApplication')){
            
            for(Required_Application_Document__c reqDoc :[SELECT Id, File_Type__c
                                                          FROM Required_Application_Document__c
                                                          WHERE Task_Id__c Like : taskId +'%'
                                                          Order by CreatedDate]){
                if(reqDoc.File_Type__c != null){
                    requiredDocumentIds.add(reqDoc.File_Type__c);
                }
            }
        }else if(sObjName.equalsIgnoreCase('Case')){
            
            for(Case_Document__c reqDoc :[SELECT Id, File_Type__c
                                          FROM Case_Document__c
                                          WHERE Task_Id__c Like : taskId +'%'
                                          Order by CreatedDate]){
                if(reqDoc.File_Type__c != null){
                    requiredDocumentIds.add(reqDoc.File_Type__c);
                }
            }
        }
        
        return String.join(New list<String>(requiredDocumentIds), ',');
    }
    
    @AuraEnabled
    public static ActionResult saveTaskDetails(String taskId, String answerText){
        try {
            
            Task taskRec = new Task( Id = taskId, Answer__c = answerText, Status = 'Complete');
            update taskRec;
            return new ActionResult( new map<String,object>{'Success'=> 'Task saved successfully'});
        }catch(Exception exp) {
            return new ActionResult( exp.getMessage());
        }
    }
    
    @AuraEnabled
    public static ActionResult completeTask(String taskId){
        try {
            
            Task taskRec = new Task( Id = taskId, Status = 'Complete');
            update taskRec;
            return new ActionResult( new map<String,object>{'Success'=> 'Task saved successfully'});
        }catch(Exception exp) {
            return new ActionResult( exp.getMessage());
        }
    }
}