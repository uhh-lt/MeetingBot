package uhh_lt.keyterms.core;

import org.tartarus.snowball.SnowballStemmer;
import org.tartarus.snowball.ext.danishStemmer;
import org.tartarus.snowball.ext.dutchStemmer;
import org.tartarus.snowball.ext.englishStemmer;
import org.tartarus.snowball.ext.finnishStemmer;
import org.tartarus.snowball.ext.frenchStemmer;
import org.tartarus.snowball.ext.germanStemmer;
import org.tartarus.snowball.ext.hungarianStemmer;
import org.tartarus.snowball.ext.italianStemmer;
import org.tartarus.snowball.ext.norwegianStemmer;
import org.tartarus.snowball.ext.portugueseStemmer;
import org.tartarus.snowball.ext.romanianStemmer;
import org.tartarus.snowball.ext.russianStemmer;
import org.tartarus.snowball.ext.spanishStemmer;
import org.tartarus.snowball.ext.swedishStemmer;
import org.tartarus.snowball.ext.turkishStemmer;

public class StemmerWrapper {
	
	private SnowballStemmer stemmer;

	public StemmerWrapper(String language) {
		super();
		switch (language) {
		case "eng":
			stemmer = new englishStemmer();
			break;
		case "dan":
			stemmer = new danishStemmer();
			break;
		case "deu":
			stemmer = new germanStemmer();
			break;
		case "nld":
			stemmer = new dutchStemmer();
			break;
		case "fin":
			stemmer = new finnishStemmer();
			break;
		case "fra":
			stemmer = new frenchStemmer();
			break;
		case "hun":
			stemmer = new hungarianStemmer();
			break;
		case "ita":
			stemmer = new italianStemmer();
			break;
		case "nor":
			stemmer = new norwegianStemmer();
			break;
		case "por":
			stemmer = new portugueseStemmer();
			break;
		case "ron":
			stemmer = new romanianStemmer();
			break;
		case "rus":
			stemmer = new russianStemmer();
			break;
		case "spa":
			stemmer = new spanishStemmer();
			break;
		case "swe":
			stemmer = new swedishStemmer();
			break;
		case "tur":
			stemmer = new turkishStemmer();
			break;
		default:
			stemmer = new NoStemmer();
		}

	}
	
	public synchronized String stem(String word) {
		stemmer.setCurrent(word);
		stemmer.stem();
		return stemmer.getCurrent();
	}
	
	public class NoStemmer extends org.tartarus.snowball.SnowballStemmer {

		@Override
		public boolean stem() {
			return true;
		}

	}

	public SnowballStemmer getStemmer() {
		return stemmer;
	}

}
