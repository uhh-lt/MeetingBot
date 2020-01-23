package uhh_lt.keyterms.core;

import com.google.common.base.Charsets;
import com.google.common.collect.TreeMultiset;
import org.apache.commons.cli.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;
import java.util.regex.Pattern;


public class Extractor {

	private static final Integer MAX_MWU_LENGTH = 4;
	private final static Double MINIMUM_KEYNESS_THRESHOLD = 6.63; // 3.84;

	private final static Logger LOGGER = 
			Logger.getLogger(Extractor.class.getName());

	private Options cliOptions;

	private Dictionary comparison;

	private String language = null;
	private int nKeyterms = 25;
	private boolean concatMultiWordUnits = true;
	private double diceThreshold = 0.4;
	private boolean frequencyMode = false;
	private String referenceFile = null;

	public Extractor() {
		super();
	}

	public Extractor(String language, Integer nKeyterms) throws IOException {
		super();
		initialize(language, nKeyterms);
	}

	public void initialize(String language, Integer nKeyterms) throws IOException {
		this.language = language;
		this.nKeyterms = nKeyterms;
		this.comparison = new Dictionary(language);
	}

	public String getLanguage() {
		return language;
	}


	public void setLanguage(String language) {
		this.language = language;
	}


	public int getnKeyterms() {
		return nKeyterms;
	}

	public void setnKeyterms(int nKeyterms) {
		this.nKeyterms = nKeyterms;
	}



	public boolean concatMultiWordUnits() {
		return concatMultiWordUnits;
	}

	public void setConcatMultiWordUnits(boolean concatMultiWordUnits) {
		this.concatMultiWordUnits = concatMultiWordUnits;
	}

	public double getDiceThreshold() {
		return diceThreshold;
	}

	public void setDiceThreshold(double diceThreshold) {
		this.diceThreshold = diceThreshold;
	}

	private void log(Level level, String message) {
		LOGGER.log(level, message);
	}

	private TreeMap<String, Double> getKeyness(Dictionary target) {

		long c = target.getTotalCounts();
		long d = comparison.getTotalCounts();

		// compute significance
		TreeMap<String, Double> significances = new TreeMap<String, Double>();
		Set<String> candidates = target.getStemVocabulary();
		candidates = filterKeytermCandidates(candidates);
		for (String type : candidates) {
			long a = target.getStemFrequency(type);
			long b = comparison.getStemFrequency(type);
			Double significance = computeLogLikelihood(a, b, c, d);
			significances.put(type, significance);
		}

		return(significances);
	}


	private TreeMap<String, Double> getKeyterms(Dictionary target, Document document) {

		TreeMap<String, Double> candidates = getKeyness(target);

		// top n words + minimum keyness filter
		TreeMap<String, Double> keyterms = new TreeMap<String, Double>();
		for (Map.Entry<String, Double> candidate : candidates.entrySet()) {
			if (candidate.getValue() >= MINIMUM_KEYNESS_THRESHOLD) {
				keyterms.put(target.getTypeFromStem(candidate.getKey()), candidate.getValue());
			}
		}


		// concatenate MWU
		if (this.concatMultiWordUnits) {
			keyterms = concatMultiWords(keyterms, target, document);
		}

		// sort
		keyterms = sortMapByValue(keyterms);

		return keyterms;

	}



	private TreeMap<String, Double> concatMultiWords(TreeMap<String, Double> keyterms, Dictionary target, Document document) {
		TreeMultiset<NGram> ngrams = TreeMultiset.create();
		Character currentSeparator = ' ';
		ArrayList<NGram> activeNGrams = new ArrayList<NGram>();
		for (Token token : document) {
			if (token.getValue().equals("-")) {
				currentSeparator = '-';
				continue;
			} 
			String type = target.getTypeFromStem(token.getStem());
			if (keyterms.containsKey(type)) {

				NGram ngram = new NGram();
				activeNGrams.add(ngram);
				int fromIndex = Math.max(0, activeNGrams.size() - MAX_MWU_LENGTH);
				int toIndex = activeNGrams.size();
				for (NGram ng : activeNGrams.subList(fromIndex, toIndex)) {
					ng.append(token, type, keyterms.get(type), currentSeparator);
				}
				for (NGram ng : activeNGrams) {
					try {
						ngrams.add(ng.clone());
					} catch (CloneNotSupportedException e) {
						e.printStackTrace();
					}
				}
				currentSeparator = ' ';
			} else {
				activeNGrams = new ArrayList<NGram>();
				currentSeparator = ' ';
			}
		}

		// filter multiwords by Dice
		TreeMap<String, Double> keyMultiWords = new TreeMap<String, Double>();
		for (NGram ng : ngrams.elementSet()) {
			Double dice = dice(ngrams.count(ng), ng.getPartialCounts(target));
			if (dice >= this.diceThreshold) {
				Double maxKeyness = ng.keyness();
				LOGGER.log(Level.FINEST, "MWU detected: " + ng + " (" + maxKeyness + ")");
				keyMultiWords.put(ng.toString(), maxKeyness);
			}
		}

		// clean multiwords (longest match)
		Set<String> mwus = keyMultiWords.keySet();
		Set<String> mwusToRemove = new HashSet<String>();
		for (String mwu : mwus) {
			if (longerMatchExists(mwu, mwus)) {
				mwusToRemove.add(mwu);
			}
		}
		for (String mwu : mwusToRemove) {
			keyMultiWords.remove(mwu);
			LOGGER.log(Level.FINEST, "Removing " + mwu);
		}
		return keyMultiWords;
	}


	private boolean longerMatchExists(String candidate, Set<String> testSet) {
		String quotedCandidate = Pattern.quote(candidate);
		for (String c : testSet) {
			if (c.matches(quotedCandidate + "[ -].+") || c.matches(".+[ -]" + quotedCandidate)) return true;
		}
		return false;
	}

	private Double dice(long nCooc, long... parts) {
		int n = parts.length;
		double numerator = (double) n * nCooc;
		double denominator = .0;
		for (Long p : parts) {
			denominator += p;
		}
		return numerator / denominator;
	}



	private Set<String> filterKeytermCandidates(Set<String> candidates) {

		// apply language specific filters
		boolean wordlengthFilter = applyWordlengthFilter(this.language);
		boolean stopwordFilter = applyStopwordFilter(this.language);

		HashSet<String> filteredSet = new HashSet<String>();
		for (String candidate : candidates) {
			// filter out terms with no word chars
			if (candidate.replaceAll("[^\\p{L}]", "").length() < 1) {
				LOGGER.log(Level.FINEST, "Removed (candidate.replaceAll(\"[^\\p{L}]\", \"\").length() < 1): " + candidate);
				continue;
			};
			// filter out terms with two or more special chars
			if (candidate.replaceAll("[\\p{L}-]", "").length() > 1) {
				LOGGER.log(Level.FINEST, "Removed (candidate.replaceAll([\\p{L}-]).length() > 1): " + candidate);
				continue;
			};
			// filter out single chars
			if (wordlengthFilter && candidate.length() < 2) {
				LOGGER.log(Level.FINEST, "Removed (candidate.length() < 2): " + candidate);
				continue;
			}
			// filter out stopwords
			if (stopwordFilter && comparison.isStopword(candidate)) {
				LOGGER.log(Level.FINEST, "Removed (comparison.isStopword(candidate)): " + candidate);
				continue;
			};
			filteredSet.add(candidate);
		}

		return filteredSet;
	}

	private boolean applyWordlengthFilter(String lang) {
		boolean apply;
		switch (lang) {
		case "zho":
		case "jpn":
			apply = false;
			break;
		default:
			apply = true;
			break;
		}
		return apply;
	}


	private boolean applyStopwordFilter(String lang) {
		return true;
	}

	private Double computeLogLikelihood(long a, long b, long c, long d) {

		double e1 = c * (a + b) / (double) (c + d);
		double e2 = d * (a + b) / (double) (c + d);
		double t1 = a == 0 ? .0 : a * Math.log(a / e1);
		double t2 = b == 0 ? .0 : b * Math.log(b / e2);
		double ll = a == 0 ? .0 : 2 * (t1 + t2);

		double relA = a / (double) c;
		double relB = b / (double) d;

		if (relA < relB) {
			ll = ll * -1;
		}

		return ll;
	}



	static class DoubleValueComparator implements Comparator<String>{
		HashMap<String, Double> map = new HashMap<String, Double>();
		public DoubleValueComparator(Map<String, Double> map){
			this.map.putAll(map);
		}
		@Override
		public int compare(String s1, String s2) {
			if(map.get(s1) > map.get(s2)) {
				return -1;
			} else {
				return 1;
			}
		}
	}

	private static TreeMap<String, Double> sortMapByValue(Map<String, Double> map){
		Comparator<String> comparator = new DoubleValueComparator(map);
		TreeMap<String, Double> result = new TreeMap<String, Double>(comparator);
		result.putAll(map);
		return result;
	}


	private List<String> getConfiguration(String[] args) {
		cliOptions = new Options();

		Option languageOpt = new Option("l", "language", true, "ISO-639-3 language code (default: eng)");
		languageOpt.setRequired(false);
		cliOptions.addOption(languageOpt);

		Option nOpt = new Option("n", "number", true, "Number of key terms to extract (default: 25)");
		nOpt.setRequired(false);
		cliOptions.addOption(nOpt);

		Option mwuOpt = new Option("m", "mwu-off", false, "Disable multi-word concatenation (default: false)");
		mwuOpt.setRequired(false);
		cliOptions.addOption(mwuOpt);

		Option diceOpt = new Option("d", "dice-threshold", true, "Threshold between [0; 1] of dice statistic for multi-word concatenation (default: 0.4)");
		diceOpt.setRequired(false);
		cliOptions.addOption(diceOpt);

		Option frequencyOpt = new Option("f", "frequency", false, "Output frequency list instead of keyness. Use this to create own reference resources.");
		frequencyOpt.setRequired(false);
		cliOptions.addOption(frequencyOpt);

		Option referenceOpt = new Option("r", "reference", true, "External reference resource file (file format: 'type\\tfrequency', one per line).");
		referenceOpt.setRequired(false);
		cliOptions.addOption(referenceOpt);

		Option verboseOpt = new Option("v", "verbose", false, "Output more log information");
		verboseOpt.setRequired(false);
		cliOptions.addOption(verboseOpt);

		Option helpOpt = new Option("h", "help", false, "Display help information");
		helpOpt.setRequired(false);
		cliOptions.addOption(helpOpt);

		CommandLineParser parser = new DefaultParser();
		HelpFormatter formatter = new HelpFormatter();
		CommandLine cmd;
		List<String> targetFiles = new ArrayList<String>();
		try {
			cmd = parser.parse(cliOptions, args);

			// display help
			if (cmd.hasOption("h")) {
				formatter.printHelp("lt-keyterms <options> [file1 [file2 file3 ...]]", cliOptions);
				System.exit(0);
			}

			// set language
			this.language = cmd.getOptionValue("l") == null ? "eng" : cmd.getOptionValue("l");

			// set verbosity
			if (cmd.hasOption("v")) {
				Logger rootLogger = LogManager.getLogManager().getLogger("");
				rootLogger.setLevel(Level.FINEST);
				for (Handler h : rootLogger.getHandlers()) {
					h.setLevel(Level.FINEST);
				}
			} else {
				LOGGER.setLevel(Level.INFO);
			}

			// set mwu
			if (cmd.hasOption("m")) {
				this.concatMultiWordUnits = false;
			} else {
				this.concatMultiWordUnits = true;
			}

			// set dice threshold
			if (cmd.hasOption("d")) {
				double d = Double.parseDouble(cmd.getOptionValue("d"));
				if (d < 0 || d > 1) throw new NumberFormatException();
				this.diceThreshold = d;
			} else {
				this.diceThreshold = 0.4;
			}

			// set frequency mode
			if (cmd.hasOption("f")) {
				this.frequencyMode = true;
			} else {
				this.frequencyMode = false;
			}

			// set dice threshold
			this.referenceFile = cmd.getOptionValue("r");

			// set target files
			targetFiles = cmd.getArgList();

			// set number of keyterms
			this.nKeyterms =  cmd.getOptionValue("n") == null ? 25 : Integer.parseInt(cmd.getOptionValue("n"));

		} catch (ParseException e) {
			System.out.println(e.getMessage());
			formatter.printHelp("lt-keyterms <options> [file1 [file2 file3 ...]]", cliOptions);
			System.exit(1);
		}

		return targetFiles;

	}


	public void processTargets(List<String> files) {
		// concatenate target text files
		StringBuilder sb = new StringBuilder();
		for (String f : files) {
			LOGGER.log(Level.INFO, "Extracting from file " + f);
			try {
				byte[] raw = Files.readAllBytes(Paths.get(f));
				String mimeType = Files.probeContentType(Paths.get(f));
				if (mimeType.startsWith("text")) {
					String fileContent = new String(raw, Charsets.UTF_8);
					sb.append(fileContent + "\n");
				} else {
					throw new ParseException("File appears to have false format: " + f + "(" + mimeType + ")");
				}
			} 
			catch (ParseException e) {
				LOGGER.log(Level.SEVERE, e.getMessage());
				System.exit(1);
			}
			catch (IOException e) {
				LOGGER.log(Level.SEVERE, "Could not read file: " + f);
				System.exit(1);
			}
		}
		// create dictionary
		Document targetDocument = Document.readText(sb.toString(), this.language);
		// process extraction
		process(targetDocument);
	}



	private void processFromStdin() {
		LOGGER.log(Level.INFO, "No file(s) given. Using standard input (press CTRL-D to finalize input).");
		StringBuilder sb = new StringBuilder();
		Scanner scanner = new Scanner( System.in );
		while (scanner.hasNextLine()) {
			sb.append(scanner.nextLine()).append("\n");
		}
		scanner.close();
		// create dictionary
		Document targetDocument = Document.readText(sb.toString(), this.language);
		// process extraction
		process(targetDocument);
	}


	public Map<String, Double> process(Document targetDocument) {
		targetDocument.normalizeSentenceBeginning(comparison);
		Dictionary target = new Dictionary(this.language, targetDocument);

		String result;
		Map<String, Double> result2 = null;
		if (this.frequencyMode) {
			result = formatResult(target);
		} else {
			result2 = getKeyterms(target, targetDocument);
			result = formatResult(result2);
		}
		System.out.println(result);

		return result2;
	}


	private String formatResult(Dictionary dictionary) {
		StringBuilder sb = new StringBuilder();
		for (Map.Entry<String, Long> entry : dictionary.getTypeFrequencies().entrySet()) {
			sb.append(entry.getKey() + "\t" + entry.getValue() + "\n");
		}
		return sb.toString();
	}


	private String formatResult(Map<String, Double> keywords) {
		StringBuilder output = new StringBuilder();
		int kwCounter = 0;
		for (Map.Entry<String, Double> kw : keywords.entrySet()) {
			kwCounter++;
			if (kwCounter > this.nKeyterms) break;
			output.append(kw.getKey()).append("=").append(kw.getValue()).append(System.lineSeparator());
		}
		return output.toString();
	}

	// Java API

	public synchronized Map<String, Double> extractKeyness(List<String> document) {
		Document targetDocument = new Document(this.language);
		targetDocument.load(document);
		targetDocument.normalizeSentenceBeginning(comparison);
		Dictionary target = new Dictionary(this.language, targetDocument);
		Map<String, Double> keywords = getKeyterms(target, targetDocument);
		return keywords;
	}

	public synchronized Map<String, Double> extractKeyness(String document) {
		Document targetDocument = new Document(this.language);
		targetDocument.load(document);
		targetDocument.normalizeSentenceBeginning(comparison);
		Dictionary target = new Dictionary(this.language, targetDocument);
		Map<String, Double> keywords = getKeyterms(target, targetDocument);
		return keywords;
	}

	public synchronized Set<String> extractKeyTerms(List<String> document) {
		Document targetDocument = new Document(this.language);
		targetDocument.load(document);
		targetDocument.normalizeSentenceBeginning(comparison);
		Dictionary target = new Dictionary(this.language, targetDocument);
		Map<String, Double> keywords = getKeyterms(target, targetDocument);
		return keywords.keySet();
	}

	public synchronized Set<String> extractKeyTerms(String document) {
		Document targetDocument = new Document(this.language);
		targetDocument.load(document);
		targetDocument.normalizeSentenceBeginning(comparison);
		Dictionary target = new Dictionary(this.language, targetDocument);
		Map<String, Double> keywords = getKeyterms(target, targetDocument);
		return keywords.keySet();
	}
	
	public synchronized SortedSet<String> getStopwords() {
		return comparison.getStopwords();
	}


	public void getReferenceResource() {
		if (this.referenceFile == null) {
			this.comparison = new Dictionary(this.language);
		} else {
			this.comparison = new Dictionary(new File(this.referenceFile), "unknown");
		}
	}

	// main

//	public static void main(String[] args) {
//
//		Extractor extractor = new Extractor();
//		extractor.log(Level.INFO, "Keyterm extraction, Language Technology group (Hamburg University)");
//		extractor.log(Level.INFO, "------------------------------------------------------------------");
//		List<String> filesToProcess = extractor.getConfiguration(args);
//
//		extractor.getReferenceResource();
//
//		if (filesToProcess.isEmpty()) {
//			extractor.processFromStdin();
//		} else {
//			extractor.processTargets(filesToProcess);
//		}
//
//		Test t = new Test();
//		String result= t.extractKeywords("Der deutsch-französische Hochgeschwindigkeitsverkehr, welcher unter dem Namen Alleo betrieben wird, hatte im letzten Jahr einen deutlichen Zuwachs von 22 Prozent, auf über zwei Millionen Fahrgäste. Damit konnte die Kooperation erstmals diese Grenze überschreiten. Alleo verkehrt derzeit auf vier Linien zwischen Frankreich und Deutschland, dafür werden sowohl TGV-, als auch ICE-Züge eingesetzt. Diese bedienen die Linien Frankfurt-Saarbrücken-Paris, Frankfurt-Straßburg-Paris, München-Stuttgart-Strasburg-Paris und Frankfurt-Straßburg-Lyon-Marseilles. Seit der Betriebsaufnahme 2007 konnten diese Verbindungen ihren Marktanteil gegenüber dem Flugverkehr deutlich ausbauen und sind auf einigen Relationen sogar Marktführer, zum Beispiel zwischen Stuttgart und Paris.",
//				"deu", 10);
//		System.out.println(result);
//
//	}

}
