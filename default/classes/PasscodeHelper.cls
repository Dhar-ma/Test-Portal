/**
 * @description       :
 * @author            : Dharmraj Baravkar
 * @group             :
 * @last modified on  : 11-28-2022
 * @last modified by  : Dharmraj Baravkar
 **/
public class PasscodeHelper {
  static String passcodeGenerator() {
    integer len = 8;
    final String chars = 'ABCD01234EFGabcdeHISTUVWXYZ5678JKLMNOPQR9fghijklmnopqrstuvwxyz';
    String randStr = '';
    while (randStr.length() < len) {
      Integer idx = Math.mod(
        Math.abs(Crypto.getRandomInteger()),
        chars.length()
      );
      randStr += chars.substring(idx, idx + 1);
    }
    return randStr;
  }

  public static void addPasscodes(list<Candidate__c> newCandidates) {
    integer i = 0;
    List<Candidate__c> candidatelist = new List<Candidate__c>();
    while (i < newCandidates.size()) {
      string passcode = passcodeGenerator();
      //get the same passcode
      Integer cnt = [
        SELECT COUNT()
        FROM Candidate__c
        WHERE Pass_Code__c = :passcode
      ];
      if (cnt == 0) {
        Candidate__c candi = new Candidate__c();
        candi.Id = newCandidates[i].Id;
        candi.Pass_Code__c = passcode;
        candidatelist.add(candi);
        i++;
      }
    }
    upsert candidatelist;
  }
}
