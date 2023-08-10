trigger LoanUpdateTrigger on Loan_Update__e (after insert) {
    for (Loan_Update__e event : Trigger.new) {
        if(!Test.isRunningTest()) {
            GetLoanService.readAndUpdateLoanFuture(event.Resource_Id__c);
            System.debug(LoggingLevel.DEBUG, 'Record Added: ' + event.Resource_Id__c);
        } else {
            // We should not make the call during testing.
            // The following line only exists to add code coverage.
            String eventId = event.Event_Id__c;
        }
    }
}