/**
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Developer(s):
 1. Joseph Cadd - caddjoseph@gmail.com
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Created Date: 4/5/2020
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Description/Purpose of Component:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Related to
 Classes:
 Components:
 Other:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Change Log:
 4/5/2020 Joseph Cadd: Created Lightning Component
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */

import {api, LightningElement, track} from 'lwc';

export default class RequiredFileUploadStatus extends LightningElement {
    @api allowUpload = false;
    @api iconOnly = false;

    _fileStorageInfo;
    @api
    get fileStorageInfo() {
        return this._fileStorageInfo;
    }
    set fileStorageInfo(value) {
        this._fileStorageInfo = value;
    }

    // If this file storage info wrapper has documents uploaded
    get fileUploadStatusCardType() {
        return this.fileStorageInfo.cdlList.length>0 ? 'green-card':'gray-card';
    }
    get hasFilesUploaded() {
        return this.fileStorageInfo.cdlList.length>0;
    }

    connectedCallback() {
        // this.displayOnlyIcon = this.iconOnly;
        console.log(this.iconOnly);
        console.log(typeof this.iconOnly);
        // console.log(JSON.stringify(this.fileStorageInfo);
        // console.log(typeof this.fileStorageInfo);
    }
}