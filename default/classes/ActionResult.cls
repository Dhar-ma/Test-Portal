public class ActionResult {
    @AuraEnabled
    public Boolean isSuccess;
    
    @AuraEnabled
    public String error;
    
    @AuraEnabled
    public Object data;
    
    public ActionResult() {}
    
    public ActionResult(Exception ex) {
        isSuccess = false;
        error = ex.getMessage();
        data = new Map<String, Object> {'exception' => ex.getStackTraceString()};
            }
    
    public ActionResult(String errorMessage) {
        isSuccess = false;
        error = errorMessage;
    }
    
    public ActionResult(Map<String, Object> mapData) {
        isSuccess = true;
        data = mapData;
    }
}