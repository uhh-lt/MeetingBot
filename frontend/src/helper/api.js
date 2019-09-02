export { computeKeywords };

const serverURL = 'http://localhost:8888/mbot';

async function computeKeywords(utterance) {
  let keywords = await fetchKeywords(utterance.text);
  // utterance.keywords = keywords.map(value => value.word).join(" ");
  keywords = keywords.filter(value => value.word !== 'UNK');
  utterance.keywords = keywords;
}

async function fetchKeywords(text) {
  console.log('Fetching Keywords');
  const data = await postData(`${serverURL}/keywords`, {
    count: 3,
    lang: 'deu',
    text,
  });
  console.log('Success fetching keywords');
  if (data.keywords !== null && data.keywords.length > 0) {
    return data.keywords;
  }
  throw new Error('Keywords are empty!');
}

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
