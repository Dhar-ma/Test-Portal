/**
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Developer(s):
 1. Joseph Cadd - caddjoseph@gmail.com
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Created Date: 4/1/2020
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Description/Purpose of Component:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Related to
 Classes:
 Components:
 Other:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Change Log:
 3/1/2020 Joseph Cadd: Created Lightning Component
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */

import {LightningElement,api,track} from 'lwc';
import deleteFile from '@salesforce/apex/RequiredFileUpload.deleteFile';
import { NavigationMixin } from 'lightning/navigation';


export default class ExistingFileCard extends NavigationMixin(LightningElement) {
    @api allowDelete;
    @api contentDocumentLink;
    @track previewUrl;
    @track fileSizeText;

    connectedCallback() {
        this.setPreviewUrl();

        if (this.contentDocumentLink.ContentDocument && this.contentDocumentLink.ContentDocument.ContentSize) {
            this.fileSizeText = '('+this.bytesToSize(this.contentDocumentLink.ContentDocument.ContentSize)+')';
        }
    }

    setPreviewUrl() {
        let fileUrlPrefix;
        let fileExtension = this.contentDocumentLink.ContentDocument.FileExtension;
        if (fileExtension==='png' || fileExtension==='bmp' || fileExtension==='gif'
            || fileExtension==='jpeg' || fileExtension==='jpg' || fileExtension==='tex')
        {
            fileUrlPrefix = "/sfc/servlet.shepherd/version/download/";
        } else {
            fileUrlPrefix = '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=';
        }
        this.previewUrl = fileUrlPrefix + this.contentDocumentLink.ContentDocument.LatestPublishedVersionId;
    }

    previewFile(event) {
        // Naviagation Service to the show preview
        console.log('preview button');

        var docId = event.currentTarget.dataset.id;
        docId = docId.slice(0,15);

        eval("$A.get('e.lightning:openFiles').fire({recordIds: ['"+ docId +"']});");
        /*this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state : {
                // assigning ContentDocumentId to show the preview of file
                selectedRecordId:event.currentTarget.dataset.id
            }
        })*/
    }

    handleDeleteFile(event) {
        let contentDocId = event.target.name;

        deleteFile({fileId: contentDocId})
            .then(result => {
                this.error = false;
                console.log(result);
                this.reloadComponentEvent();
            })
            .catch(error => {
                this.error = error;
                console.log(error);
                console.log(error.body.message);
            });
    }

    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    reloadComponentEvent() {
        this.dispatchEvent(new CustomEvent('reload_component'));
    }
}