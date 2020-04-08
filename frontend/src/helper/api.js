// connections to docker microservices
const keytermsURL = 'http://localhost:8888';
const asrURL = 'http://localhost:5000';
const clsumm2URL = 'http://localhost:9002';
const spacyURL = 'http://localhost:9999';
const activateLogger = true;

/**
 * Generic function that allows to POST any json data object to any url
 * @param url {string} API endpoint
 * @param data {object} json data object
 * @returns {Promise<any | string>} json response of the API endpoint
 */
function postData(url = '', data = {}) {
  console.log('POSTING DATA:');
  console.log(data);
  return fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then(response => response.json()) // parses JSON response into native JavaScript objects
    .catch((err) => {
      console.error(err);
      return '';
    });
}

/**
 * Generic function that allows to GET any data object from any url
 * @param url {string} API endpoint
 * @returns {Promise<Response>} response of the API endpoint
 */
function getDataNoJSON(url = '') {
  // Default options are marked with *
  return fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
  });
}

/**
 * Fetches 3 keywords for a given text.
 * @param text {string} text to analyze
 * @param language {string} text language either 'en' or 'de'
 * @returns {Promise<properties.keywords|string[]>} list of keywords or empty list
 */
async function fetchKeywords(text, language) {
  let lang = null;
  if (language === 'en') {
    lang = 'eng';
  } else if (language === 'de') {
    lang = 'deu';
  } else {
    return null;
  }

  if (activateLogger) console.log('Fetching Keywords');
  const data = await postData(`${keytermsURL}/extractKeywords`, {
    count: 3,
    lang,
    text,
  });
  if (activateLogger) console.log('Success fetching keywords');
  if (data.keywords !== null && data.keywords.length > 0) {
    return data.keywords;
  }
  if (activateLogger) console.log('Keywords are empty!');
  return [];
}

/**
 * Analyzes the given text with the spacy microservice.
 * @param text {string} text to analyze
 * @param lang {string} text language either 'en' or 'de'
 * @returns {Promise<any|string>} a list of (token, pos, lemma, dep) tuples.
 */
async function fetchSpacy(text, lang) {
  if (activateLogger) console.log('Fetching Spacy Output');
  const data = await postData(`${spacyURL}/process`, {
    text,
    lang,
  });
  if (activateLogger) {
    console.log('Success fetching spacy output');
    console.log(data);
  }
  return data;
}

/**
 * Utility function that removes every <UNK> token in the given text.
 * @param text {string} text containing <UNK> tokens
 * @returns {string} text without <UNK> tokens
 */
function removeUNK(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;UNK&gt;/g, '');
}

/**
 * Summarizes the given text with the CLSUMM microservice.
 * @param text {string} text to summarize
 * @returns {Promise<String|string|*>} summary of given text
 */
async function fetchBERTSummary(text) {
  if (activateLogger) console.log('Fetching CLSUMM Output');
  const data = await postData(`${clsumm2URL}/summarize`, {
    text,
  });
  if (activateLogger) {
    console.log('Success fetching CLSUMM output');
    console.log(data);
  }
  return data.summary;
}

/**
 * Summarizes the given text with the spacy microservice (TextRank).
 * @param text {string} text to summarize
 * @param length {integer} length of the summary (# of sentences)
 * @param lang {string} text language either 'en' or 'de'
 * @returns {Promise<String|string|*>} summary of given text
 */
async function fetchSummary(text, length, lang) {
  if (activateLogger) console.log('Fetching Textrank Output');
  const data = await postData(`${spacyURL}/summarize`, {
    text,
    length,
    lang,
  });
  if (activateLogger && data !== '') {
    console.log('Success fetching textrank output');
    console.log(data);
  } else if (data === '') {
    return '';
  }
  return data.summary;
}

/**
 * Fetches the keywords as well as their pos, lemma, dep
 * using keyterms & spacy microservice for the given utterance.
 * @param utterance the utterance to analyze
 * @param lang {string} utterance language either 'en' or 'de'
 * @returns {Promise<unknown[]>} list of keywords with their scores, pos, lemma and dep
 */
async function computeKeywords(utterance, lang) {
  let keywords = await fetchKeywords(utterance.text, lang);
  keywords = keywords.filter(value => value.word !== 'UNK');
  const result = await Promise.resolve(
    Promise.all(keywords.map(k => new Promise((resolve) => {
      fetchSpacy(k.word, lang).then((data) => {
        // eslint-disable-next-line no-param-reassign
        k.spacy = data;
        return resolve(k);
      });
    }))),
  );
  if (activateLogger) {
    console.log('Final Keywords:');
    console.log(result);
  }
  return result;
}

/**
 * Computes the summary of multiple texts.
 * @param textSegments {object[]} list of text segment objects: {text: string, sentences: integer}
 * @param lang {string} language of the text segments either 'en' or 'de'
 * @param method {string} method to use for summarization either 'TEXTRANK' or 'BERT'
 * @returns {Promise<string[]>} list of summaries. One summary per text segment
 */
async function computeSummary(textSegments, lang, method) {
  // compute for each text segment the summary
  const result = await Promise.resolve(
    // eslint-disable-next-line consistent-return
    Promise.all(textSegments.map(content => new Promise((resolve) => {
      if (content.sentences > 0 && method === 'TEXTRANK') {
        // eslint-disable-next-line max-len
        fetchSummary(removeUNK(content.text), Math.min(3, content.sentences), lang).then(data => resolve(data));
      } else if (content.sentences > 0 && method === 'BERT') {
        fetchBERTSummary(removeUNK(content.text)).then(data => resolve(data));
      } else {
        return resolve('');
      }
    }))),
  );
  if (activateLogger) {
    console.log('Final Summaries:');
    console.log(result);
  }
  return result;
}

/**
 * Sends a command to the ASR backend.
 * @param command command to send to the ASR backend
 * @returns {Promise<void>}
 */
async function sendCommand(command) {
  if (activateLogger) console.log('Sending Command...');
  const data = await getDataNoJSON(`${asrURL}/${command}`);
  if (activateLogger) console.log(`Success Sending Command ${command}. Answer: ${data}`);
}

export { computeKeywords, sendCommand, computeSummary };

// function getData(url = '') {
//   // Default options are marked with *
//   return fetch(url, {
//     method: 'GET', // *GET, POST, PUT, DELETE, etc.
//     mode: 'cors', // no-cors, cors, *same-origin
//     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//     credentials: 'same-origin', // include, *same-origin, omit
//     headers: {
//       'Content-Type': 'application/json',
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     redirect: 'follow', // manual, *follow, error
//     referrer: 'no-referrer', // no-referrer, *client
//   })
//     .then(response => response.json()); // parses JSON response into native JavaScript objects
// }
