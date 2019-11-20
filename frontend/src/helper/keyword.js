function calculateKeywordnessTokenMap(utterance) {
  const { confidences } = utterance;
  const { text } = utterance;
  const { keywords } = utterance;
  const tokens = utterance.text.split(' ');

  // console.log('TL_UTT Text');
  // console.log(text);
  // console.log('TL_UTT Tokens');
  // console.log(tokens);
  // console.log('TL_UTT Keywords');
  // console.log(keywords);
  // console.log('TL_UTT Confidences');
  // console.log(confidences);

  // const confidenceSum = confidences.reduce((a, b) => a + b, 0);


  // map that stores a keywordScore for each array of involved tokenIndices
  // [
  //   { involved: [1, 2, 3], score: 10, word: "tim ist toll"},
  //   { involved: [6, 7, 8], score: 10, word: "tim ist super"},
  // ]
  let keywordInfo = [];

  // TOKENS:       0   1   2
  // CHAR OFFSET: 0123456789
  // STRING:      Tim ist to
  let offset = 0;
  const characterOffset2TokenID = new Map();
  // build characterOffset2TokenMap
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    for (let j = 0; j < token.length; j += 1) {
      characterOffset2TokenID.set(offset, i);
      offset += 1;
    }
    offset += 1;
  }
  // console.log('TL_UTT Character2TokenID');
  // console.log(characterOffset2TokenID);

  // perform regex search for each keyword in the list
  keywords.forEach((keyword) => {
    const words = keyword.word.split(' ');
    const numWords = words.length;
    const { spacy } = keyword;
    // let newWords = '';
    // let newLemmas = '';
    for (let i = 0; i < numWords; i += 1) {
      const word = words[i];
      const lemma = spacy[i][2];
      const pos = spacy[i][1];
      const isStopword = spacy[i][4];
      if (pos === 'NOUN' && !isStopword) {
        // newWords += `${word} `;
        // newLemmas += `${lemma} `;

        let match;
        const re = new RegExp(`\\b${word}\\b`, 'gi');
        match = re.exec(text);
        while (match != null) {
          // using match.index to find token index
          const tokenIndex = characterOffset2TokenID.get(match.index);
          // save keywordness for keyword phrase (as token ids)
          const score = keyword.score * confidences[tokenIndex];
          keywordInfo.push({
            tokenIndex,
            score,
            word,
            lemma,
            pos,
            confidence: confidences[tokenIndex],
          });

          match = re.exec(text);
        }
      }
    }
    // newWords = newWords.trim();
    // newLemmas = newLemmas.trim();

    //
    // let match;
    // const re = new RegExp(`\\b${keyword.word}\\b`, 'gi');
    // match = re.exec(text);
    // while (match != null) {
    //   // using match.index to find token index
    //   const tokenIndex = characterOffset2TokenID.get(match.index);
    //
    //   // calculate average confidence for the keyword phrase
    //   // also calculated an array of involved tokenIds in the keyword phrase
    //   let avgConfidence = 0;
    //   const confis = [];
    //   const involvedTokenIDs = [];
    //   for (let i = 0; i < numWords; i += 1) {
    //     const realIndex = tokenIndex + i;
    //     const confidence = confidences[realIndex];
    //     avgConfidence += confidence;
    //     confis.push(confidence);
    //     involvedTokenIDs.push(realIndex);
    //   }
    //   avgConfidence /= numWords;
    //
    //   // save keywordness for keyword phrase (as token ids)
    //   keywordInfo.push({
    //     involved: involvedTokenIDs,
    //     score: keyword.score * avgConfidence * avgConfidence,
    //     phrase: keyword.word,
    //     words: keyword.word.split(' '),
    //     confs: confis,
    //     avgConf: avgConfidence,
    //     kwScore: keyword.score,
    //     spacy: keyword.spacy,
    //   });
    //
    //   match = re.exec(text);
    // }
  });

  console.log('TL_UTT keywordInfo');
  console.log(keywordInfo);

  // filter the keywordInfo so that only the "REAL" keywords are processed further
  keywordInfo = keywordInfo.filter(info => info.score > 1.0);

  // remap top keyword phrases as f.e.
  // { involved: [0, 1, 2], score: 10 }
  // to
  // [ { token: 0, score: 10 },
  //   { token: 1, score: 10 },
  //   { token: 2, score: 10 } ]
  // const keywordnessTokenMap = new Map();
  // keywordInfo.forEach((obj) => {
  //   obj.involved.forEach((tokenId) => {
  //     keywordnessTokenMap.set(tokenId, obj.score);
  //   });
  // });
  const keywordnessTokenMap = new Map();
  keywordInfo.forEach((obj) => {
    keywordnessTokenMap.set(obj.tokenIndex, obj.score);
  });

  console.log('TL_UTT ProcessedKeywordScores');
  console.log(keywordnessTokenMap);

  return { keywordnessTokenMap, keywordInfo };
}

export default calculateKeywordnessTokenMap;
