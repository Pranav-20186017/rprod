import http from 'k6/http';
import { check, sleep } from 'k6';
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js"

// Load CSV file and parse it using Papa Parse
const csvData = papaparse.parse(open('./keys_10.csv'), { header: true }).data;

export let options = {
  vus: 20000,
  duration: '60s',
};


export default function() {
  // Now you can use the CSV data in your test logic below.
  // Below are some examples of how you can access the CSV data.


  // Pick a random username/password pair
  let randomRow =
    csvData[Math.floor(Math.random() * csvData.length)];

  // const params = {
  //   'htno': randomRow.Key,
  // };

  let res = http.get('http://a27352475e8bb4f8b9e07d240819f9c6-81357596.ap-south-1.elb.amazonaws.com/results_test?htno=' + randomRow.Key.toString());
  check(res, {
    'login succeeded': r =>
      r.status === 200,
  });

  sleep(1);
}