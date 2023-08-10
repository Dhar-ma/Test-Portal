/**********************************************************
@class      ReceiveEncompassEventRESTTest
@brief      A Test class for the ReceiveEncompassEventREST
@author     Developer Name (rchapple)
@version    2/27/2018   Developer Name (rchapple)
@bug        No known defects.
@todo       None.
@copyright  (c)2018 EMS.  All Rights Reserved. Unauthorized use is prohibited.
***********************************************************/
@isTest
public with sharing class ReceiveEncompassEventRESTTest {
    @isTest static void doPost() {
        ReceiveEncompassEventREST.MetaObject meta = new ReceiveEncompassEventREST.MetaObject();
        meta.userId = 'userId';
        meta.resourceRef = 'resourceRef';
        meta.resourceType = 'resourceType';
        meta.resourceId = 'resourceId';
        meta.instanceId = 'instanceId';

        Test.startTest();
        ReceiveEncompassEventREST.doPost('eventId', 'eventTime', 'eventType', meta);
        Test.stopTest();

        System.assertEquals(ReceiveEncompassEventREST.eventList.size(), 1, 'We should have 1 item in our event list and not have received an exception');
    }
}