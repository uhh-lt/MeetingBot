package uhh_lt.keyterms.model;

public class Keyword {

    private String word;
    private Double score;

    public Keyword() {
    }

    public Keyword(String word, Double score) {
        this.word = word;
        this.score = score;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}
