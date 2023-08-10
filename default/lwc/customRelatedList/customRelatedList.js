import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';
import { getListUi } from 'lightning/uiListApi';
import getRecords from '@salesforce/apex/CustomRelatedListController.getRecords';
import deleteRecord from '@salesforce/apex/CustomRelatedListController.deleteRecord';

const NUMBER_OF_RECORDS_TO_DISPLAY = 5;
export default class CustomRelatedList extends NavigationMixin(LightningElement) {
    allRecords;
    childObjectInfo = {};
    childRelationshipName;
    clickedRecord;
    deleteModalTitle;
    displayViewMore = false;
    iconStyle;
    listViewData;
    numberOfRecords;
    showNotificationModal = false;
    showSpinner = true;
    title;
    titleUrl;
    recordsDisplayed = NUMBER_OF_RECORDS_TO_DISPLAY;
    @api childObjectName;
    @api fieldOneApiName;
    @api fieldTwoApiName;
    @api fieldThreeApiName;
    @api fieldFourApiName;
    @api filterCriteria;
    @api iconName;
    @api layoutType;
    @api listViewApiName;
    @api objectAPIName;
    @api parentObjectName;
    @api recordId;
    @api theRecordId;
    @api titleOverride;
    @api type;
    @api urlPrefix;
    @track fieldInfo;
    @track records;

    /**
     * @description Retrieve Current Record Info in order to get current Object Api Name
     * @function wiredCurrentRecord
     * @param {*} param0 
     */
    @wire(getRecord, {recordId: '$theRecordId', layoutTypes:'Full', modes:'View'})
    wiredCurrentRecord({ error, data }) {
        if(data) {
            this.parentObjectName = data.apiName;
            this.childObjectName = this.objectAPIName;
        }
        else if(error) {
            console.error(error);
            this.showSpinner = false;
        }
    }

    @wire(getListUi, {objectApiName:'$objectAPIName', listViewApiName:'$listViewApiName'})
    getWiredListView({error, data}) {
        if(data) {
            console.log('listviewdata:', data);
            this.listViewData = data;
            // this.fieldInfo = this.setFields(data.info.displayColumns);
            this.theRecordId = this.recordId;
        }
        if(error) {
            console.error(error);
        }
    }

    /**
     * @description Set icon and title for Child Object
     * @function getWiredParentObjectInfo
     * @param {*} param0 
     */
    @wire(getObjectInfo, { objectApiName: '$parentObjectName' })
    getWiredParentObjectInfo({error, data}) {
        if(data) {

            let relationship = this.getChildRelationship(data.childRelationships, this.objectAPIName);
            this.childRelationshipName = relationship.relationshipName;
            if(this.type == 'Internal') {
                this.titleUrl = `/lightning/r/${this.recordId}/related/${this.childRelationshipName}/view`;
            }
        }
        if(error) {
            console.error(error);
            this.showSpinner = false;
        }
    }

    /**
     * @description Set icon and title for Child Object
     * @function getWiredChildObjectInfo
     * @param {*} param0 
     */
    @wire(getObjectInfo, { objectApiName: '$childObjectName' })
    getWiredChildObjectInfo({error, data}) {
        if(data) {
            console.log('4', data);
            this.iconName = data.themeInfo.iconUrl;
            this.iconStyle = 'background-color:#' + data.themeInfo.color + ';';
            this.setTitles(data.label, data.labelPlural);
            let listViewColumns = this.removeNameFieldFromListViewColumns(data.nameFields[0]);
            this.fieldInfo = this.setFields(listViewColumns);
            //this.fieldInfo = this.setFieldInfo(data);
            this.childObjectInfo.fieldApiName = this.getReferenceField(data.fields);
            this.childObjectInfo.nameField = data.nameFields[0];
            this.retrieveRecords();
        }
        if(error) {
            console.error(error);
            this.showSpinner = false;
        }
    }

    removeNameFieldFromListViewColumns(nameField) {
        let columns = [...this.listViewData.info.displayColumns];

        columns.forEach(column => {
            if (column.fieldApiName == nameField) {
                columns.splice(columns.indexOf(column),1);
            }
            if(column.fieldApiName.includes('__r.Name')) {
                let index = columns.indexOf(column);
                let newColumn = {...column};
                newColumn.fieldApiName = newColumn.fieldApiName.replace('__r.Name', '__c');
                columns.splice(index,1,newColumn);
            }
        })
        console.log('columns:', columns);
        return columns;
    }

    setFields(columns) {
        let fieldInfo = {};
        let fields = [];
        if(columns && columns.length > 0) {
            if(columns[0]) {
                fieldInfo.fieldOne = {apiName:columns[0].fieldApiName, label:columns[0].label};
                fields.push(columns[0].fieldApiName);
            }
            if(columns[1]) {
                fieldInfo.fieldTwo = {apiName:columns[1].fieldApiName, label:columns[1].label};
                fields.push(columns[1].fieldApiName);
            }
            if(columns[2]) {
                fieldInfo.fieldThree = {apiName:columns[2].fieldApiName, label:columns[2].label};
                fields.push(columns[2].fieldApiName);
            }
            if(columns[3]) {
                fieldInfo.fieldFour = {apiName:columns[3].fieldApiName, label:columns[3].label};
                fields.push(columns[3].fieldApiName);
            }
        }
        this.childObjectInfo.apiName = this.objectAPIName;
        this.childObjectInfo.filter = this.filterCriteria;
        this.childObjectInfo.fields = fields;
        console.log('fieldInfo:', fieldInfo);
        return fieldInfo;
    }

    /**
     * @description Retieves the child relationship object for a given child object
     * @function getChildRelationship
     * @param {array} childRelationships List of child relationships for the current object that component is on
     * @param {String}  objectApiName Object API Name for the record this component is on
     * @return Child relationship object for given object
     */
    getChildRelationship(childRelationships, objectApiName) {
        let childRelationship = childRelationships.find(relationship => relationship.childObjectApiName == objectApiName);
        if(childRelationship) {
            return childRelationship;
        }
        else {
            console.warn('Object does not have a child relationship to ' + objectApiName);
        }
    }

    setTitles(label, pluralLabel) {
        this.title = this.titleOverride ? this.titleOverride : pluralLabel;
        this.deleteModalTitle = 'Delete ' + label;
        this.deleteModalMessage = 'Are you sure you want to delete this ' + label + '?';
        this.childObjectInfo.label = label;
    }

    getReferenceField(fields) {
        let referenceField;
        for(const fieldInfo in fields) {
            let field = fields[fieldInfo];
            if(field.reference) {
                if(field.referenceToInfos && field.referenceToInfos.length > 0) {
                    if(field.referenceToInfos[0].apiName == this.parentObjectName) {
                        referenceField = field.apiName;
                    }
                }
            }
        }
        return referenceField;
    }

    buildChildObject() {
        this.childObjectInfo.apiName = this.objectAPIName;
        let fields = [];
        if(this.fieldOneApiName) fields.push(this.fieldOneApiName);
        if(this.fieldTwoApiName) fields.push(this.fieldTwoApiName);
        if(this.fieldThreeApiName) fields.push(this.fieldThreeApiName);
        if(this.fieldFourApiName) fields.push(this.fieldFourApiName);
        this.childObjectInfo.fields = fields;
        this.childObjectInfo.filter = this.filterCriteria;
    }

    retrieveRecords() {
        console.log('childObjectInfo:', JSON.parse(JSON.stringify(this.childObjectInfo)))
        getRecords({
            childObjectInfo:JSON.stringify(this.childObjectInfo),
            parentRecordId:this.recordId
        })
        .then(data => {
            console.log('5', data);
            this.allRecords = data;
            this.numberOfRecords = this.setNumberOfRecords(data);
            console.log('numberOfRecords:', this.numberOfRecords);
            if(data && data.length > 0) {
                let records = this.setRecordsToDisplay(data);
                console.log('records:', records);
                records = this.setNameField(records);
                this.records = this.setNameURL(records);
            }
            this.showSpinner = false;
        })
        .catch(error => {
            console.error(error);
            this.showSpinner = false;
        });
    }

    /**
     * @description Sets the label for the number of records available, displayed to right of title
     * @function setNumberOfRecords
     * @param {Array} records List of Child records
     * @return Label for number of records available
     */
    setNumberOfRecords(records) {
        if(records && records.length > 0) {
            if(records.length > this.recordsDisplayed) {
                this.displayViewMore = true;
                return '(' + this.recordsDisplayed.toString() + '+)';
            }
            else {
                this.displayViewMore = false;
                return '(' + records.length.toString() + ')';
            }
        }
        else {
            this.displayViewMore = false;
            return '(0)';
        }
    }

    setNameField(records) {
        if(this.childObjectInfo.nameField != 'Name') {
            if(records && records.length > 0) {
                records.forEach(record => {
                    record.Name = record[this.childObjectInfo.nameField];
                });
            }
        }
        return records;
    }

    /**
     * @description Sets the property nameurl for each record that is used to navigate to the record when clicked
     * @function setNameURL
     * @param {*} records List of Child records
     * @return List of records with nameurl property
     */
    setNameURL(records) {
        let newList = [];
        if(records && records.length > 0) {
            records.forEach(record => {
                var newRecord = Object.assign({},record);
                if(this.type == 'Internal') {
                    newRecord.nameurl = '/lightning/r/' + record.Id +'/view';
                }
                else {
                    newRecord.nameurl = '/' + this.urlPrefix + '/s/detail/' + record.Id;
                }
                newRecord.deleteKey = 'Delete' + '_' + record.Id;
                newRecord.editKey = 'Edit' + '_' + record.Id;
                newList.push(newRecord);
            });
            console.log('new list:', newList);
            return newList;
        }
        else {
            return null;
        }
    }

    /**
     * @description Sets the number of records to display in the related list, controlled by NUMBER_OF_RECORDS_TO_DISPLAY constant
     * @function setRecordsToDisplay
     * @param {*} records List of Deployment_Participant__c records
     * @return List of records that will be displayed
     */
    setRecordsToDisplay(records) {
        if(records && records.length > 0) {
            if(records.length > this.recordsDisplayed) {
                return records.slice(0,(this.recordsDisplayed));
            }
            else {
                return records;
            }
        }
        else {
            return null;
        }
    }

    /**
     * @description Event handler for View link click. Navigates to Related list view all page for Related Child Object
     * @function handleViewAll
     * @param {*} event 
     */
    handleViewAll(event) {
        this.recordsDisplayed += NUMBER_OF_RECORDS_TO_DISPLAY
        this.numberOfRecords = this.setNumberOfRecords(this.allRecords);
        let records = this.setRecordsToDisplay(this.allRecords);
        this.records = this.setNameURL(records);
    }

    handleRecordAction(event) {
        let values = event.detail.value.split('_');
        this.clickedRecord = values[1];
        switch(values[0]) {
            case 'Edit':
                this.generateBackgroundUrlAndEdit(clickedRecord);
                break;
            case 'Delete':
                this.showNotificationModal = true;
                break;
        }
    }

    generateBackgroundUrlAndEdit(clickedRecord) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: clickedRecord,
                objectApiName: this.objectAPIName,
                actionName: 'edit'
            }
        });
    }

    handleDeleteRecord(event) {
        this.showNotificationModal = false;
        this.showSpinner = true;
        let record = this.records.find(theRecord => theRecord.Id == this.clickedRecord);
        deleteRecord({
            record:record,
            childObjectInfo:JSON.stringify(this.childObjectInfo),
            parentRecordId: this.recordId
        })
        .then(data => {
            this.allRecords = data;
            this.numberOfRecords = this.setNumberOfRecords(data);
            if(data && data.length > 0) {
                let records = this.setRecordsToDisplay(data);
                this.records = this.setNameURL(records);
                this.showToast(
                    'Success', 
                    this.childObjectInfo.label + ' ' + record.Name + ' was deleted.',
                    'success'
                );
            }
            else {
                this.records = null;
            }
            this.showSpinner = false;
        })
        .catch(error => {
            console.error(error);
            this.showSpinner = false;
        });
    }

    handleCloseModal(event) {
        this.showNotificationModal = false;
    }

    /**
     * @description Displays a Toast Message
     * @function showNotificaiton
     * @param {string} title Title of the toast message
     * @param {string} message Body of the toast message
     * @param {string} variant Variant of the toast message (success,error,warning)
     */
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }

    handleError(event) {
        console.log('error');
        console.error('error:', JSON.parse(JSON.stringify(event.detail)));
    }
}