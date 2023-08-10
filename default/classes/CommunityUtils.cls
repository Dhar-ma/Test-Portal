public class CommunityUtils {
  @AuraEnabled(cacheable=true)
  public static ActionResult checkUserType() {
    try {
      Boolean isLoggedIn = false;
      String userType = UserInfo.getUserType();
      if (userType != 'Guest') {
        isLoggedIn = true;
      }
      return new ActionResult(
        new Map<string, object>{ 'isLoggedIn' => isLoggedIn }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled(cacheable=true)
  public static user fetchUser() {
    // query current user information
    User userInfo = [
      SELECT Id, ContactId, AccountId
      FROM User
      WHERE Id = :userInfo.getUserId()
    ];
    return userInfo;
  }

  @AuraEnabled(cacheable=true)
  public static ActionResult getDependetPicklistValues(
    sObject objDetail,
    string contrfieldApiName,
    string depfieldApiName,
    String productTypeField
  ) {
    try {
      Map<String, List<String>> caseTypeReasonMap = GetDependentPicklist.getDependentMap(
        objDetail,
        contrfieldApiName,
        depfieldApiName
      );
      Map<String, Map<String, Object>> caseReasonProductTypeMap = getProductTypeConfig();
      Map<String, Map<String, Object>> financialAccountTypeMap = getFinancialAccountTypeConfig();

      return new ActionResult(
        new Map<string, object>{
          'caseTypeReasonMap' => caseTypeReasonMap,
          'caseReasonProductTypeMap' => caseReasonProductTypeMap,
          'mortgageCaseTypeList' => getCaseTypeMetadataRecords(),
          'financialAccountTypeMap' => financialAccountTypeMap,
          'isMortgageCommunity' => getEnableCommunityRecords()
        }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled(cacheable=true)
  public static ActionResult getMortgageDependetPicklistValues() {
    try {
      List<String> CaseTypeList = getCaseTypeMetadataRecords();
      return new ActionResult(
        new Map<string, object>{ 'caseTypeList' => CaseTypeList }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  public static List<String> getCaseTypeMetadataRecords() {
    Mortgage_Case_Type_List__mdt[] Case_Type_List = [
      SELECT MasterLabel, QualifiedApiName, Case_Type__c
      FROM Mortgage_Case_Type_List__mdt
    ];

    List<String> CaseTypeList = new List<String>();

    for (Mortgage_Case_Type_List__mdt record : Case_Type_List) {
      CaseTypeList.add(record.Case_Type__c);
    }

    return CaseTypeList;
  }

  public static Boolean getEnableCommunityRecords() {
    Enable_Mortgage_Community__mdt[] Community_List = [
      SELECT MasterLabel, QualifiedApiName, Enable_Mortgage_Community__c
      FROM Enable_Mortgage_Community__mdt
    ];
    if (!Community_List.isEmpty()) {
      return Community_List[0].Enable_Mortgage_Community__c;
    }
    return false;
  }

  public static Map<String, Map<String, Object>> getProductTypeConfig() {
    Map<String, Map<String, Object>> caseReasonProductTypeMap = new Map<String, Map<String, Object>>();

    List<Action_Type_Config__c> lstActionTypeConfigs = [
      SELECT
        Id,
        Action_Type__c,
        Values__c,
        Service_Type__c,
        Additional_Case_Fields__c,
        Disclosure__c
      FROM Action_Type_Config__c
      WHERE Config_Type__c = 'Product Type'
    ];

    for (Action_Type_Config__c actionConfig : lstActionTypeConfigs) {
      if (!caseReasonProductTypeMap.containsKey(actionConfig.Service_Type__c))
        caseReasonProductTypeMap.put(
          actionConfig.Service_Type__c,
          new Map<String, Object>()
        );

      Map<String, Object> serviceTypeMap = caseReasonProductTypeMap.get(
        actionConfig.Service_Type__c
      );

      if (!serviceTypeMap.containsKey(actionConfig.Action_Type__c))
        serviceTypeMap.put(
          actionConfig.Action_Type__c,
          new ActionTypeConfig(
            actionConfig.Values__c,
            actionConfig.Additional_Case_Fields__c,
            actionConfig.Disclosure__c
          )
        );

      caseReasonProductTypeMap.put(
        actionConfig.Service_Type__c,
        serviceTypeMap
      );
    }

    return caseReasonProductTypeMap;
  }

  public static Map<String, Map<String, Object>> getFinancialAccountTypeConfig() {
    Map<String, Map<String, Object>> financialAccountTypeMap = new Map<String, Map<String, Object>>();

    List<Action_Type_Config__c> lstActionTypeConfigs = [
      SELECT
        Id,
        Action_Type__c,
        Values__c,
        Service_Type__c,
        Additional_Case_Fields__c,
        Disclosure__c
      FROM Action_Type_Config__c
      WHERE Config_Type__c = 'Financial Account'
    ];

    for (Action_Type_Config__c actionConfig : lstActionTypeConfigs) {
      if (!financialAccountTypeMap.containsKey(actionConfig.Service_Type__c))
        financialAccountTypeMap.put(
          actionConfig.Service_Type__c,
          new Map<String, Object>()
        );

      Map<String, Object> serviceTypeMap = financialAccountTypeMap.get(
        actionConfig.Service_Type__c
      );

      if (!serviceTypeMap.containsKey(actionConfig.Action_Type__c))
        serviceTypeMap.put(
          actionConfig.Action_Type__c,
          new ActionTypeConfig(
            actionConfig.Values__c,
            actionConfig.Additional_Case_Fields__c,
            actionConfig.Disclosure__c
          )
        );

      financialAccountTypeMap.put(actionConfig.Service_Type__c, serviceTypeMap);
    }

    return financialAccountTypeMap;
  }

  @AuraEnabled
  public static ActionResult saveAssociateProductTypes(
    String productTypes,
    String caseId
  ) {
    List<String> productTypeList = (List<String>) JSON.deserialize(
      productTypes,
      List<String>.class
    );
    List<Associate_Case_Product__c> caseList = new List<Associate_Case_Product__c>();
    try {
      for (String product : productTypeList) {
        Associate_Case_Product__c productType = new Associate_Case_Product__c();
        productType.Product_Type__c = product;
        productType.Case__c = caseId;
        caseList.add(productType);
        System.debug('product : ' + product);
      }
      insert caseList;
      return new ActionResult(
        new Map<string, object>{ 'message' => 'Records created successfully' }
      );
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  @AuraEnabled(cacheable=true)
  public static ActionResult getFinancialAccounts() {
    try {
      User userInfo = [
        SELECT ContactId
        FROM User
        WHERE Id = :UserInfo.getUserId()
      ];
      Contact personAccount = [
        SELECT Id, AccountId
        FROM Contact
        WHERE Id = :userInfo.ContactId
        LIMIT 1
      ];
      List<FinServ__FinancialAccount__c> financialAccounts = [
        SELECT
          Id,
          Name,
          RecordType.Name,
          FinServ__FinancialAccountType__c,
          Account_Last_4_digits__c
        FROM FinServ__FinancialAccount__c
        WHERE FinServ__PrimaryOwner__c = :personAccount.AccountId
      ];

      ActionResult result = new ActionResult();
      result.isSuccess = true;
      result.data = financialAccounts;
      return result;
    } catch (Exception exec) {
      System.debug(exec);
      return new ActionResult(exec);
    }
  }

  public class ActionTypeConfig {
    @AuraEnabled
    public List<String> productTypeValues;
    @AuraEnabled
    public List<String> additionalInputFields;
    @AuraEnabled
    public String disclosure = '';
    public ActionTypeConfig(
      String productValues,
      String additionalFields,
      String disclosure
    ) {
      if (String.isNotBlank(productValues))
        this.productTypeValues = productValues.split(',');
      else
        this.productTypeValues = new List<String>();

      if (String.isNotBlank(additionalFields))
        this.additionalInputFields = additionalFields.split(',');
      else
        this.additionalInputFields = new List<String>();

      this.disclosure = disclosure;
    }
  }
}