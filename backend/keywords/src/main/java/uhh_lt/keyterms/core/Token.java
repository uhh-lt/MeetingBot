package uhh_lt.keyterms.core;

public class Token {

	private String value;
	private String stem;
	private Double significance;
	
	public Token(String value, String stem) {
		this.value = value;
		this.stem = stem;
	}
	
	
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}

	public Double getSignificance() {
		return significance;
	}

	public void setSignificance(Double significance) {
		this.significance = significance;
	}

	public String getStem() {
		return stem;
	}

	public void setStem(String stem) {
		this.stem = stem;
	}

	
}
