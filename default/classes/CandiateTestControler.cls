/**
 * @description       :
 * @author            : Dharmraj Baravkar
 * @group             :
 * @last modified on  : 11-29-2022
 * @last modified by  : Dharmraj Baravkar
 **/
public without sharing class CandiateTestControler {
  @AuraEnabled(cacheable=true)
  public static Candidate__c validateCandidate(String Email, String Passcode) {
    Candidate__c[] candidate = [
      SELECT id, Sart_Test__c, Email__c, Pass_Code__c, Test_Cancel_Reason__c
      FROM Candidate__c
      WHERE Email__c = :Email OR Pass_Code__c = :Passcode
      LIMIT 1
    ];
    Boolean validate = false;
    if (candidate.size() > 0) {
    }
    return candidate[0];
  }
  @AuraEnabled
  public static Boolean updateStartTest(String Email, String Passcode) {
    System.debug('updateStartTest ');
    Candidate__c[] candidate = [
      SELECT id, Name, Sart_Test__c
      FROM Candidate__c
      WHERE Email__c = :Email AND Pass_Code__c = :Passcode
    ];
    System.debug('candidate ' + candidate);

    Boolean isSelect = false;
    if (candidate.size() > 0) {
      candidate[0].Sart_Test__c = true;
    }
    update candidate;
    return candidate[0].Sart_Test__c;
  }
  @AuraEnabled(cacheable=true)
  public static Test_Set__c assignRandomQuestionSet() {
    String questionset;
    list<Test_Set__c> test_sets = [
     SELECT Id, Name, Duration__c, Number_of_Questions__c
      FROM Test_Set__c  
      WHERE isActive__c = true
    ];
    Integer randomIndex;
    Integer arrayLength = test_sets.size();
    randomIndex = Integer.valueof((Math.random() * arrayLength));
    return test_sets[randomIndex];
  }

  @AuraEnabled(cacheable=true)
  public static list<Test_Questions__c> getTestQuestions(
    String question_setId,
    Integer questionCount
  ) {
    list<Test_Questions__c> questions_with_options = [
      SELECT
        Id,
        Question__c,
        Multiple_Selection__c,
        CreatedById,
        (SELECT id, Option_Description__c FROM Test_Question_Options__r)
      FROM Test_Questions__c
      WHERE Test_Set__c = :question_setId
      ORDER BY CreatedById
      LIMIT :questionCount
    ];
    return questions_with_options;
  }

  @AuraEnabled
  public static id createCandidateTest(
    String email,
    String passcode,
    String testid
  ) {
    id candidateTestId;
    System.debug('Data ' + email + ' p' + passcode + ' ' + testid);
    Candidate__c[] candidateList = [
      SELECT id, Name, Last_Name__c
      FROM Candidate__c
      WHERE Email__c = :email AND Pass_Code__c = :passcode
    ];
    String Name = candidateList[0].Name;
    Name = Name + ' ';
    Name = Name + candidateList[0].Last_Name__c;
    Name = Name + ' Test';

    Candidate_Test__c test = new Candidate_Test__c(
      Candidate__c = candidateList[0].id,
      Name = Name,
      Test_Set__c = testid
    );
    insert test;
    if (test.Id != NULL) {
      PasscodeHelper.addPasscodes(candidateList);
    }
    candidateTestId = test.id;
    return candidateTestId;
  }
  private static Map<String, Set<String>> getQuestionWithAns(
    Set<String> questionid
  ) {
    Map<String, Set<String>> resultmap = new Map<String, Set<String>>();

    for (Test_Questions__c questionans : [
      SELECT
        Id,
        (SELECT id FROM Test_Question_Options__r WHERE Correct_Option__c = TRUE)
      FROM Test_Questions__c
      WHERE id IN :questionid
    ]) {
      Set<String> ansr = new Set<String>();
      for (Test_Question_Option__c ans : questionans.Test_Question_Options__r) {
        ansr.add(ans.id);
      }
      resultmap.put(questionans.id, ansr);
    }
    return resultmap;
  }
  @AuraEnabled
  public static void calculateCandidateTestResult(
    String optionAndQesIdsJson,
    String questionSetId,
    String candiatetestid,
    Integer questionCount
  ) {
    Integer marks = 0;
    System.debug('optionAndQesIdsJson:' + optionAndQesIdsJson);
    Map<String, Set<String>> testQueans = (Map<String, Set<String>>) JSON.deserialize(
      optionAndQesIdsJson,
      Map<String, Set<String>>.class
    );
    System.debug('questionSetId:' + questionSetId);
    map<String, Set<String>> queans = getQuestionWithAns(testQueans.keySet());
    for (String testque : testQueans.keySet()) {
      Boolean res = queans.get(testque).equals(testQueans.get(testque));
      if (res) {
        marks++;
      }
    }
    System.debug('Total Marks: ' + marks);
    Candidate_Test__c test = new Candidate_Test__c(
      Id = candiatetestid,
      Score__c = marks,
      Total_Marks__c = questionCount,
      Json_Result__c = optionAndQesIdsJson
    );
    update test;
  }

  @AuraEnabled
  public static Boolean tabDetection(
    String Email,
    String Passcode,
    String tabValue
  ) {
    Candidate__c[] candidate = [
      SELECT id, Sart_Test__c, Email__c, Pass_Code__c, Test_Cancel_Reason__c
      FROM Candidate__c
      WHERE Email__c = :Email AND Pass_Code__c = :Passcode
    ];
    Boolean testCancelReson;
    if (candidate.size() > 0) {
      if (tabValue == 'hidden') {
        candidate[0].Test_Cancel_Reason__c = 'Tab Change';
        testCancelReson = true;
      } else {
        candidate[0].Test_Cancel_Reason__c = ' ';
        testCancelReson = false;
      }
    }

    update candidate;
    return testCancelReson;
  }
}