import { LightningElement, api, track } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import fetchTaskDetails from '@salesforce/apex/UserTaskActionLWCCtrl.fetchTaskDetails';
import saveTaskDetails from '@salesforce/apex/UserTaskActionLWCCtrl.saveTaskDetails';
import completeTask from '@salesforce/apex/UserTaskActionLWCCtrl.completeTask';

export default class ResponseTaskActionOfUser extends LightningElement {

    @api recordId;
    @track spinner;
    @track taskRec;
    @track answerText;
    @track fileTypeIds;
    @track sObjName;

    get recordIdAvailable() {
        return this.recordId ? true : false;
    }

    get showQuestionForm() {

        if(this.taskRec && this.taskRec.Action_Type__c == 'Question'){
            return true;
        }
        return false;
    }

    get showFileUploadForm() {

        if(this.taskRec && this.taskRec.Action_Type__c == 'Document Upload' && this.fileTypeIds){
            return true;
        }
        return false;
    }

    get isCaseObject() {
        return this.sObjName === "Case";
    }

    get isApplicationObject() {
        return this.sObjName === "ResidentialLoanApplication";
    }

    connectedCallback() {
        this.getInitialData();
     }
 
    getInitialData(){
        fetchTaskDetails({
             taskId: this.recordId
         }).then(result => {
             this.spinner = false;
             if (result.isSuccess) {
                 var resultMap = result.data;
                 console.log('resultMap', resultMap);                
                 this.taskRec = resultMap.taskRec;
                 this.fileTypeIds = resultMap.fileTypeIds;
                 this.answerText = resultMap.taskRec.Answer__c;
                 this.sObjName = resultMap.sObjName;
             }
             else {
                 this.spinner = false;
                 this.showToastMessage('Error', result.error, 'error');
             }
         }).catch(error => {
             // eslint-disable-next-line no-console
             this.showToastMessage('Error', JSON.stringify(error), 'error');
             this.spinner = false;
         });
     }
     
    saveTask(){
        let isValid = this.isValidForm();
        if (isValid) {
            this.spinner = true;
            saveTaskDetails({
                taskId: this.recordId,
                answerText: this.answerText
            }).then(result => {
                this.spinner = false;
                if (result.isSuccess) {
                    var resultMap = result.data;
                    this.showToastMessage('Success', resultMap.Success, 'success');
                    eval("$A.get('e.force:refreshView').fire();");
                }
                else {
                    this.spinner = false;
                    this.showToastMessage('Error', result.error, 'error');
                }
            }).catch(error => {
                // eslint-disable-next-line no-console
                this.showToastMessage('Error', JSON.stringify(error), 'error');
                this.spinner = false;
            });
        }
    }

    completeTask(){
        let isValid = this.isValidForm();
        if (isValid) {
            this.spinner = true;
            completeTask({
                taskId: this.recordId
            }).then(result => {
                this.spinner = false;
                if (result.isSuccess) {
                    var resultMap = result.data;
                    this.showToastMessage('Success', resultMap.Success, 'success');
                    eval("$A.get('e.force:refreshView').fire();");
                }
                else {
                    this.spinner = false;
                    this.showToastMessage('Error', result.error, 'error');
                }
            }).catch(error => {
                // eslint-disable-next-line no-console
                this.showToastMessage('Error', JSON.stringify(error), 'error');
                this.spinner = false;
            });
        }
    }

    genericOnChange(event){
        this[event.target.name] = event.target.value;
    }

     showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }

    isValidForm(){
        const allValid = [...this.template.querySelectorAll('.form__field')]
            .reduce((validSoFar, inputCmp) => {
                if( !inputCmp.value && inputCmp.required){
                    validSoFar = false;
                    inputCmp.setCustomValidity("Complete this field.");

                }else if( inputCmp.required && inputCmp.value && !inputCmp.value.trim()){
                    validSoFar = false;
                    inputCmp.setCustomValidity("Complete this field.");
                }else{
                    inputCmp.setCustomValidity("");
                }
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        return allValid;
    }
}