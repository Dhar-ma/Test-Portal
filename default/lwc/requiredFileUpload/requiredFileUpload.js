/**
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Developer(s):
 1. Joseph Cadd - caddjoseph@gmail.com
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Created Date: 3/31/2020
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Description/Purpose of Component:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Related to
 Classes:
 Components:
 Other:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Change Log:
 3/31/2020 Joseph Cadd: Created Lightning Component
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */

import {LightningElement,api,wire,track} from 'lwc';
import getRequiredAndStoredFileInfos from '@salesforce/apex/RequiredFileUpload.getRequiredAndStoredFileInfos';

export default class RequiredFileUpload extends LightningElement {
    @api recordId;
    // Target Configs
    @api parentId;
    @api childLookupRelationshipName;
    @api storageObjectName;
    @api storageParentLookup;
    @api storageFileTypeLookup;
    @api fileTypeIds;
    @api headerDescription='';
    @api headerTitle='';

    @track fileTypeIdsArray;

    @track error;
    @track cmpData;
    @track record = '';

    rowNumber = 0;

    rerenderCallback() {

    }

    connectedCallback() {
        this.localServerDevSetup(); // TODO comment out before deploying

        this.fileTypeIdsArray = this.fileTypeIds ? this.fileTypeIds.split(',') : null;

        this.getRequiredAndStoredFileInfos();
    }

    getRequiredAndStoredFileInfos() {
        let parentId = this.parentId ? this.parentId : this.recordId;

        console.log(parentId, this.storageObjectName, this.storageParentLookup, this.storageFileTypeLookup, this.fileTypeIdsArray);
        getRequiredAndStoredFileInfos({
                parentId: parentId,
                storageObjectName:this.storageObjectName,
                storageParentLookup:this.storageParentLookup,
                storageFileTypeLookup:this.storageFileTypeLookup,
                fileTypeIdsList:this.fileTypeIdsArray
            })
            .then(result => {
                this.error = false;
                this.rowNumber = 0;
                this.cmpData = JSON.parse(result);

                console.log(this.cmpData);
            })
            .catch(error => {
                this.error = error;
                console.log(error);
                console.log(error.body.message);
            });
    }

    handleComponentReload() {
        // console.log('handleCmpReload ReqFileUpload');
        this.rowNumber = 0;
        this.getRequiredAndStoredFileInfos();
    }

    localServerDevSetup() {
        this.parentId = !this.parentId && !this.recordId ? '0031g00000gaROfAAM' : this.parentId;
        this.storageFileTypeLookup = this.storageFileTypeLookup ? this.storageFileTypeLookup : 'File_Type__c';
        this.storageObjectName = this.storageObjectName ? this.storageObjectName : 'Required_Contact_Document__c';
        this.storageParentLookup = this.storageParentLookup ? this.storageParentLookup : 'Contact__c';
        this.fileTypeIds = this.fileTypeIds ? this.fileTypeIds : 'a001g000003g8UbAAI,a001g000003g8RoAAI';
    }



    get getRowNumber() {
        return this.rowNumber;
    }
    get setRowNumber() {
        this.rowNumber++;
    }
    // @wire(getRecord,{recordId: '$recordId',fields: '$currentOptyField'})
    // objRec({error, data}) {
    //     if (data) {
    //         this.record = data;
    //     } else {
    //         this.error = error;
    //     }
    // }

}