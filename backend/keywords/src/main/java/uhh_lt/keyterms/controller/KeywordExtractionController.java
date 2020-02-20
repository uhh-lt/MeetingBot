package uhh_lt.keyterms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uhh_lt.keyterms.core.Document;
import uhh_lt.keyterms.core.Extractor;
import uhh_lt.keyterms.model.Keyword;
import uhh_lt.keyterms.model.KeywordResult;
import uhh_lt.keyterms.model.RequestBodyKeyword;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class KeywordExtractionController {

    @CrossOrigin
    @PostMapping("extractKeywords")
    public ResponseEntity extractFromString(@RequestBody RequestBodyKeyword rbk) {
        return ResponseEntity.status(HttpStatus.OK).body(extractKeywords(rbk.getText(), rbk.getLang(), rbk.getCount()));
    }

    @CrossOrigin
    @GetMapping("healthcheck")
    public ResponseEntity healthCheck() {
        return ResponseEntity.status(HttpStatus.OK).body(extractKeywords(
                "Tim ist toll. Tim arbeitet bei der Universität Hamburg. Tim ist ein guter Student.",
                "deu",
                3));
    }

    private KeywordResult extractKeywords(String text, String lang, int count) {
        Extractor extractor = new Extractor();
        extractor.setLanguage(lang);
        extractor.getReferenceResource();

        // create dictionary
        Document targetDocument = Document.readText(text, lang);
        // process extraction
        Map<String, Double> keywords = extractor.process(targetDocument);

        List<Keyword> keywordList = new ArrayList<>();
        int kwCounter = 0;
        for (Map.Entry<String, Double> kw : keywords.entrySet()) {
            kwCounter++;
            if (kwCounter > count) break;
            keywordList.add(new Keyword(kw.getKey(), kw.getValue()));
        }

        KeywordResult result = new KeywordResult(keywordList);

        return result;
    }

}
