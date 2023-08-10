/*******************************************************//**
@class      Class Name
@brief      Represents an object in Encompass
@testClass  None
@author     Developer Name (leehildebrand)
@version    @version    2/9/18   Developer Name (leehildebrand) - Create class
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
public with sharing class AttachmentPage {
    public String imageKey{get;set;}
    public String zipKey{get;set;}
    public String nativeKey{get;set;}
    public Integer width{get;set;}
    public Integer height{get;set;}
    public Double horizontalResolution{get;set;}
    public Double verticalResolution{get;set;}
    public Integer fileSize{get;set;}
}