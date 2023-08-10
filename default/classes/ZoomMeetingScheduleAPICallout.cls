public class ZoomMeetingScheduleAPICallout {
    
    @InvocableMethod
    public static void scheduleZoomMeeting(List<Id> IdList) {
        calloutmethod(IdList);
    }
    
    @future(callout=true)
    public static void calloutmethod(List<Id> IdList){
        
        List<ServiceAppointment> serviceApptList = [SELECT Id, AppointmentNumber, ParentRecordId, 
                                                    AccountId, SchedStartTime, Subject, DurationInMinutes, 
                                                    Service_Resource__r.RelatedRecord.Email,
                                                    Work_Type_Group__r.Name
                                                    FROM ServiceAppointment WHERE Id IN :IdList];
        System.debug('serviceApptList :: '+serviceApptList);
        String token  = ZoomAPIService.createToken();
        ZoomWrapper wrapperObject = new ZoomWrapper();
        List<ServiceAppointment> UpdatedServiceApptList = new List<ServiceAppointment>();
        
        if(!String.isBlank(token)){
            for(ServiceAppointment app : serviceApptList){
                ZoomWrapper wrapper = parseToJSON(app);
                
                String endpoint = 'https://api.zoom.us/v2/users/'+app.Service_Resource__r.RelatedRecord.Email+'/meetings';
                String responseBody = JSON.serialize(wrapper);
                System.debug('ZoomWrapper : '+responseBody);
                
                HTTPRequest request = new HTTPRequest();
                request.setHeader('Content-Type','application/json');
                request.setHeader('Accept','application/json');
                request.setHeader('Authorization', 'Bearer ' + token);
                request.setEndpoint(endpoint);
                request.setBody(responseBody);
                request.setMethod('POST');
                request.setTimeout(120000);
                
                System.debug('httpService request: '+request);
                
                HttpResponse response = new HttpResponse();
                HTTP httpService = new HTTP();
                
                if(!Test.isRunningTest()) {
                    response = httpService.send(request);
                }else{
                    response = MockResponseZoomAPICalloutRes();
                }
                
                System.debug('response.getBody() -: '+response.getBody());
                if(response.getStatusCode() == 201){
                    System.debug('response.getBody() : '+response.getBody());
                    wrapperObject = (ZoomWrapper) JSON.deserialize(response.getBody(), ZoomWrapper.class);
                    System.debug('wrapperObject : '+wrapperObject);
                    app.Zoom_Join_Url__c = wrapperObject.join_url;
                    app.Zoom_Start_Url__c = wrapperObject.start_url;
                    UpdatedServiceApptList.add(app);
                }
            }
            
            update UpdatedServiceApptList;
        }
    }
    
    public static ZoomWrapper parseToJSON(ServiceAppointment record){
        
        ZoomWrapper wrap = new ZoomWrapper();
        wrap.Topic = record.Subject;
        wrap.start_time = string.valueOfGmt(record.SchedStartTime);
        wrap.duration = 60;
        wrap.timezone = 'America/Los_Angeles';
        wrap.agenda = record.Work_Type_Group__r.Name;
        wrap.Type = 1;
        
        wrap.settings = new ZoomWrapper.Settings();
        wrap.settings.host_video=true;
        wrap.settings.participant_video=false;
        wrap.settings.in_meeting = false;
        return wrap;
    }
    
     //Mock Response for zoom API Callout
    public static HttpResponse MockResponseZoomAPICalloutRes(){
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        
        String responseBody = '{"agenda": "test agenda zoom salesforce","created_at": "2020-09-28T10:50:20Z",'+
            '"host_email": "Lreid@consultems.com","host_id": "z6rNSQVkS3OmiOt9iuuxYg",'+
            '"id": 82380432052, "join_url": "https://us02web.zoom.us/j/82380432052",'+
            '"settings": {"host_video": false,"in_meeting": true,"join_before_host": false,'+
            '"meeting_authentication": false,"mute_upon_entry": false,"participant_video": false,'+
            '"registrants_confirmation_email": true,"registrants_email_notification": true,'+
            '"request_permission_to_unmute_participants": false,"use_pmi": false,"waiting_room": true,"watermark": false},'+
            '"start_url": "https://us02web.zoom.us/s/82380432052?zak=eyJ6bV9za20iOiJ6bV9vMm0iLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjbGllbnQiLCJ1aWQiOiJ6NnJOU1FWa1MzT21pT3Q5aXV1eFlnIiwiaXNzIjoid2ViIiwic3R5IjoxMDAsIndjZCI6InVzMDIiLCJjbHQiOjAsInN0ayI6IlFSQVNPaVZMTTZCTWZTZ1ZjcGJaZmMyVXd1aDRqVzgyVlpPN1BmUWNsY1EuQmdVZ2JESklZMlJPVVdWSmVUSTNVelJUUVhGdU5sQTBWVFozYnpOSlRETXpiMFpBWkRsbFpXWmpZekJrTWpRM01EVmpPR1UxWXpaallqWTVOMll3Wm1VNVpUbG1ZVEkyTkRJMk56UmlNakZsTjJObE5tTmhNbVUxWlRKaVpUazFaVEl3WVFBTU0wTkNRWFZ2YVZsVE0zTTlBQVIxY3pBeSIsImV4cCI6MTYwMTI5NzQyMCwiaWF0IjoxNjAxMjkwMjIwLCJhaWQiOiJWcDJ5WHp1MFR1NkIxVEVSWUFKUENBIiwiY2lkIjoiIn0.nmKT7AGNdqz5jLT0EOK3fWoNFox2xhtlvkb-zK8eQL0",'+
            '"status": "waiting","timezone": "America/Los_Angeles","topic": "Test From API Time AB","type": 1,'+
            '"uuid": "gL2LTqtGRQaUDY9d1LNwJA=="}';
        
        res.setBody(responseBody);   
        
        res.setStatusCode(201);
        System.debug('Repsopse Zoom Meeting creation');
        return res;
    }    
    
}