public without sharing class ServiceAppointmentDetailController {
	
    @AuraEnabled
    public static ActionResult UpdateServiceAppointment(String recordId){
        if(String.isNotBlank(recordId)){
            ServiceAppointment appointment = [SELECT Id, Status, AppointmentNumber 
                                          FROM ServiceAppointment WHERE Id = :recordId];
            try{
                appointment.Status = 'Canceled';
                update appointment;
                return new ActionResult(new map<string, object>{'message'=> 'Service Appointment Canceled sucessfully'});
            }catch(Exception ex){
                System.debug('UpdateServiceAppointment Exception'+ex);
                return new ActionResult(ex);
            }
        }else{
            return new ActionResult(new map<string, object>{'message'=> 'Appointment Id Not Found'});
        }
    }
}