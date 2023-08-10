import { LightningElement, api, track, wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import createQuestionTask from '@salesforce/apex/UserTaskActionLWCCtrl.createQuestionTask';
import fetchMemberDocumentList from '@salesforce/apex/UserTaskActionLWCCtrl.fetchMemberDocumentList';
import createReUploadTask from '@salesforce/apex/UserTaskActionLWCCtrl.createReUploadTask';

const columns = [
    { label: 'Document Name', fieldName: 'Name', sortable: false, }
];

export default class requestTaskActionForUser extends LightningElement {

    @api recordId;
    @track spinner;
    @track questionText;
    @track priority;
    @track dueDate;
    @track description;
    @track columns = columns;
    @track data = [];
    @track isDataAvailable=false;

    genericOnChange(event){
        this[event.target.name] = event.target.value;
    }

    connectedCallback() {
       this.getMemberDocumentList();
    }

    getMemberDocumentList(){
        fetchMemberDocumentList({
            appId: this.recordId
        }).then(result => {
            this.spinner = false;
            if (result.isSuccess) {
                var resultMap = result.data;
                console.log('resultMap', resultMap);
                if(resultMap.listFile_Type.length > 0){
                    this.isDataAvailable = true;
                    this.data = resultMap.listFile_Type;
                }
            }
            else {
                this.spinner = false;
                console.error(result);
                this.showToastMessage('Error', result.error, 'error');
            }
        }).catch(error => {
            // eslint-disable-next-line no-console
            this.showToastMessage('Error', JSON.stringify(error), 'error');
            this.spinner = false;
        });
    }

    cancelAction() {
        const valueChangeEvent = new CustomEvent("modalclose", {
            detail: {}
        });
        // Fire the custom event
        this.dispatchEvent(valueChangeEvent);
    }

    createQuestionTask(){

        let isValid = this.isValidForm();
        if (isValid) {
            this.spinner = true;
            var taskRec = {
                Description: this.questionText,
                Subject: this.questionText,
                Priority : this.priority,
                ActivityDate: this.dueDate
            };
            createQuestionTask({
                recordId: this.recordId,
                taskJsonStr: JSON.stringify(taskRec)
            }).then(result => {
                this.spinner = false;
                if (result.isSuccess) {
                    var resultMap = result.data;                    
                    this.showToastMessage('Success', resultMap.Success, 'success');
                    this.cancelAction();
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

    createReUploadTask(){

        let selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();

        if(selectedRows.length > 0 ){

            console.log('selectedRows', selectedRows);

            var taskRec = {
                Priority : this.priority,
                ActivityDate: this.dueDate,
                Description: this.description
            };

            this.spinner = true;
            createReUploadTask({
                recordId: this.recordId,
                selectedDocumentsStr: JSON.stringify(selectedRows),
                taskJsonStr: JSON.stringify(taskRec)
            }).then(result => {
                this.spinner = false;
                if (result.isSuccess) {
                    var resultMap = result.data;
                    this.showToastMessage('Success', resultMap.Success, 'success');
                    this.cancelAction();
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

        }else{
            this.showToastMessage('Error', "Please select at least one row", 'error');
        }

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

    get priorityOptions() {
        return [
            {
                "label": "High", "value": "High"
            },
            {
                "label": "Medium", "value": "Medium"
            },
            {
                "label": "Low", "value": "Low"
            }
        ];
    }
}