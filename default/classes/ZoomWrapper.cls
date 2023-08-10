public class ZoomWrapper {
    
	public String Topic;
    public Integer Type;
    public String start_time;
    public Integer duration;
    public String timezone;
    public String agenda;
    public Settings settings;
    public String host_id;
    public String id;
    public String join_url;
    public String start_url;
    
    public class Settings {
		public Boolean host_video;	
		public Boolean participant_video;
        public Boolean in_meeting;
	}
}