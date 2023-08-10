/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 03-15-2023
 * @last modified by  : 
**/
public without sharing class CustomLookupController {

    @AuraEnabled(cacheable=true)
    public static List<RecordsData> fetchRecords(String objectName, String filterField, String searchString, String value, String whereClause) {
        try {
            List<RecordsData> recordsDataList = new List<RecordsData>();
            String query = 'SELECT Id, ' + filterField + ' FROM '+objectName;
            if(String.isNotBlank(value)) {
                query += ' WHERE Id = \''+ value + '\' LIMIT 49999';
            } else {
                query += ' WHERE '+filterField+
                		' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\'';
                if(String.isNotBlank(whereClause)){
                    query += ' AND ' + whereClause;
                }
            }
            System.debug(' query ' + query);
	        for(SObject s : Database.query(query)) {
	            recordsDataList.add( new RecordsData((String)s.get(filterField), (String)s.get('id')) );
	        }
            return recordsDataList;
	    } catch (Exception err) {
	    	if ( String.isNotBlank( err.getMessage() ) && err.getMessage().contains( 'error:' ) ) {
                throw new AuraHandledException(err.getMessage().split('error:')[1].split(':')[0] + '.');
            } else {
                throw new AuraHandledException(err.getMessage());
            }
	    }
    }

    public class RecordsData {
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        public RecordsData(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }
}