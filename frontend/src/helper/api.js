const serverURL = 'http://localhost:8888/mbot';
const asrURL = 'http://localhost:5000';
const spacyURL = 'http://localhost:9000';

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
  console.log('Keywords are empty!');
  return [];
}

async function fetchSpacy(text) {
  console.log('Fetching Spacy Output');
  const data = await postData(`${spacyURL}/process`, {
    text,
  });
  console.log('Success fetching spacy output');
  console.log(data);
  return data;
}


// function promisedQuery(query, values) {
//   return new Promise((resolve, reject) => {
//     try {
//       withConnection(function (err, connection) {
//         if (err) {
//           return reject(err);
//         }
//         if (query !== Object(query)) {
//           query = {
//             sql: query,
//             values: values,
//           };
//         }
//         try {
//           connection.query(query, function (err, rows, fields) {
//             connection.release();
//             if (err) {
//               return reject(Exception.fromError(err, `Query failed: '${query.sql}'.`, {query: query, values: values}));
//             }
//             return resolve({ rows: rows, fields: fields });
//           });
//         } catch (e) {
//           return reject(Exception.fromError(e, `Query failed: '${query.sql}'.`, {query: query, values: values}));
//         }
//       });
//     } catch (e) {
//       return reject(Exception.fromError(e, `Query failed: '${query.sql}'.`, {query: query, values: values}));
//     }
//   });
// }


async function computeKeywords(utterance) {
  let keywords = await fetchKeywords(utterance.text);
  // utterance.keywords = keywords.map(value => value.word).join(" ");
  keywords = keywords.filter(value => value.word !== 'UNK');

  const result = await Promise.resolve(Promise.all(keywords.map(k => new Promise((resolve, reject) => {
    fetchSpacy(k.word).then((data) => {
      k.spacy = data;
      return resolve(k);
    });
  }))));
    // .then((kw) => {
  //   console.log('all prommises settled!');
  //   console.log(kw);
  //   // if (kw.status === 'fulfilled') {
  //   //   return kw.value;
  //   // }
  //   // return 'error';
  //   return kw;
  // }).catch(console.error);
  console.log('Promise result:');
  console.log(result);
  return result;


  // console.log('LOL!!!');
  //
  // // for (let i = 0; i < keywords.length; i += 1) {
  // //   const keyword = keywords[i];
  // //   // eslint-disable-next-line no-await-in-loop
  // //   const data = await fetchSpacy(keyword.word);
  // //   keyword.pos = data.pos;
  // //   console.log(data);
  // // }
  //
  // // keywords = keywords
  // //   .flatMap(value => {
  // //     return {
  // //       word: value.word.split(' '),
  // //       score: value.score,
  // //     }
  // // }).map(value => value.toLowerCase());
  //
  // return keywords;
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
  console.log('Sending Command...');
  const data = await getDataNoJSON(`${asrURL}/${command}`);
  console.log(`Success Sending Command ${command}. Answer: ${data}`);
}

export { computeKeywords, sendCommand };

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
