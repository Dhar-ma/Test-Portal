/**
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Developer(s): 
    1. Joseph Cadd - caddjoseph@gmail.com
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Created Date: 3/1/2020
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Description/Purpose of Page / Code: 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Related to
   Classes: 
   Pages/Components:
   Other:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Change Log: 
    3/1/2020 Joe Cadd: Created Class
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*/
public with sharing class RequiredFileUpload {
    @AuraEnabled
    public static String getRequiredAndStoredFileInfos(Id parentId, String storageObjectName, String storageParentLookup,
            String storageFileTypeLookup, List<Id> fileTypeIdsList)
    {

        CmpData returnData = new CmpData();

        try {
            // Get required doc records metadata types
            List<File_Type__c> fileTypesList = new List<File_Type__c>();
            //Set<String> requiredDocNames = new Set<String>();

            fileTypesList.addAll([
                    SELECT Id, Name, Description__c, Help_Text__c
                    FROM File_Type__c
                    WHERE Id IN: fileTypeIdsList
            ]);
            returnData.fileTypeList = fileTypesList;
//            for (File_Type__c fileType : fileTypesList) {
//                //requiredDocNames.add(fileType.Name);
//            }


            List<SObject> existingStorageRecords = new List<SObject>();
            String queryStr = 'SELECT Id, Name, ';
            queryStr += storageParentLookup +',';
            queryStr += storageFileTypeLookup +' FROM '+ storageObjectName +' WHERE '+ storageParentLookup +'=:parentId';
            System.debug('queryStr : '+queryStr);
            existingStorageRecords = Database.query(queryStr);
			System.debug('existingStorageRecords : '+existingStorageRecords);

            Map<Id, SObject> typeIdToStorageRecord = new Map<Id, SObject>();

            // Obtain a map of already existing storage records associated with the parent record
            // Whichever types specified that are found will NOT need to be inserted
            for (SObject storageRec : existingStorageRecords) {
                Id fileTypeId = (Id)storageRec.get(storageFileTypeLookup);
                if (!typeIdToStorageRecord.containsKey(fileTypeId)) {
                    if (fileTypeIdsList.contains(fileTypeId)) {
                        typeIdToStorageRecord.put(fileTypeId, storageRec);
                    }
                }
            }
			System.debug('typeIdToStorageRecord : '+typeIdToStorageRecord);

            List<SObject> storageRecordsToInsert = new List<SObject>();
            // Loop through all required File Types - if there is no match in the already existing doc Map then insert that record
            Schema.SObjectType storageObjectType = Schema.getGlobalDescribe().get(storageObjectName);

            for (File_Type__c fileType : fileTypesList) {
                if (!typeIdToStorageRecord.containsKey(fileType.Id)) {
                    SObject newStorageRecord = storageObjectType.newSObject();
                    newStorageRecord.put(storageParentLookup, parentId);
                    newStorageRecord.put(storageFileTypeLookup, fileType.Id);
                    newStorageRecord.put('Name', fileType.Name);

                    storageRecordsToInsert.add(newStorageRecord);
                }
            }
            insert storageRecordsToInsert;


            // Add already existing records to newly inserted records
            List<SObject> allStorageRecords = new List<SObject>();
            if (!typeIdToStorageRecord.isEmpty()) {
                allStorageRecords.addAll(typeIdToStorageRecord.values());
            }
            if (storageRecordsToInsert.size() > 0) {
                allStorageRecords.addAll(storageRecordsToInsert);
            }


            Set<Id> storageRecordsIds = new Set<Id>();
            List<FileStorageInfo> fileStorageInfoList = new List<FileStorageInfo>();
            for (SObject storageRecord : allStorageRecords) {
                storageRecordsIds.add((Id)storageRecord.get('Id'));
                fileStorageInfoList.add(new FileStorageInfo(storageRecord));
            }
            List<ContentDocumentLink> cdlList = new List<ContentDocumentLink>();
            cdlList.addAll([
                    SELECT Id, ContentDocumentId, LinkedEntityId, ContentDocument.Title, ContentDocument.FileExtension, ContentDocument.FileType,
                            ContentDocument.LatestPublishedVersion.TextPreview, ContentDocument.LatestPublishedVersionId, ContentDocument.ContentSize
                    FROM ContentDocumentLink WHERE LinkedEntityId IN :storageRecordsIds
            ]);


            for (ContentDocumentLink cdl : cdlList) {
                for (FileStorageInfo fsi : fileStorageInfoList) {
                    if (cdl.LinkedEntityId == fsi.fileStorageRecord.get('Id')) {
                        fsi.attachedFileIds.add(cdl.ContentDocumentId);
                        fsi.cdlList.add(cdl);
                    }
                }
            }

            returnData.fileStorageInfoList = fileStorageInfoList;

            returnData = addFileTypeInfoToStorageInfo(returnData, storageFileTypeLookup);

        } catch (Exception e) {
            System.debug(e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return JSON.serialize(returnData);
    }

    public static CmpData addFileTypeInfoToStorageInfo(CmpData returnData, String storageFileTypeLookup) {
        for (FileStorageInfo fsi : returnData.fileStorageInfoList) {
            for (File_Type__c fileType : returnData.fileTypeList) {
                // If file type is the same then map info back to the storageInfo wrapper
                if (fileType.Id == fsi.fileStorageRecord.get(storageFileTypeLookup)) {
                    fsi.fileType = fileType;
                }
            }
        }
        return returnData;
    }

    @AuraEnabled
    public static void deleteFile(Id fileId) {
        try {
            ContentDocument cd = new ContentDocument(Id=fileId);
            delete cd;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Info about children storage objects on a parent object, and all the files attached there
    public class FileStorageInfo {
        public SObject fileStorageRecord;
        public File_Type__c fileType;
        public List<Id> attachedFileIds = new List<Id>();
        public List<ContentDocumentLink> cdlList = new List<ContentDocumentLink>();

        public FileStorageInfo(SObject fileStorageRecord) {
            this.fileStorageRecord = fileStorageRecord;
        }
    }

    public class CmpData {
        public List<FileStorageInfo> fileStorageInfoList;
        public List<File_Type__c> fileTypeList;

        public CmpData() {}
    }
}