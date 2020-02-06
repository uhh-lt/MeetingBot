const serverURL = 'http://localhost:8888';
const asrURL = 'http://localhost:5000';
const spacyURL = 'http://localhost:9000';
const summaryURL = 'http://localhost:9001';
const activateLogger = true;

function postData(url = '', data = {}) {
  return fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then(response => response.json()); // parses JSON response into native JavaScript objects
}

async function fetchKeywords(text, language) {
  let lang = null;
  if (language === 'en') {
    lang = 'eng';
  } else if (language === 'de') {
    lang = 'deu';
  }

  if (lang === null) return null;

  if (activateLogger) console.log('Fetching Keywords');
  const data = await postData(`${serverURL}/extractKeywords`, {
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

async function fetchSummary(text, length, lang) {
  if (activateLogger) console.log('Fetching Textrank Output');
  const data = await postData(`${summaryURL}/summarize`, {
    text,
    length,
    lang,
  });
  if (activateLogger) {
    console.log('Success fetching textrank output');
    console.log(data);
  }
  return data.summary;
}

async function computeKeywords(utterance, lang) {
  let keywords = await fetchKeywords(utterance.text, lang);
  // utterance.keywords = keywords.map(value => value.word).join(" ");
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

async function computeSummary(textSegments, lang) {
  // compute for each text segment the summary
  const result = await Promise.resolve(
    // eslint-disable-next-line consistent-return
    Promise.all(textSegments.map(content => new Promise((resolve) => {
      if (content.sentences > 0) {
        fetchSummary(content.text, Math.min(2, content.sentences), lang).then((data) => {
          // eslint-disable-next-line no-param-reassign
          return resolve(data);
        });
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
