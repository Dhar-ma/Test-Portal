/**
 * @description       :
 * @author            :
 * @group             :
 * @last modified on  : 04-18-2023
 * @last modified by  :
 **/
public with sharing class ListViewComponentController {
  @AuraEnabled(cacheable=true)
  public static List<Task> getOpenTask() {
    try {
      List<String> optionList = new List<String>{
        'In Progress',
        'Open',
        'Not Started'
      };
      return [
        SELECT
          Id,
          Subject,
          Who.Name,
          WhoId,
          What.Name,
          WhatId,
          Status,
          ActivityDate
        FROM Task
        WHERE Status IN :optionList
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled(cacheable=true)
  public static DataResult getListViewRecord(
    List<String> fieldApiNameList,
    String objectName
  ) {
    Boolean isData = false;
    User currentUser = [
      SELECT Id, AccountId, ContactId
      FROM User
      WHERE Id = :UserInfo.getUserId()
    ];
    String currentUserId = currentUser.Id;
    System.debug('fieldApiNameList:' + fieldApiNameList);
    System.debug('objectName:' + objectName);
    string fieldes = fieldApiNameList.toString();
    fieldes = fieldes.replace(')', '');
    fieldes = fieldes.replace('(', '');
    fieldes = fieldes.trim();
    System.debug(fieldes);

    String queryCase =
      'SELECT Id, ' +
      fieldes +
      ', CreatedById FROM ' +
      objectName +
      ' WHERE CreatedById =: currentUserId';

    system.debug('queryCase:' + queryCase);
    List<SObject> objectQuery = Database.query(queryCase);
    if (objectQuery.size() > 0) {
      isData = true;
    }
    DataResult dr = new DataResult();
    dr.obj = objectQuery;
    dr.isData = isData;
    System.debug('objectQuery:' + objectQuery);
    return dr;
  }
  @AuraEnabled(cacheable=true)
  public static List<SObject> getObjectListViewRecord(
    String objectName,
    String listViewName
  ) {
    try {
      System.debug('objectName:' + objectName);
      System.debug('listViewName:' + listViewName);

      ListView listview = [
        SELECT Id, Name, DeveloperName, SobjectType, IsSoqlCompatible
        FROM ListView
        WHERE SobjectType = :objectName AND DeveloperName = :listViewName
        LIMIT 1
      ];

      System.debug('listview:' + listview);

      String query = getListviewFilters(listview.Id, objectName);

      System.debug('query:' + query);

      List<SObject> objectQuery = Database.query(query);
      System.debug('objectQuery:' + objectQuery);
      System.debug('objectQuery.size:' + objectQuery.size());
      return objectQuery;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  public static String getListviewFilters(String filterId, String objectName) {
    HttpRequest req = new HttpRequest();
    String baseUrl = URL.getSalesforceBaseUrl().toExternalForm();
    String endPoinURL =
      baseUrl +
      '/services/data/v50.0/sobjects/' +
      objectName +
      '/listviews/' +
      filterId +
      '/describe';
    req.setEndpoint(endPoinURL);
    req.setMethod('GET');
    req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
    Http http = new Http();
    String query;
    HttpResponse response = http.send(req);
    if (response.getStatusCode() == 200) {
      Map<String, Object> tokenResponse = (Map<String, Object>) JSON.deserializeUntyped(
        response.getBody()
      );
      query = (String) tokenResponse.get('query');
      System.debug(query);
    }
    system.debug('response:' + response);
    return query;
  }

  public class DataResult {
    @AuraEnabled
    public List<SObject> obj;
    @AuraEnabled
    public Boolean isData;
  }
}