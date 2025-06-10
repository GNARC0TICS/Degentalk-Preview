# API Authentication and Specifications

You will need "APP ID" and "APP Secret" to sign every message sent to CCPayment.

## Rules for API Calls

| Rule                | Description                               |
| :------------------ | :---------------------------------------- |
| Transfer Mode       | HTTPS                                     |
| Submit Mode         | POST, may vary for different APIs         |
| Content-Type        | Application/Json                          |
| Char Encoding       | UTF-8                                     |
| Signature Algorithm | HmacSHA-256                               |

## Signature

Prepare a `signText` by creating a string concatenating `appId` and `timestamp`, and append the request payload if present. Example: `signText = {Appid} + {timestamp} + Payload in JSON format`

*   **HMAC**: Use SHA-256 hashing algorithm to compute the signature of the request data.
*   **RSA**: Use the RSA private key to sign the hashed data(SHA-256) and convert the signature into a Base64-encoded string.

10-digit timestamp The payload of the requests must be a JSON object. And the payload you sign should be exactly the same as the payload you send in the request.

Before signing, here are a few things you should check:

1.  Ensure the APP ID and App Secret are correct. You can check it on your dashboard. Note: If you use a random APP ID for any unauthorized actions, we will block the IP and APP ID after a number of requests.
2.  Make sure your website has been verified. Only verified merchant accounts have access to APIs.
3.  If you have set up an IP whitelist on your dashboard, ensure the IP address of your requests is included in your whitelist.

## Request Header

To ensure the proper handling of your requests by the server, please include the following headers in each request:

| Parameters | Type   | Required | Description                                                                                                                                                              |
| :--------- | :----- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Appid      | String | Yes      | Your CCPayment APP ID                                                                                                                                                    |
| Timestamp  | String | Yes      | 10-digit timestamp. Valid in 2 minutes. Example: `1677152720`                                                                                                            |
| Sign       | String | Yes      | Check the example on your right hand HMAC Example: `871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6` RSA Example: `R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A==` |

Headers for all requests made to CCPayment follow the same rule.

### HMAC Signature Example

```javascript
var sign = CryptoJS.HmacSHA256('The quick brown fox jumped over the lazy dog.',appSecret).toString();
```

#### API usage example

##### getCoinList interface (no parameters):

```javascript
const https = require('https');
const crypto = require('crypto');

const appId ='*** your appId ***';
const appSecret ='*** your appSecret ***';

const path = 'https://ccpayment.com/ccpayment/v2/getCoinList';
const args = '';

const timestamp = Math.floor(Date.now() / 1000);
let signText = appId + timestamp;
if (args) {
  signText += args;
}

const sign = crypto
  .createHmac('sha256', appSecret)
  .update(signText)
  .digest('hex');

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Appid': appId,
    'Sign': sign,
    'Timestamp': timestamp.toString(),
  },
};

const req = https.request(path, options, (res) => {
  let respData = '';

  res.on('data', (chunk) => {
    respData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', respData);
  });
});

req.write(args);
req.end();
```

##### getCoin interface (need parameters):

```javascript
const https = require('https');
const crypto = require('crypto');

const appId ='*** your appId ***';
const appSecret ='*** your appSecret ***';

const path = 'https://ccpayment.com/ccpayment/v2/getCoin';
const args = JSON.stringify({ "coinId": 1280 });

const timestamp = Math.floor(Date.now() / 1000);
let signText = appId + timestamp;
if (args) {
  signText += args;
}

const sign = crypto
  .createHmac('sha256', appSecret)
  .update(signText)
  .digest('hex');

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Appid': appId,
    'Sign': sign,
    'Timestamp': timestamp.toString(),
  },
};

const req = https.request(path, options, (res) => {
  let respData = '';

  res.on('data', (chunk) => {
    respData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', respData);
  });
});

req.write(args);
req.end();
```

### RSA Signature Example

```javascript
// Prepare data to be signed
    const dataToSign = apiID + timestamp + apiParams;

    // Load the private key
    const privateKey = crypto.createPrivateKey(privateKeyPem);

    // Sign the data
    const sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    sign.end();

    const signature = sign.sign(privateKey, 'base64');
```

#### API usage example

##### getCoinList interface (need parameters):

```javascript
const crypto = require('crypto');
const https = require('https');

// Usage example
const apiID = "*** your app_id ***";
const privateKeyPem = `-----BEGIN PRIVATE KEY-----
*** your PRIVATE KEY ***
-----END PRIVATE KEY-----`
const apiParams = "";
const apiPath = "https://ccpayment.com/ccpayment/v2/getCoinList";

(async () => {
  try {
    const response = await signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath);
    console.log("Response:", response);
  } catch (err) {
    console.error("Error:", err);
  }
})();

function signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath) {
  return new Promise((resolve, reject) => {
    // Calculate the timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Prepare data to be signed
    const dataToSign = apiID + timestamp + apiParams;

    // Load the private key
    const privateKey = crypto.createPrivateKey(privateKeyPem);

    // Sign the data
    const sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    sign.end();

    const signature = sign.sign(privateKey, 'base64');

    // Send the request
    const postData = apiParams;

    const url = new URL(apiPath);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Appid': apiID,
        'Sign': signature,
        'Timestamp': timestamp,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      // Collect response data
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Resolve the response when it ends
      res.on('end', () => {
        resolve(data);
      });
    });

    // Handle request error
    req.on('error', (e) => {
      reject(e);
    });

    // Write POST data
    req.write(postData);
    req.end();
  });
}
