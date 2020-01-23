package uhh_lt.keyterms.core;

import java.util.ArrayList;

public class NGram implements Comparable<NGram> {

	private Document tokenSequence;
	private ArrayList<Character> separator;
	
	

	public NGram() {
		this.tokenSequence = new Document("someLanguage");
		this.separator = new ArrayList<Character>();
	}
	
	public NGram(Document document, ArrayList<Character> separator) {
		this.tokenSequence = document;
		this.separator = separator;
	}


	public ArrayList<Character> getSeparator() {
		return separator;
	}


	public void setSeparator(ArrayList<Character> separator) {
		this.separator = separator;
	}


	public void append(Token token, String type, Double significance, Character separator) {
		token.setValue(type);
		token.setSignificance(significance);
		this.tokenSequence.add(token);
		this.separator.add(separator);
	}
	
	



	@Override
	public int hashCode() {
		return hashString().hashCode();
	}



	@Override
	public boolean equals(Object obj) {
		return this.hashCode() == obj.hashCode();
	}


	public boolean isEmpty() {
		return tokenSequence.isEmpty();
	}


	@Override
	public String toString() {
		return hashString();
	}

	private String hashString() {
		StringBuilder sb = new StringBuilder();
		int i = 0;
		for (Token token : tokenSequence) {
			sb.append(token.getValue());
			if (i < tokenSequence.size() - 1) {
				sb.append(separator.get(i + 1));
			}
			
			i++;
		}
		return sb.toString();
	}

	@Override
	protected NGram clone() throws CloneNotSupportedException {
		NGram ngram = new NGram();
		ngram.setSeparator(this.separator);
		ngram.tokenSequence = (Document) this.tokenSequence.clone();
		return ngram;
	}


	@Override
	public int compareTo(NGram o) {
		return hashString().compareTo(o.hashString());
	}


	public long[] getPartialCounts(Dictionary dictionary) {
		long[] counts = new long[tokenSequence.size()];
		int i = 0;
		for (Token token : tokenSequence) {
			counts[i] = dictionary.getStemFrequency(token.getStem());
			i++;
		}
		return counts;
	}

	public Double keyness() {
		Double meanKeyness = .0;
		for (Token token : tokenSequence) {
			double k = token.getSignificance();
			meanKeyness += k;
		}
		meanKeyness = tokenSequence.size() > 0 ? meanKeyness / (double) tokenSequence.size() : 0;
		return meanKeyness;
	}

}
