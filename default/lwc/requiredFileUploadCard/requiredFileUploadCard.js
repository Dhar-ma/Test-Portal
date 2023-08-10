/**
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Developer(s):
 1. Joseph Cadd - caddjoseph@gmail.com
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Created Date: 2/31/2020
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Description/Purpose of Component:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Related to
 Classes:
 Components:
 Other:
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 Change Log:
 2/31/2020 Joseph Cadd: Created Lightning Component
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */

import {LightningElement,api,track} from 'lwc';

export default class RequiredFileUploadCard extends LightningElement {
    @api allowUpload = false;
    @api includeStatusIcon = false;
    @api rowNumber;// UNUSED

    _fileStorageInfo;
    @api
    get fileStorageInfo() {
        return this._fileStorageInfo;
    }
    set fileStorageInfo(value) {
        this._fileStorageInfo = value;
    }

    @track error;

    connectedCallback() {}

    get acceptedFormats() {
        return [
            // Document type formats
            '.pdf','.xls','.xlsx','.doc','.docx','.odt','.txt','.pptx','.ppt','.rtf',
            // Image type formats
            '.png','.bmp','.gif','.jpeg','.jpg','.tex'
        ];
    }

    // createCdlWrapperList() {
    //     this.cdlWrapperList = [];
    //     if (this.fileStorageInfo.cdlList) {
    //         let cdlList = this.fileStorageInfo.cdlList;
    //         for (let i = 0; i < cdlList.length; i++) {
    //             this.cdlWrapperList.push({
    //                 cdl: cdlList[i],
    //
    //                 imgUrl: "/sfc/servlet.shepherd/version/download/" + cdlList[i].ContentDocument.LatestPublishedVersionId,
    //                 previewUrl: "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId="+ cdlList[i].ContentDocument.LatestPublishedVersionId
    //             });
    //         }
    //     }
    // }

    reloadComponentEvent() {
        console.log('reloadComponentEvent');
        this.dispatchEvent(new CustomEvent('reload_component'));
    }
}