/**
 * @description       :
 * @author            :
 * @group             :
 * @last modified on  : 03-15-2023
 * @last modified by  :
 **/
public with sharing class ReusableLookupController {
  @AuraEnabled(cacheable=true)
  public static List<ResultWrapper> fetchRecords(SearchWrapper inputWrapper) {
    try {
      if (inputWrapper != null) {
        String query =
          'SELECT Id, ' +
          inputWrapper.fieldApiName +
          ' FROM ' +
          inputWrapper.objectApiName;
        if (String.isNotBlank(inputWrapper.value)) {
          query += ' WHERE Id = \'' + inputWrapper.value + '\' LIMIT 49999';
        } else {
          query +=
            ' WHERE ' +
            inputWrapper.fieldApiName +
            ' LIKE ' +
            '\'' +
            String.escapeSingleQuotes(inputWrapper.searchString.trim()) +
            '%\'';
          if (String.isNotBlank(inputWrapper.whereClause)) {
            query += ' AND ' + inputWrapper.whereClause;
          }
        }
        System.debug('query:' + query);
        List<ResultWrapper> returnWrapperList = new List<ResultWrapper>();
        for (SObject s : Database.query(query)) {
          ResultWrapper wrap = new ResultWrapper();
          wrap.mainField = (String) s.get(inputWrapper.fieldApiName);
          wrap.id = (String) s.get('id');
          returnWrapperList.add(wrap);
        }
        return returnWrapperList;
      }
      return null;
    } catch (Exception err) {
      throw new AuraHandledException(err.getMessage());
    }
  }

  public class ResultWrapper {
    @AuraEnabled
    public String mainField { get; set; }
    @AuraEnabled
    public String subField { get; set; }
    @AuraEnabled
    public String id { get; set; }
  }

  public class SearchWrapper {
    @AuraEnabled
    public String objectApiName { get; set; }
    @AuraEnabled
    public String fieldApiName { get; set; }
    @AuraEnabled
    public String searchString { get; set; }
    @AuraEnabled
    public String whereClause { get; set; }
    @AuraEnabled
    public String value { get; set; }
  }
}