package uhh_lt.keyterms.model;

import java.util.List;

public class KeywordResult {

    private List<Keyword> keywords;

    public KeywordResult() {
    }

    public KeywordResult(List<Keyword> keywords) {
        this.keywords = keywords;
    }

    public List<Keyword> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<Keyword> keywords) {
        this.keywords = keywords;
    }
}
