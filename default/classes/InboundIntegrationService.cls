/**********************************************************
@class      InboundIntegrationService
@brief      This class will interface with metadata configuration about Live Integrations and
            also interact with the Integration Status Object
@testClass  IncomingIntegrationConfigServiceTest
@author     Developer Name (rchapple)
@version    1/10/2018   Rebecca Chapple (rchapple)
                        Initial Draft
            1/23/2019   Rob Sullivan (rsullivan)
                        Separate Inbound and Outbound classes
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
public with sharing class InboundIntegrationService {

    public class IntegrationException extends Exception {}

    /**
    * Reads the incoming integration configuration information for the passed in sobject API Name
    * @return the application configuration record with the embedded fields list
    */
    public Incoming_Integrated_Object__mdt getIncomingIntegrationObjectConfigurationByObject(String name) {
        System.debug(LoggingLevel.DEBUG, 'InboundIntegrationService.getIncomingIntegrationObjectConfigurationByObject(' + name + ')');
        // Read test records only if a test is running
        Boolean isTest = false;
        if (Test.isRunningTest()) {
            isTest = true;
        }
        try {
            return [SELECT SObject_API_Name__c,
                    Object__c,
                    External_Id_Field_API_Name__c,
                    MasterLabel,
            (SELECT MasterLabel,
                    Field_API_Name__c,
                    Field_Value__c,
                    Conditional_Field_Name__c,
                    Incoming_Field_Type__c,
                    Decimal_Digits__c,
                    Incoming_Object_Level_1__c,
                    Level_1_Is_List__c,
                    Level_1_Use_First_Item__c,
                    Level_1_Match_Field_Name__c,
                    Level_1_Match_Field_Value__c,
                    Incoming_Object_Level_2__c,
                    Level_2_Is_List__c,
                    Level_2_Use_First_Item__c,
                    Level_2_Match_Field_Name__c,
                    Level_2_Match_Field_Value__c,
                    Incoming_Field_Name__c
            FROM Incoming_Integrated_Object_Fields__r)
            FROM Incoming_Integrated_Object__mdt
            WHERE Object__c = :name
            AND Is_Test_Record__c = :isTest];
        } catch (Exception e) {
            // An exception just means there isn't a record defined so return null from the function
            System.debug(LoggingLevel.DEBUG, 'There is no integration defined for: '+name);
        }
        return null;
    }

    /**
     * Reads the incoming integration configuration information for the passed in sobject API Name
     * @return the application configuration record with the embedded fields list
     */
    public Incoming_Integrated_Object__mdt getIncomingIntegrationObjectConfiguration(String sobjectAPIName) {
        System.debug(LoggingLevel.DEBUG, 'Starting InboundIntegrationService.getIncomingIntegrationObjectConfiguration...');
        // Read test records only if a test is running
        Boolean isTest = false;
        if (Test.isRunningTest()) {
            isTest = true;
        }
        try {
            return [SELECT SObject_API_Name__c,
                    MasterLabel,
            (SELECT MasterLabel,
                    Field_API_Name__c,
                    Field_Value__c,
                    Conditional_Field_Name__c
            FROM Incoming_Integrated_Object_Fields__r)
            FROM Incoming_Integrated_Object__mdt
            WHERE SObject_API_Name__c=:sobjectAPIName
            AND Is_Test_Record__c = :isTest];
        } catch (Exception e) {
            // An exception just means there isn't a record defined so return null from the function
            System.debug(LoggingLevel.DEBUG, 'There is no integration defined for: ' + sobjectAPIName);
        }
        return null;
    }

    /**
     * Reads the incoming integration field configuration information for the passed in sobject API Name and field API Name
     * @return the application field configuration record
     */
    public Incoming_Integrated_Object_Field__mdt getIncomingIntegrationObjectFieldConfiguration(String sobjectAPIName, String fieldAPIName) {
        System.debug(LoggingLevel.DEBUG, 'Starting InboundIntegrationService.getIncomingIntegrationObjectFieldConfiguration...');
        // Read test records only if a test is running
        Boolean isTest = false;
        if (Test.isRunningTest()) {
            isTest = true;
        }
        try {
            Incoming_Integrated_Object__mdt integratedObject = [
                    SELECT Id,
                            SObject_API_Name__c
                    FROM Incoming_Integrated_Object__mdt
                    WHERE SObject_API_Name__c = :sobjectAPIName
                    AND Is_Test_Record__c = :isTest];

            return [SELECT MasterLabel,
                    Field_API_Name__c,
                    Field_Value__c,
                    Conditional_Field_Name__c
            FROM Incoming_Integrated_Object_Field__mdt
            WHERE Incoming_Integration_Object__c = :integratedObject.Id
            AND Field_API_Name__c = :fieldAPIName];
        } catch (Exception e) {
            // An exception just means there isn't a record defined so return null from the function
            System.debug(LoggingLevel.DEBUG, 'There is no integration defined for: ' + sobjectAPIName + '.' + fieldAPIName);
        }
        return null;
    }

    /**
    * Method to return the value of a specified field name from a list of Incoming Integrated Object Fields
    * @param fields the definition of metadata defining what fields to check
    * @return String value of the specified field name
    */
    public String getIncomingIntegratedObjectFieldValue(List<Incoming_Integrated_Object_Field__mdt> fields, String fieldAPIName) {
        System.debug(LoggingLevel.DEBUG, 'Starting InboundIntegrationService.getIncomingIntegratedObjectFieldValue...');
        for (Incoming_Integrated_Object_Field__mdt field : fields) {
            if (field.Field_API_Name__c == fieldAPIName) {
                return field.Field_Value__c;
            }
        }
        return null;
    }

    /**
     * Method to take a json body and using the incoming object configuration, update the
     * necessary record in Salesforce.  This method commits the record after it makes the
     * updates so the caller need to realize that commit will happen and not make any
     * additional callouts
     * @param objectName The object name that will be found in the custom metadata configuration
     * @param externalIdValue The value that will need to be matched on the source record
     * @param responseBody The json response to be parsed to find the values to set in the records
     */

    public void processJsonBody(String objectName, String externalIdValue, List<String> jsonBodyList) {
        System.debug(LoggingLevel.DEBUG, 'InboundIntegrationService.processJsonBody(objectName:' + objectName + ', externalIdValue: ' + externalIdValue + ')');
        // Read the Integration configuration for the object we are integrating
        Incoming_Integrated_Object__mdt objectConfig = getIncomingIntegrationObjectConfigurationByObject(objectName);

        // Parse the json into a Map
        Map<String, Object> responseMap = new Map<String, Object>();
        for (String bodyItem : jsonBodyList) {
            try {
                Map<String, Object> stuff = ((Map<String, Object>) JSON.deserializeUntyped(bodyItem));
                responseMap.putAll(stuff);
            } catch (Exception e) {
                System.debug(LoggingLevel.DEBUG, 'WE HAD A PARSING PROBLEM.  We will parse what we can');
            }
        }

        //
        // GET THE EXTERNAL IDS FROM THE RESPONSE
        //
        Map<String, Object> application = null;
        List<Object> applications = (List<Object>) responseMap.get('applications');
        application = (Map<String, Object>) applications.get(0);
        String applicationId = (String) application.get('applicationId');
        if (applicationId.contains('borrower')) {
            applicationId = externalIdValue + applicationId;
        }
        System.debug('applicationId: ' + applicationId);

        //
        // PROCESS THE TOP-LEVEL LOAN INFORMATION
        //
        SObject loan;
        try {
            loan = Database.query(createSalesforceQuery(objectConfig, externalIdValue));
        } catch (Exception e) {
            System.debug(LoggingLevel.DEBUG, 'We received an error trying to query based on the configuration');
            throw new IntegrationException('We received an error trying to query based on the configuration:' + e.getMessage());
        }
        if (loan != null) {
            // Set the Application Id
            if (!Test.isRunningTest()) {
                loan.put('ApplicationExtIdentifier', applicationId);
            }
            loan = updateRecord(loan, responseMap, objectConfig, applicationId);
            update loan;
        }

        //
        // Process Encompass loan objects
        //
        EncompassLoanUpdates updateService = new EncompassLoanUpdates();
        if (!Test.isRunningTest()) {
            updateService.updateLoanObjects(loan.Id, (String)loan.get('Name'), externalIdValue, jsonBodyList[0], responseMap);
        }

        //
        // Process line item data coming from Encompass, such as
        // Liabilities, Conversation Logs, etc into Related Lists
        // on the Loan Application
        //
        EncompassRelatedLists.updateRelatedLists(loan.Id, jsonBodyList[0]);

        //
        // Process Loan Contacts
        //
        UpdateLoanContacts.parseAndUpdate(jsonBodyList[0], jsonBodyList[1], loan.Id);
    }

    public SObject updateRecord(SObject record, Map<String, Object> responseMap, Incoming_Integrated_Object__mdt objectConfig) {
        return updateRecord(record, responseMap, objectConfig, null);
    }

    public SObject updateRecord(SObject record, Map<String, Object> responseMap, Incoming_Integrated_Object__mdt objectConfig, String externalIdValue) {
        // Convert the Response Body into maps of maps
        System.debug(LoggingLevel.DEBUG, 'About to process fields (count): ' + objectConfig.Incoming_Integrated_Object_Fields__r.size());

        // Create a Map to hold inner list mappings when we have to match by a specific field name
        Map<String, Map<String, Object>> fieldByNameMappings = new Map<String, Map<String, Object>>();

        // Process the integration field configuration and for each field defined, read the field value from the
        // responseBody maps, and set the value in the SF object.
        for (Incoming_Integrated_Object_Field__mdt field: objectConfig.Incoming_Integrated_Object_Fields__r) {
            Object fieldValue = getFieldValue(field, responseMap, fieldByNameMappings, externalIdValue);
            System.debug('>>>>>>>>> field / fieldValue: ' + field.Field_API_Name__c + ' / ' + fieldValue);
            System.debug('>>>> record: ' + record);
            if (fieldValue != null) {
                if (field.Incoming_Field_Type__c.equals(IntegrationConfigConstants.STRING_FIELD_TYPE)) {
                    record.put(field.Field_API_Name__c, (String) fieldValue);
                } else if (field.Incoming_Field_Type__c.equals(IntegrationConfigConstants.NUMBER_FIELD_TYPE)) {
                    // Convert the Number to either Integer or Decimal based on the decimal digits field
                    if (field.Decimal_Digits__c==null || field.Decimal_Digits__c == 0) {
                        record.put(field.Field_API_Name__c, Integer.valueOf(fieldValue));
                    } else {
                        Decimal decimalValue = (Decimal)fieldValue;
                        Decimal rounded = decimalValue.setScale(Integer.valueOf(field.Decimal_Digits__c));
                        record.put(field.Field_API_Name__c, rounded);
                    }
                }  else if (field.Incoming_Field_Type__c.equals(IntegrationConfigConstants.STRING_TO_NUMBER_TYPE)) {
                    // Convert the Number to either Integer or decimal based on the decimal digits field
                    if (field.Decimal_Digits__c==null || field.Decimal_Digits__c == 0) {
                        record.put(field.Field_API_Name__c, Integer.valueOf((String)fieldValue));
                    } else {
                        String nbr = ( String ) fieldValue;
                        nbr = nbr.remove( ',' );
                        Decimal justNumbers = Decimal.valueOf( nbr );
                        Decimal rounded = justNumbers.setScale(Integer.valueOf(field.Decimal_Digits__c));
                        record.put( field.Field_API_Name__c, rounded );
                    }
                } else if (field.Incoming_Field_Type__c.equals(IntegrationConfigConstants.BOOLEAN_FIELD_TYPE)) {
                    Boolean b = ( Boolean ) fieldValue;
                    Boolean bool = Boolean.valueOf( b );
                    if ( bool ) {
                        record.put( field.Field_API_Name__c, true );
                    } else {
                        record.put( field.Field_API_Name__c, false );
                    }
                } else if (field.Incoming_Field_Type__c.equals(IntegrationConfigConstants.DATE_FIELD_TYPE)) {
                    // Get the Data Type of the field we will be writing to.
                    SObjectType r = ((SObject)(Type.forName('Schema.'+objectConfig.SObject_API_Name__c).newInstance())).getSObjectType();
                    DescribeSObjectResult d = r.getDescribe();
                    Schema.DisplayType fieldDataType = d.fields.getMap().get(field.Field_API_Name__c).getDescribe().getType();
                    System.debug('fieldDataType: ' + fieldDataType);
                    String dateTimeString = (String)fieldValue;
                    if (( dateTimeString.length() > 11 ) || ( dateTimeString.contains( 'T' )) || ( dateTimeString.contains( ':' ))) {
                        if (fieldDataType.name() == 'DATE') {
                            // The Encompass field is DateTime, but the target SF field is Date only.
                            // Strip the time and translate to Date only.
                            record.put(field.Field_API_Name__c, Date.newInstance(
                                    Integer.valueOf(dateTimeString.substring(0, 4)),
                                    Integer.valueOf(dateTimeString.substring(5, 7)),
                                    Integer.valueOf(dateTimeString.substring(8, 10))
                            ));
                        } else {
                            // Save the full DateTime value to SF.
                            record.put(field.Field_API_Name__c, Datetime.valueOfGmt(dateTimeString.replace('T',' ')));
                        }
                    } else if (( dateTimeString.contains( '/' )) && ( dateTimeString <> 'NA' )) {
                        // The Encompass field is a simple Date field.
                        record.put( field.Field_API_Name__c, Date.parse( dateTimeString ));
                    }
                } else if ( field.Incoming_Field_Type__c.equals( IntegrationConfigConstants.DATETIM )) {
                    String dateTimeString = (String)fieldValue;
                    // record.put(field.Field_API_Name__c, Datetime.valueOfGmt(dateTimeString.replace('T',' ')));
                    // record.put(field.Field_API_Name__c, Datetime.parse( dateTimeString.replace( 'T', ' ' )));
                    String dt = String.valueOf(( DateTime ) JSON.deserialize( '"' + dateTimeString + '"', DateTime.class ));
                    // DateTime converted = DateTime.valueOfGMT( dt );
                    DateTime converted = DateTime.valueOf( dt );
                    DateTime actualDate = converted.addHours( 12 );
                    //   record.put( field.Field_API_Name__c, ( DateTime ) JSON.deserialize( '"' + dateTimeString + '"' , DateTime.class ));   // original, raw date
                    record.put( field.Field_API_Name__c, actualDate );
                } else if ( field.Incoming_Field_Type__c.equals( IntegrationConfigConstants.DECIML )) {
                    Decimal d = ( Decimal ) fieldValue;
                    String s = d.toPlainString();
                    s.replaceAll( ',', '' );
                    Decimal justNumbers = Decimal.valueOf( s );
                    Decimal rounded = justNumbers.setScale( 2 );
                    record.put( field.Field_API_Name__c, rounded );
                }
            }
        }
        return record;
    }

    // ******************************* PRIVATE HELPER METHODS ************************
    /**
     * This method will be passed a configured field from the custom metadata object and based
     * on the values of the configuration extract that value from the Map.  It handles the supported
     * field types and any conversions necessary
     *
     * @param field The configuration record for the field
     * @param responseMap A map of the current json level Object
     * @param fieldsByNameMappings A Map by list object name, of the Items in the list available by a certain field value
     *
     * @return An object that can be cast to the field type.
     */
    private Object getFieldValue(Incoming_Integrated_Object_Field__mdt field, Map<String, Object> responseMap,
            Map<String, Map<String, Object>> fieldsByNameMappings) {

        return getFieldValue(field, responseMap, fieldsByNameMappings, null);
    }

    private Object getFieldValue(Incoming_Integrated_Object_Field__mdt field, Map<String, Object> responseMap,
            Map<String, Map<String, Object>> fieldsByNameMappings, String externalIdValue) {

        System.debug(LoggingLevel.DEBUG, 'Looking up value for Field: ' + field.Field_API_Name__c);
        Object fieldValue;
        Map<String, Object> lookupMap = responseMap;
        // First would need to see if Object Level 1 is set
        if (String.isNotBlank(field.Incoming_Object_Level_1__c) && lookupMap != null) {
            lookupMap = navigateIntoLevel(field.Level_1_Is_List__c, field.Level_1_Use_First_Item__c,
                    field.Incoming_Object_Level_1__c, field.Level_1_Match_Field_Name__c,
                    field.Level_1_Match_Field_Value__c, responseMap, fieldsByNameMappings);
        }

        // Next would need to see if Object Level 2 is set
        if (String.isNotBlank(field.Incoming_Object_Level_2__c) && lookupMap != null) {
            lookupMap = navigateIntoLevel(field.Level_2_Is_List__c, field.Level_2_Use_First_Item__c,
                    field.Incoming_Object_Level_2__c, field.Level_2_Match_Field_Name__c,
                    field.Level_2_Match_Field_Value__c, lookupMap, fieldsByNameMappings);
        }
        System.debug('>>>> lookupMap: ' + lookupMap);

        // Now retrieve the field specified and convert it.
        if (lookupMap != null) {
            Boolean setField=true;
            // If there is a conditional field value - it has to be at the same level
            // as the field itself.  And it has to be a boolean field type
            if (String.isNotBlank(field.Conditional_Field_Name__c)) {
                setField = (Boolean) lookupMap.get(field.Conditional_Field_Name__c);
            }
            // If an External Id was passed in, we only want to return values for that Id
            // For example, if this is a Borrower record, only return values for the Borrower
            // and not for the Co-Borrower.
            if (String.isNotBlank(externalIdValue)) {
                if ((externalIdValue.contains('Residence')
                        || externalIdValue.contains('Employment')
                        || externalIdValue.contains('Borrower'))
                        && (String)lookupMap.get('id') != externalIdValue) {
                    setField = false;
                }
            }
            if (setField) {
                // Check if this is a hard-coded field value in the metadata configuration
                if (field.Field_Value__c != null && field.Field_Value__c != 'NA') {
                    fieldValue = field.Field_Value__c;
                } else {
                    fieldValue = lookupMap.get(field.Incoming_Field_Name__c);
                }
            }
        }
        System.debug(LoggingLevel.DEBUG, 'About to return field value: ' + fieldValue);
        return fieldValue;
    }

    /**
     * Navigate into a level using the configuration values which means it could be an object or a list
     *
     * @param isList  config value if the object referred to is a list
     * @param useFirstItem if the object is a list should we just use the first item in the list
     * @param objectName what is the object name we will be retrieving
     * @param matchFieldName if the object is a list and we have to match a field value, what field are we looking at
     * @param matchFieldValue if the object is a list and we have to match a field value, what value should be matched
     * @param responseMap the response map we have so far
     * @param fieldsByNameMappings the mapping of fields by name to be used when we have to lookup a list record by a field
     *
     * @return the lookupMap after navigating into the object by the configuration
     */
    private Map<String, Object> navigateIntoLevel(Boolean isList, Boolean useFirstItem, String objectName,
            String matchFieldName, String matchFieldValue, Map<String, Object> responseMap,
            Map<String, Map<String, Object>> fieldsByNameMappings) {

        System.debug(LoggingLevel.DEBUG, 'InboundIntegrationService.navigateIntoLevel: ' + objectName);
        Map<String, Object> lookupMap = null;
        if ((isList && useFirstItem)) {
            List<Object> listValues = (List<Object>) responseMap.get(objectName);
            lookupMap = (Map<String, Object>) listValues.get(0);
        } else if (isList) {
            List<Object> listValues = (List<Object>) responseMap.get(objectName);
            // See if we have already created the mapping for this field
            Map<String, Object> mappings = fieldsByNameMappings.get(objectName);
            if (mappings == null) {
                mappings = createFieldsByNameMappings(matchFieldName, listValues);
                // Save this in the overall map for use on future fields
                fieldsByNameMappings.put(matchFieldName, mappings);
                // Now need to find the necessary value in mappings
                lookupMap = (Map<String, Object>) mappings.get(matchFieldValue);
            }
        } else {
            if (objectName.containsIgnoreCase('XML')) return null;
            lookupMap = (Map<String, Object>) responseMap.get(objectName);
        }
        System.debug(LoggingLevel.DEBUG, 'InboundIntegrationService.navigateIntoLevel: LookupValue after Lookup: ' + lookupMap);
        return lookupMap;
    }

    /**
     * This method will take an object list and create a map by the field value for the field name referenced in the
     * config.
     *
     * @param fieldName the name of the field that should be used to lookup a value
     * @param listValues The list of values to be converted to a map
     *
     * @return The map just created for the current list
     */
    private Map<String, Object> createFieldsByNameMappings(String fieldName, List<Object> listValues) {
        Map<String, Object> records = new Map<String, Object>();
        if (listValues != null) {
            for (Object item : listValues) {
                Map<String, Object> recordFields = (Map<String, Object>) item;
                if (recordFields != null) {
                    String fieldValue = (String) recordFields.get(fieldName);
                    if (fieldValue != null) {
                        records.put(fieldValue, item);
                    }
                }
            }
        }
        return records;
    }

    /**
     * This method will read the custom metadata configuration for what fields are possibly updated
     * for an integration, and will create the SF query to read the object and all the necessary fields
     * It matches based on the configuration external Id field to find the correct record.
     *
     * @param objectConfig The Integrated object config record that has embedded all the field conversions defined
     * @param externalIdValue The value to use to find the correct method in Salesforce
     *
     * @return a query string is returned
     */
    @TestVisible
    private String createSalesforceQuery(Incoming_Integrated_Object__mdt objectConfig, String externalIdValue) {
        String query;
        Set<String> fieldNames = new Set<String>();
        // Make Sure Id is always selected
        fieldNames.add('Id');

        for (Incoming_Integrated_Object_Field__mdt field: objectConfig.Incoming_Integrated_Object_Fields__r) {
            fieldNames.add(field.Field_API_Name__c);
        }
        // Select fields
        query = 'SELECT ' + String.join(new List<String>(fieldNames),',');
        // From the object in the configuration
        query += ' FROM ' + objectConfig.SObject_API_Name__c;
        // Add the condition matching the external Id
        query += ' WHERE ' + objectConfig.External_Id_Field_API_Name__c + ' = \'' + externalIdValue + '\'';

        System.debug(LoggingLevel.DEBUG, 'Query created for object: ' + objectConfig.Object__c + ' is: ' + query);
        return query;
    }
}