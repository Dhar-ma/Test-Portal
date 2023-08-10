/**********************************************************
@class      IntegrationInterface
@brief      An Interface that will define the integration method needed for callouts
@testClass  N/A
@author     Developer Name (rchapple)
@version    1/22/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/

public Interface IntegrationInterface {

    void performIntegrationCallouts(Integrated_Object__mdt integrationConfiguration, Set<Id> recordIdsToIntegrate, Boolean isCreate);
}