/**********************************************************
@class      IntegrationConfigConstants
@brief      This class is to hold different final Strings to be used in the integration code
@author     Developer Name (rchapple)
@version    1/11/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
public with sharing class IntegrationConfigConstants {
    public static final String INTEGRATION_STATUS_PENDING = 'PENDING';
    public static final String INTEGRATION_STATUS_SUCCESS = 'SUCCESS';
    public static final String INTEGRATION_STATUS_FAILED = 'FAIL';

    public static final String STRING_FIELD_TYPE = 'String';
    public static final String NUMBER_FIELD_TYPE = 'Number';
    public static final String BOOLEAN_FIELD_TYPE = 'Boolean';
    public static final String DATE_FIELD_TYPE = 'Date';
    public static final String STRING_TO_NUMBER_TYPE = 'StringToNumber';
    public static final String DECIML = 'Decimal';
    public static final String DATETIM = 'DateTime';

   	public static final String LINKED_OBJECT_OPPORTUNITY = 'Opportunity';

   	@TestVisible
   	private IntegrationConfigConstants(){
   		throw new UnsupportedOperationException();
   	}
}