import { api, LightningElement } from "lwc";
import NAME_FIELD from "@salesforce/schema/Candidate_Test__c.Name";

export default class ResultForm extends LightningElement {
  nameField = NAME_FIELD;

  // Flexipage provides recordId and objectApiName
  @api recordId;
  objectApiName = "Candidate_Test__c";
}