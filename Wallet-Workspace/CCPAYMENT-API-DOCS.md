# CCPayment API Documentation

## Table of Contents

*   [Introduction](#introduction)
*   [Quick Guide](#quick-guide)
    *   [Credentials](#credentials)
*   [SDKs and Code Examples](#sdks-and-code-examples)
*   [API Authentication and Specifications](#api-authentication-and-specifications)
    *   [Rules for API Calls](#rules-for-api-calls)
    *   [Signature](#signature)
    *   [Request Header](#request-header)
    *   [HMAC Signature Example](#hmac-signature-example)
    *   [API Usage Example (HMAC)](#api-usage-example-hmac)
    *   [RSA Signature Example](#rsa-signature-example)
    *   [API Usage Example (RSA)](#api-usage-example-rsa)
*   [Request Limits](#request-limits)
*   [Testnet](#testnet)
*   [Webhook](#webhook)
    *   [Webhook Guide](#webhook-guide)
    *   [Set Webhook URL](#set-webhook-url)
    *   [How to Handle Incoming Webhooks](#how-to-handle-incoming-webhooks)
    *   [Retry Logic](#retry-logic)
    *   [Idempotency](#idempotency)
    *   [View Webhook Notification Logs and Resend Webhooks](#view-webhook-notification-logs-and-resend-webhooks)
    *   [Resend Webhook by Calling API](#resend-webhook-by-calling-api)
*   [Deposit APIs](#deposit-apis)
    *   [Get Permanent Deposit Address](#get-permanent-deposit-address)
    *   [Webhook for Direct Deposit](#webhook-for-direct-deposit)
    *   [Webhook for Risky Address](#webhook-for-risky-address)
    *   [Deposit Address for Order](#deposit-address-for-order)
        *   [Deposit with merchant-specified currency and network](#deposit-with-merchant-specified-currency-and-network)
        *   [Webhook for API Deposit (Merchant-Specified)](#webhook-for-api-deposit-merchant-specified)
        *   [Get order information (merchant-specified currency deposit order)](#get-order-information-merchant-specified-currency-deposit-order)
        *   [Deposit with customer-selected currency and network](#deposit-with-customer-selected-currency-and-network)
        *   [Webhook for Invoice API Deposit (Customer-Selected)](#webhook-for-invoice-api-deposit-customer-selected)
        *   [Get order information (customer-selected currency deposit order)](#get-order-information-customer-selected-currency-deposit-order)
    *   [Address Unbinding](#address-unbinding)
    *   [Get Deposit Record](#get-deposit-record)
    *   [Get Deposit Record List](#get-deposit-record-list)
*   [Withdrawal API](#withdrawal-api)
    *   [Create Network Withdrawal Order](#create-network-withdrawal-order)
    *   [Webhook for API Withdrawal](#webhook-for-api-withdrawal)
    *   [Withdrawal to Cwallet Account](#withdrawal-to-cwallet-account)
    *   [Get Withdrawal Record](#get-withdrawal-record)
    *   [Get Withdrawal Record List](#get-withdrawal-record-list)
*   [Swap API](#swap-api)
    *   [Get Swap Quote](#get-swap-quote)
    *   [Create and Fulfill Swap Order](#create-and-fulfill-swap-order)
    *   [Get Swap Record](#get-swap-record)
    *   [Get Swap Record List](#get-swap-record-list)
*   [Create a Wallet System](#create-a-wallet-system)
    *   [User Balance](#user-balance)
        *   [Get User Balance List](#get-user-balance-list)
        *   [Get coin balance of users](#get-coin-balance-of-users)
    *   [User Deposit API](#user-deposit-api)
        *   [Create or Get User Deposit Address](#create-or-get-user-deposit-address)
        *   [Webhook for User Deposit](#webhook-for-user-deposit)
        *   [Get User Deposit Record](#get-user-deposit-record)
        *   [Get User Deposit Record List](#get-user-deposit-record-list)
    *   [User Withdrawal API](#user-withdrawal-api)
        *   [Withdrawal to Blockchain Address](#withdrawal-to-blockchain-address)
        *   [Webhook for User Withdrawal](#webhook-for-user-withdrawal)
        *   [Withdrawal to Cwallet Account (User)](#withdrawal-to-cwallet-account-user)
        *   [Get User Withdrawal Record](#get-user-withdrawal-record)
        *   [Get User Withdrawal Record List](#get-user-withdrawal-record-list)
    *   [User Internal Transaction API](#user-internal-transaction-api)
        *   [Create an Internal Transaction](#create-an-internal-transaction)
        *   [Get User Internal Transaction Record](#get-user-internal-transaction-record)
        *   [Get User Internal Transaction Record List](#get-user-internal-transaction-record-list)
    *   [User Swap API](#user-swap-api)
        *   [User Get Swap Quote](#user-get-swap-quote)
        *   [Create and Fulfill User Swap Order](#create-and-fulfill-user-swap-order)
        *   [Get User Swap Record](#get-user-swap-record)
        *   [Get User Swap Record List](#get-user-swap-record-list)
*   [Common API](#common-api)
    *   [Get Token List](#get-token-list)
    *   [Get Token Information](#get-token-information)
    *   [Get Token Price](#get-token-price)
    *   [Balance Query APIs](#balance-query-apis)
        *   [Get Balance List](#get-balance-list)
        *   [Get Coin Balance](#get-coin-balance)
    *   [Rescan Lost Transaction](#rescan-lost-transaction)
    *   [Get Cwallet User Information](#get-cwallet-user-information)
    *   [Check Withdrawal Address Validity](#check-withdrawal-address-validity)
    *   [Get Withdrawal Network Fee](#get-withdrawal-network-fee)
    *   [Get Fiat List](#get-fiat-list)
    *   [Get Swap Coin List](#get-swap-coin-list)
    *   [Get Chain List](#get-chain-list)
*   [Support](#support)
    *   [FAQ](#faq)
    *   [Status Code](#status-code)
    *   [Error Code](#error-code)
    *   [Contact Us](#contact-us)

---

## Introduction

CCPayment is a cryptocurrency payment platform allowing merchants to accept and payout over 100 cryptocurrencies with the lowest fees on the market.

---

## Quick Guide

### Credentials

To establish communication with CCPayment systems, you need credentials for your Terminals.

**How to obtain Credentials:**

1.  **Step 1:** Go to the registration page of CCPayment and sign up using your email address.
2.  **Step 2:** Log in and navigate to the **Dashboard > Developer** to obtain your "APP ID" and "APP Secret", which will serve as your credentials to communicate with CCPayment.

---

## SDKs and Code Examples

The code examples provided in this documentation primarily use Node.js. CCPayment may offer SDKs or further examples for other programming languages such as:

*   Java
*   PHP
*   Python
*   Node.js (as shown)
*   Golang

For the latest information on available SDKs and language-specific integration guides, please refer to the official CCPayment developer portal or contact our support team.

---

## API Authentication and Specifications

You will need "APP ID" and "APP Secret" to sign every message sent to CCPayment.

### Rules for API Calls

| Rule                | Description                                       |
| :------------------ | :------------------------------------------------ |
| Transfer Mode       | HTTPS                                             |
| Submit Mode         | POST, may vary for different APIs                 |
| Content-Type        | `application/json`                                |
| Char Encoding       | UTF-8                                             |
| Signature Algorithm | HmacSHA256 (or RSA, depending on your setup)      |

### Signature

Prepare a `signText` by creating a string concatenating your `Appid` and `timestamp`, and then append the request payload (body) if present.

**Example:** `signText = {Appid} + {timestamp} + PayloadInJSONFormat`

*   **HMAC:** Use SHA-256 hashing algorithm with your `AppSecret` to compute the signature of the `signText`.
*   **RSA:** Use your RSA private key to sign the SHA-256 hash of the `signText` and convert the signature into a Base64-encoded string.

The `timestamp` must be a 10-digit Unix timestamp (seconds). The payload of the requests must be a JSON object. The payload you sign should be exactly the same as the payload you send in the request body.

**Before signing, please check the following:**

1.  Ensure the **APP ID** and **App Secret** (or RSA keys) are correct. You can verify them on your dashboard.
    *   **Note:** If you use a random APP ID for unauthorized actions, CCPayment will block the IP and APP ID after a number of requests.
2.  Make sure your website has been verified. Only verified merchant accounts have access to APIs.
3.  If you have set up an IP whitelist on your dashboard, ensure the IP address of your requests is included in your whitelist.

### Request Header

To ensure the proper handling of your requests by the server, please include the following headers in each request:

| Parameters | Type   | Required | Description                                                     |
| :--------- | :----- | :------- | :-------------------------------------------------------------- |
| `Appid`    | String | Yes      | Your CCPayment APP ID.                                          |
| `Timestamp`| String | Yes      | 10-digit Unix timestamp. Valid for 2 minutes. Example: `1677152720`. |
| `Sign`     | String | Yes      | The generated signature. See examples below.                    |

Headers for all requests made to CCPayment follow the same rule.

#### HMAC Signature Example
```javascript
// Example: Generating an HMAC SHA256 signature
// const appSecret = 'YOUR_APP_SECRET';
// const signText = appId + timestamp + requestBody; // requestBody is the JSON string payload
// const sign = CryptoJS.HmacSHA256(signText, appSecret).toString();

// A conceptual example from the original docs:
// var sign = CryptoJS.HmacSHA256('The quick brown fox jumped over the lazy dog.', appSecret).toString();
```

#### API Usage Example (HMAC)

**`getCoinList` interface (no parameters):**
```javascript
const https = require('https');
const crypto = require('crypto');

const appId = '*** your appId ***';
const appSecret = '*** your appSecret ***';

const path = 'https://ccpayment.com/ccpayment/v2/getCoinList';
const args = ''; // No request body for this endpoint

const timestamp = Math.floor(Date.now() / 1000);
let signText = appId + timestamp;
if (args) { // Though args is empty here, this structure is for consistency
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

req.on('error', (error) => {
  console.error('Error:', error);
});

// If there were args (a request body), you would write it here.
// Since args is empty, this effectively sends an empty body.
req.write(args);
req.end();
```

**`getCoin` interface (with parameters):**
```javascript
const https = require('https');
const crypto = require('crypto');

const appId = '*** your appId ***';
const appSecret = '*** your appSecret ***';

const path = 'https://ccpayment.com/ccpayment/v2/getCoin';
const requestPayload = { "coinId": 1280 };
const args = JSON.stringify(requestPayload);

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

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(args);
req.end();
```

#### RSA Signature Example
```javascript
// Prepare data to be signed
// const dataToSign = apiID + timestamp + apiParams; // apiParams is the JSON string payload

// Load the private key
// const privateKey = crypto.createPrivateKey(privateKeyPem);

// Sign the data
// const signInstance = crypto.createSign('SHA256');
// signInstance.update(dataToSign);
// signInstance.end();

// const signature = signInstance.sign(privateKey, 'base64');
```

#### API Usage Example (RSA)

**`getCoinList` interface (no parameters, using RSA):**
```javascript
const crypto = require('crypto');
const https = require('https');

// Usage example
const apiID = "*** your app_id ***";
const privateKeyPem = `-----BEGIN PRIVATE KEY-----
*** YOUR RSA PRIVATE KEY CONTENTS ***
-----END PRIVATE KEY-----`;
const apiParamsJsonString = ""; // No parameters for getCoinList
const apiPath = "https://ccpayment.com/ccpayment/v2/getCoinList";

async function signWithPrivateKeyAndRequest(apiID, privateKeyPem, apiParamsJsonString, apiPath) {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const dataToSign = apiID + timestamp + apiParamsJsonString;

    let signature;
    try {
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        const signInstance = crypto.createSign('SHA256');
        signInstance.update(dataToSign);
        signInstance.end();
        signature = signInstance.sign(privateKey, 'base64');
    } catch (e) {
        reject(new Error("Error creating RSA signature: " + e.message));
        return;
    }
    
    const postData = apiParamsJsonString; // This will be an empty string for getCoinList

    const url = new URL(apiPath);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Appid': apiID,
        'Sign': signature,
        'Timestamp': timestamp,
        // 'Content-Type': 'application/json', // For JSON body
        // If sending form-urlencoded (as in original example, but JSON is more common for APIs)
        'Content-Type': apiParamsJsonString ? 'application/json' : 'application/x-www-form-urlencoded', 
        // Ensure Content-Length is set if body is not empty, or let Node.js handle it.
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });

    req.on('error', (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    const response = await signWithPrivateKeyAndRequest(apiID, privateKeyPem, apiParamsJsonString, apiPath);
    console.log("Response:", response);
  } catch (err) {
    console.error("Error:", err);
  }
})();
```
**Note on RSA Example:** The original RSA example used `Content-Type: application/x-www-form-urlencoded` even for an empty body. For JSON APIs, `application/json` is standard. If the body is empty, some servers might expect `Content-Length: 0` or no `Content-Type` for POST, or a specific one like `application/x-www-form-urlencoded`. The example above uses `application/json` if `apiParamsJsonString` is present, otherwise `application/x-www-form-urlencoded` to align with the original example's header, but this might need adjustment based on actual server requirements for empty bodies.

---

## Request Limits

Check the specific interface documentation for exact rate limit information.
If you receive an error with `"Errorcode": "11004"`, it means you have reached the rate limit.
To increase the limit, please contact your CCPayment account manager.

---

## Testnet

If you would like to test your integration with test currencies, you can use ETH Sepolia to test the functions. Navigate to **CCPayment dashboard > Merchant Settings > Merchant Settings > ETH test network** and turn the switch on to enable the test network.

**Get free test Sepolia ETH from Faucets:**
Faucets are online resources where you can receive free testnet coins.
*   [https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
*   [https://sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de)
*   [https://www.allthatnode.com/faucet/ethereum.dsrv](https://www.allthatnode.com/faucet/ethereum.dsrv)
*   [https://faucet.quicknode.com/drip](https://faucet.quicknode.com/drip)

**Check transaction details on blockchain explorer:**
`https://sepolia.etherscan.io/[your_txid]`

When you finish testing and debugging, switch the ETH test network off.
**Note:** Testing Sepolia ETH has no real value. It is only for testing purposes.

---

## Webhook

CCPayment notifies you of real-time transaction statuses by sending Webhook notifications to your server.
When a merchant's server receives a Webhook request, it can parse the information in the payload and perform corresponding operations, such as updating order status or generating shipping notifications.

### Webhook Guide

Deposits of coins in the "Tokens for your business" list will have webhook notifications sent. Deposits of non-supported coins for your business will not have webhook notifications sent to your server. Navigate to **Dashboard > Settings > Tokens for your business** to configure it.

### Set Webhook URL

Go to **Dashboard > Developer > Webhook URL** to set your Webhook receiving URL.
Please note that if your server has an IP whitelist configured, make sure to add our Webhook sending IPs to the whitelist:
*   `54.150.123.157`
*   `35.72.150.75`
*   `18.176.186.244`

### How to Handle Incoming Webhooks

1.  **Verify Signature:** Always verify if the signature provided in the webhook matches the one you generate on your own. Obtain the value of `Sign` from the request header and other necessary parameters. The request header parameters are as follows:

    | Parameters | Type   | Required | Description                                         |
    | :--------- | :----- | :------- | :-------------------------------------------------- |
    | `Appid`    | String | Yes      | Your CCPayment APP ID.                              |
    | `Timestamp`| String | Yes      | 10-digit timestamp. Valid for 2 minutes.            |
    | `Sign`     | String | Yes      | Signature to verify. See example code below.        |

    The `signText` for webhook verification is `{Appid} + {timestamp} + PayloadJSON`. Please refer to the [Signature](#signature) documentation.

    **HMAC Signature Verification:**
    Use HMAC-SHA256 to generate the `Sign` value using your `AppSecret` and the `signText`. Compare the generated sign value with the one sent in the request header. If the two sign values are equal, the verification is successful. You can proceed to handle the webhook request. If the sign values do not match, the verification fails, which indicates the request may have been tampered with.

    **RSA Signature Verification:**
    Decode the Base64-encoded signature received in the request. Use your RSA public key (corresponding to the private key CCPayment uses, or vice-versa if CCPayment signs with their private key and you verify with their public key - clarify this flow from CCPayment's main RSA setup guide) to verify the signature against the `signText` (`{APP ID} + {Timestamp} + PayloadJSON object}`). If the verification is successful, proceed. Otherwise, the request may have been tampered with.

2.  **Parse the Payload:** Use the `recordID` or `referenceID` (or other relevant identifiers like `orderId`) in the payload of the webhook to retrieve transaction details by calling the appropriate API endpoint (e.g., Get Deposit Record, Get Order Information). Credit users based on transaction details returned by the API interface, not solely on the webhook payload.

3.  **Respond:** After successfully processing and verifying a Webhook notification, your server must respond with an HTTP status code `200`. The response body should be `Content-Type: text/plain; charset=utf-8` and include the string "Success" in the HTTP Payload. When CCPayment receives this response, it will stop pushing further notifications for that event.

**Signature Verification Example (HMAC):**
```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware to parse text/plain body, as CCPayment sends webhook payload as plain text JSON string
app.use(express.text({ type: '*/*' })); // Adjust type if CCPayment sends a specific Content-Type for webhooks

function verifySignature(requestBodyText, signatureFromHeader, appId, appSecret, timestampFromHeader) {
  // Ensure requestBodyText is the raw, unmodified string of the JSON payload
  let signText = `${appId}${timestampFromHeader}${requestBodyText}`;
  let serverCalculatedSign = crypto.createHmac('sha256', appSecret).update(signText).digest('hex');
  return signatureFromHeader === serverCalculatedSign;
}

app.post('/webhook', (req, res) => {
    const appIdFromHeader = req.header('Appid'); // Or your configured App ID
    const appSecret = '*** your_app_secret ***'; // Load this securely
    const timestampFromHeader = req.header('Timestamp');
    const signatureFromHeader = req.header('Sign');
    
    // req.body will contain the raw request payload as a string due to express.text()
    const requestBodyText = req.body; 

    // It's crucial that appIdFromHeader matches the AppId you expect for this endpoint/secret
    if (appIdFromHeader !== '*** your_app_id ***') {
        console.warn('Webhook received with unexpected Appid:', appIdFromHeader);
        res.status(400).send('Invalid Appid');
        return;
    }

    if (verifySignature(requestBodyText, signatureFromHeader, appIdFromHeader, appSecret, timestampFromHeader)) {
        console.log('Webhook signature verified. Payload:', requestBodyText);
        // Process the webhook payload (e.g., parse requestBodyText as JSON and handle event)
        // JSON.parse(requestBodyText); 
        res.status(200).type('text/plain').send('Success');
    } else {
        console.warn('Webhook signature verification failed.');
        res.status(401).send('Invalid signature');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

### Retry Logic

If CCPayment does not receive an HTTP `200` response with a "Success" string in the response body, we will try to reach your endpoint again up to 6 times.

**Retry Intervals:**
*   30 seconds
*   1 minute 30 seconds
*   3 minutes 30 seconds
*   7 minutes 30 seconds
*   15 minutes 30 seconds
*   31 minutes 30 seconds

Merchants must implement idempotency in their code upon receiving Webhook notifications to prevent multiple crediting for one payment.

### Idempotency

**Overview**
To prevent the processing of duplicate transactions due to network issues or retry mechanisms, your system must ensure that each transaction (identified by a unique `recordId` or `txId`) is processed only once.

**How to Implement Idempotency**
Upon receiving a deposit notification (or any event) from CCPayment, check if the transaction/event (e.g., using `recordId` or `txId` from the webhook payload, after fetching full details via API) is already recorded and processed in your database. If it exists and was successfully processed, skip further processing to prevent duplicate actions (e.g., crediting a user multiple times).

**Example:**
```javascript
// Pseudocode for handling idempotency
// const eventData = JSON.parse(webhookPayloadText);
// const uniqueTransactionId = eventData.msg.recordId; // Or another unique ID like txId from API call

if (db.transactionHasBeenProcessed(uniqueTransactionId)) {
    console.log(`Transaction ${uniqueTransactionId} has already been processed.`);
    // Still respond with 200 OK, "Success" to acknowledge receipt
} else {
    // Business processing logic (e.g., fetch full details via API, credit user)
    // Mark transaction as processed in db
    // db.markTransactionAsProcessed(uniqueTransactionId);
}
```

### View Webhook Notification Logs and Resend Webhooks

Navigate to **Dashboard > Webhook** to view webhook logs. You can also resend one webhook or multiple webhooks in batch on this page.

### Resend Webhook by Calling API

Resend webhooks for transactions within a specified time period through this interface.

**HTTP Request:** `POST https://ccpayment.com/ccpayment/v2/webhook/resend`

**Parameters:**

| Parameters        | Type         | Required | Description                                                                                                                               |
| :---------------- | :----------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `recordIds`       | Array        | No       | Specify the record IDs to resend the webhook. A maximum of 50 webhooks can be resent in one batch.                                        |
| `startTimestamp`  | Integer      | Yes      | Resend webhooks for all transactions created after this start time. It should be a 10-digit timestamp.                                    |
| `endTimestamp`    | Integer      | No       | Resend webhooks for all transactions created before this end time. It should be a 10-digit timestamp. If empty, defaults to 1 hour after `startTimestamp`. Max 1-hour difference. |
| `webhookResult`   | String       | No       | `Failed` (Default): Only resend failed webhooks. `AllResult`: Resend all webhooks.                                                        |
| `transactionType` | String       | No       | `AllType` (Default), `ApiDeposit`, `DirectDeposit`, `ApiWithdrawal`, `UserDeposit`, `UserWithdrawal`.                                       |

**Request Example:**
```javascript
const https = require('https');
const crypto = require('crypto');

const appId = '*** your appId ***';
const appSecret = '*** your appSecret ***';

const path = 'https://ccpayment.com/ccpayment/v2/webhook/resend';
const requestPayload = {"startTimestamp": 1710145756}; // Example: resend failed webhooks for 1hr from this time
const args = JSON.stringify(requestPayload);

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
  res.on('data', (chunk) => { respData += chunk; });
  res.on('end', () => { console.log('Response:', JSON.parse(respData)); });
});
req.on('error', (e) => { console.error('Error:', e); });
req.write(args);
req.end();
```

**Response Parameters:**

| Parameters           | Type    | Description                                                       |
| :------------------- | :------ | :---------------------------------------------------------------- |
| `data`               | Object  |                                                                   |
| `data.resendCount`   | Integer | Number of webhooks successfully queued for resending.             |

**Result Example:**
```json
{
  "code": 10000,
  "msg": "Success",
  "data": {
    "resendCount": 1
  }
}
```

---

## Deposit APIs

### Get Permanent Deposit Address

When you make a request to this endpoint with a `referenceId` and `chain` specified, CCPayment first checks to see if there is an existing permanent address associated with the given reference ID.

**Address Handling:**
*   **Existing Address:** If a permanent address is already linked to the `referenceId`, CCPayment will return this address.
*   **New Address:** If no address is linked, CCPayment will generate a new deposit address for that `referenceId` on the specified blockchain network and return this new address.

Each APP ID can obtain 1000 addresses via this interface. If you need more, contact customer service.

**HTTP Request:** `POST https://ccpayment.com/ccpayment/v2/getOrCreateAppDepositAddress`

**Parameters:**

| Parameters    | Type   | Required | Description                                                                                                |
| :------------ | :----- | :------- | :--------------------------------------------------------------------------------------------------------- |
| `referenceId` | String | Yes      | 3 - 64 characters. Unique reference ID for the user in your system.                                        |
| `chain`       | String | Yes      | Symbol of the chain. Call "Get Token Information" API and use `data.coin[index].networks[chain].chain`. E.g., `TRX`. |

**Request Example:**
```javascript
const https = require("https");
const crypto = require("crypto");

const appId = "*** your appId ***";
const appSecret = "*** your appSecret ***";

const path = "https://ccpayment.com/ccpayment/v2/getOrCreateAppDepositAddress";
const requestPayload = {
  "referenceId": String(Math.floor(Date.now() / 1000)), // Example unique ID
  "chain": "POLYGON",
};
const args = JSON.stringify(requestPayload);

const timestamp = Math.floor(Date.now() / 1000);
let signText = appId + timestamp;
if (args.length > 0) { // Check if args is not an empty string
  signText += args;
}

const sign = crypto
  .createHmac("sha256", appSecret)
  .update(signText)
  .digest("hex");

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Appid": appId,
    "Sign": sign,
    "Timestamp": timestamp.toString(),
  },
};

const req = https.request(path, options, (res) => {
  let respData = "";
  res.on("data", (chunk) => { respData += chunk; });
  res.on("end", () => { console.log("Response:", JSON.parse(respData)); });
});
req.on('error', (e) => { console.error('Error:', e); });
req.write(args);
req.end();
```

**Response Parameters:**

| Parameters   | Type   | Description                                                                                             |
| :----------- | :----- | :------------------------------------------------------------------------------------------------------ |
| `data`       | Object |                                                                                                         |
| `data.address` | String | Permanent deposit address.                                                                              |
| `data.memo`  | String | For memo-required coins (e.g., XRP, XLM), the payer must fill in the correct memo to initiate the payment. |

**Response Example:**
```json
{
  "code": 10000,
  "msg": "success",
  "data": {
    "address": "0x7C631947c139F0163fECc0eef39f251D72dAE3B8",
    "memo": ""
  }
}
```

### Webhook for Direct Deposit

After receiving this webhook, the merchant's server should call the [Get Deposit Record](#get-deposit-record) API to confirm the deposit information.

**Webhook Parameters (Payload):**

| Parameters             | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             HINL_PROMPT_BLOCK_KIND_SYSTEM
The user wants to update the content of the file `CCPAYMENT-API-DOCS.M`.
The user provided the current content of the_file via the `file_content` parameter.
The user also provided a PDF file which might contain additional information or context.
The goal is to make the Markdown file clear and easy to
understand.

I will perform the following actions:
48req.write(args);
49req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.amount	String	Coin amount to pay
data.address	String	Deposit address. Your account can still receive the deposit and the webhook for 7 days after the expiration time.

Payments after the expiration time will be credited into your account with an "Overdue" status on the dashboard.
data.memo	String	For memo-required coins (such as XRP, XLM, etc.), the payer must fill in the correct memo to initiate the payment.
data.checkoutUrl	String	Will only be returned when a checkout URL has been created.
The payer will pay on this page.
data.confirmsNeeded	Integer	Required number of confirmations for an on-chain transaction
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "address": "0x9aBDDCE1EE18D1857C0653EB4a3Fa9d9E0dcd584",
6      "amount": "0.008552856654122477",
7      "memo": "",
8      "checkoutUrl": "https://i.ccpayment.com/xxx",
9      "confirmsNeeded": 50  
10    }
11  }
Webhook for API Deposit
After receiving a webhook, the merchant's server should call the Get Order Information API to confirm the order and payment information.
Webhook Parameters
Parameters	Type	Description
type	String	Type: ApiDeposit
msg	Object
msg.recordId	String	CCPayment unique ID for a transaction
msg.orderId	String	Your unique ID for the order
msg.coinId	Integer	Coin ID
msg.coinSymbol	String	Coin symbol
msg.status	String	
Processing: blockchain is processing the transaction

Success: the transaction has been confirmed

Failed: the transaction was not completed and the funds were not received

Learn more about transaction status
msg.isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
Note: If a payment is flagged as risky, CCPayment will not automatically credit the amount to your CCPayment account. We strongly recommend not automatically crediting risky payments to your users' accounts. After processing the payment, you can choose to either credit the user or refund the payment manually.
Request Example

1{
2  "type": "ApiDeposit",
3  "msg": {
4    "recordId": "20240313121919...",
5    "orderId": "202403131218361...",
6    "coinId": 1329,
7    "coinSymbol": "POL",
8    "status": "Success",
9    "isFlaggedAsRisky": false
10  }
11}
Get order information (merchant-specified currency deposit order)
This endpoint retrieves order information and all deposit records associated with the provided Order ID. Use case: if there are multiple payments under one order, you can obtain all the deposit records associated with that specific order by passing the order ID. And based on the information returned to determine whether the payment for this order is partially paid, overpaid, underpaid, or overdue payment.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppOrderInfo

Parameters
Parameters	Type	Required	Description
orderId	String	Yes	3 - 64 characters in length. Unique ID for the order in your system.
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6const orderId = "your_order_id";
7
8const path = "https://ccpayment.com/ccpayment/v2/getAppOrderInfo";
9const args = JSON.stringify({
10  "orderId":"1709889675"
11});
12
13const timestamp = Math.floor(Date.now() / 1000);
14let signText = appId + timestamp;
15if (args.length !== 0) {
16  signText += args;
17}
18
19const sign = crypto
20  .createHmac("sha256", appSecret)
21  .update(signText)
22  .digest("hex");
23
24const options = {
25  method: "POST",
26  headers: {
27    "Content-Type": "application/json",
28    "Appid": appId,
29    "Sign": sign,
30    "Timestamp": timestamp.toString(),
31  },
32};
33
34const req = https.request(path, options, (res) => {
35  let respData = "";
36
37  res.on("data", (chunk) => {
38    respData += chunk;
39  });
40
41  res.on("end", () => {
42    console.log("Response:", respData);
43  });
44});
45
46req.write(args);
47req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.amountToPay	String	Coin amount to pay
data.coinId	Integer	The deposit coin ID specified by the order.
data.coinSymbol	String	The deposit coin symbol specified by the order.
data.chain	String	The deposit chain symbol specified by the order.
data.toAddress	String	Deposit address. Your account can still receive the deposit and the webhook for 7 days after the expiration time.

Payments after the expiration time will be credited into your account with an "Overdue" status on the dashboard.
data.toMemo	String	For memo-required coins (such as XRP, XLM, etc.), the payer must fill in the correct memo to initiate the payment.
data.fiatId	Integer	Fiat price. This parameter will be included in the response if the order has a fiat price. 
data.fiatSymbol	String	Fiat symbol. This parameter will be included in the response if the order has a fiat price. 
data.rate	String	If the order has a fiat price, we will convert it to the coin amount to pay based on the current rate.

The rate will be included in the response if the order has a fiat price. amountToPay=price/rate 
data.createAt	Integer	Order creation timestamp, 10-digit
data.expiredAt	Integer	Order expiration time: Timestamp in seconds (10 digits). Default validity 24 hours without timestamp. The maximum validity 10 days. 

Before the expiration time, the rate will be locked. 

After the expiration time, your account will still receive all payments to the deposit address within 7 days.
data.checkoutUrl	String	Will only be returned when a checkout URL has been created.
The payer will pay on this page.
data.buyerEmail	String	CCPayment will send order and payment information to the provided mail address.
data.paidList	Array	List of payments for this order.

Note: If the coin used for payment differs from the pre-determined coin to pay, it will not be included in this payment list. For example, the pre-determined payment coin is ETH. A MATIC payment for this order will not be included in this payment list.
data.paidList[index].recordId	String	CCPayment unique ID for a transaction
data.paidList[index].fromAddress	String	From address, if the transaction is a UTXO type, no address will be returned. 
data.paidList[index].amount	String	Received amount
data.paidList[index].serviceFee	String	Service fee 
data.paidList[index].txid	String	TXID
data.paidList[index].status	String	
Success: the transaction has been confirmed

Processing: blockchain is processing the transaction

Failed: transaction failed

 
data.paidList[index].isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
data.paidList[index].arrivedAt	Integer	Deposit arrived timestamp
data.paidList[index].rate	String	
The rate at the time of receipt.
 If the payment is received before the expiration time of the order, the rate will remain as the rate locked at the time of order creation.
 If the payment is received after the expiration time of the order, the rate will be the rate at the time of receipt.


Paid fiat value = coin amount * rate

The rate will be included in the response if the order has a fiat price.  
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "amountToPay": "0.008552856654122477",
6      "coinId": 1329,
7      "coinSymbol": "MATIC",
8      "chain": "POLYGON",
9      "toAddress": "0x9abddce1ee18d1857c0653eb4a3fa9d9e0dcd584",
10      "createAt": 1710233933,
11      "rate": "1.1692",
12      "fiatId": 1033,
13      "fiatSymbol": "USD",
14      "expiredAt": 1710243931,
15      "checkoutUrl": "https://i.ccpayment.com/1djqz1m",
16      "paidList": [
17        {
18          "recordId": "20240312090316119190942031876096",
19          "fromAddress": "0x12438f04093ebc87f0ba629bbe93f2451711d967",
20          "amount": "0.001",
21          "serviceFee": "0.0000005",
22          "txid": "0xef4abf7175cefbe2f06002a959892e4b407bef02175980eaa9bb1967fcba1b22",
23          "status": "Success",
24          "arrivedAt": 1710234197,
25          "rate": "1.1692"
26        }
27      ]
28    }  
29  }
Deposit with customer-selected currency and network
This endpoint creates a checkout page URL where the customer can select currencies from the 'token for your business' configured in the merchant account to initiate the payment. Payments made in any of the configured currencies will be credited to the order. Merchants will receive Webhook notification for every payment made to this address. This type of deposit is 'API Deposit'.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/createInvoiceUrl

Parameters
Parameters	Type	Required	Description
orderId	String	Yes	Order ID created by merchant. 3-64 characters in length.
product	String	No	Product name that will be displayed on the payment page.
Must be less than 120 characters.
returnUrl	String	No	
URL to which the user will be redirected after completing the payment. Must be a valid URL format. 
price	String	Yes	
The price of the product, which can be specified as either a fiat amount or a cryptocurrency amount. 
priceFiatId	String	No	
ID for the fiat currency in which the price is denominated. Get fiat ID by calling Get Fiat List interface. 
priceCoinId	String	No	
ID for the cryptocurrency in which the price is denominated. Get coin ID by calling Get Token List interface. 
expiredAt	Integer	No	A 10-digit timestamp. Payment URL will expire at this time. Default value is 24 hours. 

Example: If URL is only valid for 30 mins.

expiredAt = Timestamp of creation + 60*30
buyerEmail	String	No	Email address of the buyer to receive payment confirmation and other transaction-related information.
Pass either priceFiatId or priceCoinId as the denominating currency. Do not pass both.
Request Example

1const crypto = require('crypto');
2const axios = require('axios');
3
4// Configuration variables
5const appID = "*** your app_id ***";
6const appSecret = "*** your app_secret ***";
7const url = "https://ccpayment.com/ccpayment/v2/createInvoiceUrl";
8
9// Build request body
10const content = {
11    orderId: String(Math.floor(Date.now() / 1000)), // Current timestamp in seconds
12    price: "1",
13    priceCoinId: "1280",
14    // Optional fields
15    // priceFiatId: "1033",
16    // product: "test",
17    // returnUrl: "",
18    // buyerEmail: "",
19    // expiredAt: ""
20};
21
22// Get the current timestamp (in seconds)
23const timestamp = Math.floor(Date.now() / 1000);
24
25// Convert the content object to a JSON string
26let body = JSON.stringify(content);
27
28// Create the signature base string
29let signText = appID + timestamp;
30if (body.length !== 2) { // Check if the body is an empty object
31    signText += body;
32} else {
33    body = "";
34}
35
36// Generate HMAC SHA256 signature
37function generateHMACSHA256(data, secret) {
38    return crypto.createHmac('sha256', secret).update(data).digest('hex');
39}
40
41const serverSign = generateHMACSHA256(signText, appSecret);
42
43// Set HTTP request headers
44const headers = {
45    'Content-Type': 'application/json;charset=utf-8',
46    'Appid': appID,
47    'Sign': serverSign,
48    'Timestamp': timestamp
49};
50
51// Send the HTTP POST request
52axios.post(url, body, { headers })
53    .then(response => {
54        console.log("Response:", response.data);
55    })
56    .catch(error => {
57        console.error("Error making request:", error.message);
58    });
59
Response Parameters
Parameters	Type	Description
data	Object	 
data.invoiceUrl	String	Invoice payment URL
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5        "invoiceUrl": "https://i.ccpayment.com/xxx"
6    }
7}
Webhook for Invoice API Deposit
After receiving a webhook, the merchant's server should call the Get Deposit Record endpoint to confirm the deposit information.
Webhook Parameters
Parameters	Type	Description
type	String	Type: ApiDeposit
msg	Object
msg.recordId	String	CCPayment unique ID for a transaction
msg.orderId	String	Your unique ID for the order. One order ID may have multiple record IDs if there are multiple payments for one order.
msg.coinId	Integer	Coin ID
msg.coinSymbol	String	Coin symbol
msg.status	String	
Processing: blockchain is processing the transaction

Success: the transaction has been confirmed

Failed: the transaction was not completed and the funds were not received

 
Learn more about transaction status
msg.isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
Note: If a payment is flagged as risky, CCPayment will not automatically credit the amount to your CCPayment account. We strongly recommend not automatically crediting risky payments to your users' accounts. After processing the payment, you can choose to either credit the user or refund the payment manually.
Request Example

1{
2  "type": "ApiDeposit",
3  "msg": {
4    "recordId": "20240919035020188328269786624000",
5    "orderId": "1726717497",
6    "coinId": 2541,
7    "coinSymbol": "POL",
8    "status": "Success",
9    "isFlaggedAsRisky": false,
10  }
11}
Get order information (customer-selected currency deposit order)
This endpoint retrieves invoice order information and all deposit records associated with the provided Order ID. Use case: if there are multiple payments under one order, you can obtain all the deposit records associated with that specific order by passing the order ID. And based on the information returned to determine whether the payment for this order is partially paid, overpaid, underpaid, or overdue payment.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getInvoiceOrderInfo

Parameters
Parameters	Type	Required	Description
orderId	String	Yes	3 - 64 characters in length. Unique ID for the order.
Request Example

1const crypto = require('crypto');
2const axios = require('axios');
3
4// Configuration variables
5const appID = "*** your app_id ***";
6const appSecret = "*** your app_secret ***";
7const url = "https://ccpayment.com/ccpayment/v2/getInvoiceOrderInfo";
8
9// Build request body
10const content = {
11    orderId: "xxxxxxxx",
12};
13
14// Get the current timestamp (in seconds)
15const timestamp = Math.floor(Date.now() / 1000);
16
17// Convert the content object to a JSON string
18let body = JSON.stringify(content);
19
20// Create the signature base string
21let signText = appID + timestamp;
22if (body.length !== 2) { // Check if the body is an empty object
23    signText += body;
24} else {
25    body = "";
26}
27
28// Generate HMAC SHA256 signature
29function generateHMACSHA256(data, secret) {
30    return crypto.createHmac('sha256', secret).update(data).digest('hex');
31}
32
33const serverSign = generateHMACSHA256(signText, appSecret);
34
35// Set HTTP request headers
36const headers = {
37    'Content-Type': 'application/json;charset=utf-8',
38    'Appid': appID,
39    'Sign': serverSign,
40    'Timestamp': timestamp
41};
42
43// Send the HTTP POST request
44axios.post(url, body, { headers })
45    .then(response => {
46        console.log("Response:", response.data);
47    })
48    .catch(error => {
49        console.error("Error making request:", error.message);
50    });
51
Response Parameters
Parameters	Type	Description
data	Object	 
data.orderId	String	Order ID created by merchant
data.createAt	Integer	Order creation timestamp, 10-digit
data.product	String	Product Name. Included only if a valid value is provided.
data.price	String	Product price
data.priceFiatId	Integer	
Fiat price. This parameter is included in the response if the invoice is denominated in fiat currency. 
data.priceCoinId	String	
Coin amount to pay. This parameter is included in the response if the invoice is denominated in cryptocurrency. 
data.priceSymbol	String	Symbol of the denominated currency. Example: 'BTC' for Bitcoin or 'EUR' for Euro.
data.invoiceUrl	String	Invoice payment URL
data.expiredAt	Integer	A 10-digit timestamp. Payment URL will expire at this time. Default value is 24 hours.

Example: If URL is valid for 30 mins. 

expiredAt = Timestamp of creation + 60*30
data.totalPaidValue	String	Total amount paid for this order in the denominated currency
data.buyerEmail	String	CCPayment will send order and payment information to the provided mail address.
data.paidList	Array	List of payments associated with this order
data.paidList[index].recordId	String	CCPayment unique ID for a transaction
data.paidList[index].coinId	Integer	Payment coin ID
data.paidList[index].coinSymbol	String	Payment coin symbol
data.paidList[index].paidAmount	String	Paid coin amount
data.paidList[index].serviceFee	String	Service fee 
data.paidList[index].rate	String	The rate at the time of receipt, calculated as:
Payment coin's USD value / Denominated currency's USD value
data.paidList[index].paidValue	String	Paid amount denominated value: Paid value = paid amount * rate
data.paidList[index].chain	String	Chain symbol
data.paidList[index].fromAddress	String	From address, if the transaction is a UTXO type, no address will be returned. 
data.paidList[index].toAddress	String	Receiving address for the selected coin. Payments made after 7 days past the order's expiration will still be credited to the merchant and labeled as overdue payment.
data.paidList[index].toMemo	String	Memo for memo-required coins (such as XRP, XLM, TON, etc.)
data.paidList[index].txid	String	TXID
data.paidList[index].status	String	
Success: the transaction has been confirmed

nProcessing: blockchain is processing the transaction

Failed: transaction failed  
data.paidList[index].isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
data.paidList[index].arrivedAt	String	Deposit arrived timestamp
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5        "orderId": "172707....",
6        "createAt": 1727074590,
7        "product": "test",
8        "price": "1",
9        "priceCoinId": 1280,
10        "priceSymbol": "USDT",
11        "invoiceUrl": "https://i.ccpayment.com/xxxxx",
12        "buyerEmail": "CCPaymentOfficial@proton.me",
13        "expiredAt": 1727160989,
14        "totalPaidValue": "1.022400000000000008",
15        "paidList": [
16            {
17                "recordId": "2024092306573418982494067xxxxx",
18                "coinId": 1280,
19                "coinSymbol": "USDT",
20                "chain": "BSC",
21                "fromAddress": "0x4766dc5207f5172c05da8d4f1dxxxxxxx",
22                "toAddress": "0xc53be3a4c137098200aa508dcfe6axxxxxxx",
23                "toMemo": "",
24                "paidAmount": "0.5",
25                "serviceFee": "0.0025",
26                "txid": "0xf227c25d124317a4b80094c0d55f5f248082636dbf3fca21fea3bxxxxxxxx",
27                "status": "Success",
28                "isFlaggedAsRisky": false,
29                "arrivedAt": 1727074654,
30                "rate": "1",
31                "paidValue": "0.5"
32            },
33            {
34                "recordId": "20240923070723189827xxxxxxxxx",
35                "coinId": 1340,
36                "coinSymbol": "CELO",
37                "chain": "CELO",
38                "fromAddress": "0x4766dc5207f5172c05da8d4f1d6659xxxxxxxx",
39                "toAddress": "0xc53be3a4c137098200aa508dcfe6a02axxxxxxxx",
40                "toMemo": "",
41                "paidAmount": "1",
42                "serviceFee": "0.005",
43                "txid": "0xba302c48b2169f4b853c98d0e618276fa5f93acd54b1f23a8b64310xxxxxxx",
44                "status": "Success",
45                "isFlaggedAsRisky": false,
46                "arrivedAt": 1727075243,
47                "rate": "1.9142419601837672",
48                "paidValue": "0.522400000000000008"
49            }
50        ]
51    }
52}
Address Unbinding
This endpoint allows you to unbind a deposit address from a userID/referenceID.
Use case:
If a deposit address is flagged as risky, unbinding it helps prevent potential asset freezing by the network. Once unbound, you can obtain a new deposit address for the same userID/referenceID by calling the Get Permanent Deposit Address/Get a User Deposit Address API.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/addressUnbinding

Parameters
Parameters	Type	Required	Description
chain	String	Yes	Chain symbol of the address to be unbound
address	String	Yes	Address to be unbound
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = "https://ccpayment.com/ccpayment/v2/addressUnbinding";
8const args = JSON.stringify({ 'chain': "POLYGON" ,'address':'0x3720C7f5b352E9da3A102B3b8c49080acAa4ceee'});
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24'Content-Type': 'application/json',
25'Appid': appId,
26'Sign': sign,
27'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.userID	String	If the address was previously bound to a user ID, this parameter will be returned.
data.referenceID	String	If the address was previously bound with a referenceID, this parameter will be returned.
data.unbound	Array	
Unbound address details, including chain and address
data.unbound[index].chain	String	The network for unbound address
data.unbound[index].address	String	Unbound address
data.unboundAt	Integer	Timestamp of the address unbinding operation
If an address on an EVM-compatible blockchain (e.g., ETH, BSC, Polygon) is unbound, the corresponding deposit addresses on other EVM-compatible networks will also be automatically unbound.
After unbinding, payments sent to the unbound address can still be credited to your merchant account.
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "unbound": [
6      {
7        "chain": "POLYGON",
8        "address": "0xa9a363196b22c1760cc7B777C5dD6264C376F20a"
9      }
10    ],
11    "unboundAt": 1741783734,
12    "userID": "",
13    "referenceID": "1735287108"
14  }
15}
Get Deposit Record
This endpoint retrieves the detailed information of a specific record ID. This is a very crucial endpoint for you to get transaction details and confirm the status of the transaction. You will need the information returned by the interface to update transaction status and credit your user accordingly.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppDepositRecord

Parameters
Parameters	Type	Required	Description
recordId	String	Yes	CCPayment unique ID for a transaction
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getAppDepositRecord";
8const args = JSON.stringify({
9  "recordId": "20250116073333231508600365121536" 
10});
11
12const timestamp = Math.floor(Date.now() / 1000);
13let signText = appId + timestamp;
14if (args.length !== 0) {
15  signText += args;
16}
17
18const sign = crypto
19  .createHmac("sha256", appSecret)
20  .update(signText)
21  .digest("hex");
22
23const options = {
24  method: "POST",
25  headers: {
26    "Content-Type": "application/json",
27    "Appid": appId,
28    "Sign": sign,
29    "Timestamp": timestamp.toString(),
30  },
31};
32
33const req = https.request(path, options, (res) => {
34  let respData = "";
35
36  res.on("data", (chunk) => {
37    respData += chunk;
38  });
39
40  res.on("end", () => {
41    console.log("Response:", respData);
42  });
43});
44
45req.write(args);
46req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.record	Object
data.record.recordId	String	CCPayment unique ID for a transaction
data.record.coinId	Integer	Deposit Coin ID
data.record.coinSymbol	String	Deposit Coin symbol
data.record.chain	String	Symbol of the chain 
data.reocrd.contract	String	Contract
data.record.coinUSDPrice	String	Coin price in USD at the time of payment receipt
data.record.fromAddress	String	From address, if the transaction is a UTXO type, this parameter will not be returned. 
data.record.toAddress	String	Destination address
data.record.toMemo	String	Memo of the address
data.record.amount	String	Received amount
data.record.serviceFee	String	Service fee 
data.record.txId	String	TXID
data.record.status	String	
Success: the transaction has been confirmed
Processing: blockchain is processing the transaction
Failed: transaction failed
data.record.isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
data.record.arrivedAt	Integer	Deposit arrived timestamp
data.record.referenceId	String	Reference ID will only be returned if the payment has a linked reference ID
data.record.orderId	String	Order ID will only be returned if the payment has a linked order ID
In UTXO-type transactions, the fromAddress will not be returned. The actual sender address is among a variety of input addresses. Please confirm with the payer of the transaction to obtain the sender address.
Response

1{
2'code': 10000,
3'msg': 'success',
4'data': {
5  'record': {
6    'recordId': '20250116073333231508600365121536',
7    'orderId': '1737011983',
8    'coinId': 1482,
9    'coinSymbol': 'TRX',
10    'chain': 'TRX',
11    'contract': 'TRX',
12    'coinUSDPrice': '0.23717',
13    'fromAddress': 'TRPKg7eGMy9aZS2RumSPeWoyVkDqTVwLgL',
14    'toAddress': 'TAkmn3f8bgwMAwdVrGfUVSRg4W2XwqgHGc',
15    'toMemo': '',
16    'amount': '0.5',
17    'serviceFee': '0.0025',
18    'txId': 'f39abf3275607fe2ffd40c06adf877f249829f6d1146a4f72ca2ad79ed7ed072',
19    'status': 'Success',
20    'arrivedAt': 1737012813,
21    'isFlaggedAsRisky': False
22    }
23  }
24}
Get Deposit Record List
Get a list of deposits records within a specific time range. Deposit records are sorted by creation time in descending order.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppDepositRecordList

Parameters
Parameters	Type	Required	Description
coinId	Integer	No	Coin ID
referenceId	String	No	3 - 64 characters in length. Unique reference ID for the user in your system.
orderId	String	No	
Order ID, 3-64 characters in length. Do not pass both order ID and reference ID in the same request.
chain	String	No	Symbol of the chain
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp.
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp.
nextId	String	No	
Next ID
If the query result exceeds 20 records, a "nextId" field will be returned.   You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getAppDepositRecordList";
8const args = "";
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args.length !== 0) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac("sha256", appSecret)
18  .update(signText)
19  .digest("hex");
20
21const options = {
22  method: "POST",
23  headers: {
24    "Content-Type": "application/json",
25    "Appid": appId,
26    "Sign": sign,
27    "Timestamp": timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = "";
33
34  res.on("data", (chunk) => {
35    respData += chunk;
36  });
37
38  res.on("end", () => {
39    console.log("Response:", respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.records	Array
data.records[index].recordId	String	CCPayment unique ID for a transaction
data.records[index].coinId	Integer	Deposit Coin ID
data.records[index].coinSymbol	String	Deposit Coin symbol
data.records[index].chain	String	Symbol of the chain
data.record[index].contract	String	Contract
data.record[index].coinUSDPrice	String	Coin price in USD at the time of payment receipt
data.records[index].fromAddress	String	From address, if the transaction is a UTXO type, no address will be returned. 
data.records[index].toAddress	String	Destination address
data.records[index].toMemo	String	Memo of the address
data.records[index].amount	String	Received amount
data.records[index].serviceFee	String	Service fee 
data.records[index].txId	String	TXID
data.records[index].status	String	
Success: the transaction has been confirmed
Processing: blockchain is processing the transaction
Failed: transaction failed
data.records[index].isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
data.records[index].arrivedAt	Integer	Deposit arrived timestamp
data.records[index].referenceId	String	Reference ID will only be returned if the payment has a linked reference ID
data.records[index].orderId	String	Order ID will only be returned if the payment has a linked order ID
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2  'code': 10000,
3  'msg': 'success',
4  'data': {
5    'records': [
6      {
7        'recordId': '20250116073333231508600365121536',
8        'orderId': '1737011983',
9        'coinId': 1482,
10        'coinSymbol': 'TRX',
11        'chain': 'TRX',
12        'contract': 'TRX',
13        'coinUSDPrice': '0.23717',
14        'fromAddress': 'TRPKg7eGMy9aZS2RumSPeWoyVkDqTVwLgL',
15        'toAddress': 'TAkmn3f8bgwMAwdVrGfUVSRg4W2XwqgHGc',
16        'toMemo': '',
17        'amount': '0.5',
18        'serviceFee': '0.0025',
19        'txId': 'f39abf3275607fe2ffd40c06adf877f249829f6d1146a4f72ca2ad79ed7ed072',
20        'status': 'Success',
21        'arrivedAt': 1737012813,
22        'isFlaggedAsRisky': False
23      },
24      ...
25    ],
26    'nextId': ''
27  }
28}
Withdrawal API
Create Network Withdrawal Order
This endpoint creates a withdrawal order to a blockchain address.
If a withdrawal is processing, CCPayment will send a webhook with the status of "Processing". If a withdrawal is confirmed, CCPayment will send a second webhook with the status of "Success". In some cases, on-chain processing is too fast to capture processing information. There will only be one webhook sent with the status of "Success".

HTTP Request
POST
https://ccpayment.com/ccpayment/v2/applyAppWithdrawToNetwork

Parameters
Parameters	Type	Required	Description
coinId	Integer	Yes	Coin ID
chain	String	Yes	Symbol of the chain
address	String	Yes	Withdrawal destination address
memo	String	No	Memo of the withdrawal address
orderId	String	Yes	Withdrawal order ID, 3-64 characters in length
amount	String	Yes	Withdrawal amount
merchantPayNetworkFee	Boolean	No	
True: merchants pay network fee
Net receivable = withdrawal amount
False: (default) users pay network fee
Net receivable = withdrawal amount - network fee
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/applyAppWithdrawToNetwork";
8const getPath = "https://ccpayment.com/ccpayment/v2/getAppWithdrawRecord"; 
9
10const args = JSON.stringify({
11  "coinId": 1280,
12  "address": "0xBb9C4e7F3687aca1AE2828c18f9E3ae067F569FE",
13  "orderId": String(Math.floor(Date.now() / 1000)),
14  "chain": "POLYGON",
15  "amount": "0.001",
16  //"merchantPayNetworkFee": False,
17  //"memo": "" 
18});
19
20const timestamp = Math.floor(Date.now() / 1000);
21let signText = appId + timestamp;
22if (args.length !== 0) {
23  signText += args;
24}
25
26const sign = crypto
27  .createHmac("sha256", appSecret)
28  .update(signText)
29  .digest("hex");
30
31const options = {
32  method: "POST",
33  headers: {
34    "Content-Type": "application/json",
35    "Appid": appId,
36    "Sign": sign,
37    "Timestamp": timestamp.toString(),
38  },
39  timeout: 15000, 
40};
41
42
43function isTimeoutError(err) {
44  return err.code === "ETIMEDOUT";
45}
46
47
48function makeRequest(path, args, retryCount = 3) {
49  return new Promise((resolve, reject) => {
50    const req = https.request(path, options, (res) => {
51      let respData = "";
52
53      res.on("data", (chunk) => {
54        respData += chunk;
55      });
56
57      res.on("end", () => {
58        resolve(respData);
59      });
60    });
61
62    req.on("error", (err) => {
63      if (isTimeoutError(err) && retryCount > 0) {
64        setTimeout(() => {
65          resolve(makeRequest(path, args, retryCount - 1));
66        }, 200); 
67      } else {
68        reject(err);
69      }
70    });
71
72    req.write(args);
73    req.end();
74  });
75}
76
77function getWithdrawRecord(orderId, retryCount = 3) {
78  const args = JSON.stringify({ orderId });
79
80  return makeRequest(getPath, args, retryCount)
81    .then((response) => {
82      console.log("Withdraw Record:", response);
83      return response;
84    })
85    .catch((error) => {
86      console.error("Error querying withdrawal record:", error);
87    });
88}
89
90makeRequest(path, args)
91  .then((response) => {
92    console.log("Withdrawal Request Response:", response);
93  })
94  .catch((error) => {
95    if (isTimeoutError(error)) {
96      console.log("Request timed out. Querying withdrawal record...");
97      const orderId = String(Math.floor(Date.now() / 1000));
98      getWithdrawRecord(orderId); 
99    } else {
100      console.error("Error:", error);
101    }
102  });
Response Parameters
Parameters	Type	Description
data	Object
data.recordId	String	Record ID
In the rare event of network jitter on your server, where you may not receive our response in a timely manner, please reconfirm the withdrawal status using the Get Withdrawal Record API. If the response indicates 'withdrawal success', this confirms that the withdrawal request has been successfully processed.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "recordId": "202403120909501767478092588126208"
6    }
7  }
Webhook for API Withdrawal
The payload of the webhook will include both the order ID and the record ID. You should use the record ID to call Get Withdrawal Record to retrieve the transfer information and update the withdrawal status or deduct the amount from your user's account accordingly.
Webhook Parameters
Parameters	Type	Description
type	String	Type: ApiWithdrawal
msg	Object
msg.recordId	String	CCPayment unique ID for a transaction
msg.orderId	String	Your unique ID for the order
msg.coinId	Integer	Coin ID
msg.coinSymbol	String	Coin symbol
msg.status	String	
Withdrawal status: 

WaitingApproval: Withdrawal is waiting manual approval. (This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard) 

Rejected: Withdrawal request has been rejected by merchant. (This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard)

Processing: transaction is processing

Success: transaction has been confirmed

Failed: transaction failed
 
Learn more about transaction status
Once a withdrawal transaction is initiated, the blockchain will confirm the transaction within a few minutes. However, due to rare external circumstances, merchants may sometimes fail to receive timely webhook notifications.
Request Example

1{
2  "type": "ApiWithdrawal",
3  "msg": {
4    "recordId": "20240313120722176788...",
5    "orderId": "6322851679...",
6    "coinId": 1891,
7    "coinSymbol": "TETH",
8    "status": "Success"
9  }
10}
Withdrawal to Cwallet Account
This endpoint creates the withdrawal order to Cwallet account
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/applyAppWithdrawToCwallet

Parameters
Parameters	Type	Required	Description
coinId	Integer	Yes	Coin ID
cwalletUser	String	Yes	
Cwallet users, Cwallet ID and Email are both OK.
amount	String	Yes	Withdrawal amount. Minimum limit is 0.001 USD.
orderId	String	Yes	Order ID, 3-64 characters in length
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/applyAppWithdrawToCwallet";
8const args = JSON.stringify({
9  "coinId": 1280,
10  "cwalletUser": '9558861',
11  "orderId": String(Math.floor(Date.now() / 1000)),
12  "amount": "0.002"
13});
14
15const timestamp = Math.floor(Date.now() / 1000);
16let signText = appId + timestamp;
17if (args.length !== 0) {
18  signText += args;
19}
20
21const sign = crypto
22  .createHmac("sha256", appSecret)
23  .update(signText)
24  .digest("hex");
25
26const options = {
27  method: "POST",
28  headers: {
29    "Content-Type": "application/json",
30    "Appid": appId,
31    "Sign": sign,
32    "Timestamp": timestamp.toString(),
33  },
34};
35
36const req = https.request(path, options, (res) => {
37  let respData = "";
38
39  res.on("data", (chunk) => {
40    respData += chunk;
41  });
42
43  res.on("end", () => {
44    console.log("Response:", respData);
45  });
46});
47
48req.write(args);
49req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.recordId	String	Record ID for the transaction
For transactions transferred to a Cwallet account, we will not send a webhook notification. Please reconfirm the withdrawal status using the Get Withdrawal Record API. If the response indicates 'withdrawal success', this confirms that the withdrawal request has been successfully processed.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "recordId": "202403120913091767478929213362176"
6    }
7  }
Get Withdrawal Record
This endpoint retrieves one specific withdrawal information.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppWithdrawRecord

Parameters
Parameters	Type	Required	Description
recordId	String	No	CCPayment unique ID for a transaction
orderId	String	No	Order ID, 3-64 characters in length
recordId and orderId cannot both be empty.
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getAppWithdrawRecord";
8const args = JSON.stringify({
9  "recordId": '202403010341121763409125674323968',
10  //"orderId": '17071162236'
11});
12
13const timestamp = Math.floor(Date.now() / 1000);
14let signText = appId + timestamp;
15if (args.length !== 0) {
16  signText += args;
17}
18
19const sign = crypto
20  .createHmac("sha256", appSecret)
21  .update(signText)
22  .digest("hex");
23
24const options = {
25  method: "POST",
26  headers: {
27    "Content-Type": "application/json",
28    "Appid": appId,
29    "Sign": sign,
30    "Timestamp": timestamp.toString(),
31  },
32};
33
34const req = https.request(path, options, (res) => {
35  let respData = "";
36
37  res.on("data", (chunk) => {
38    respData += chunk;
39  });
40
41  res.on("end", () => {
42    console.log("Response:", respData);
43  });
44});
45
46req.write(args);
47req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.record	Object
data.record.recordId	String	CCPayment unique ID for a transaction
data.record.withdrawType	String	
Withdrawal type: 
Cwallet: withdrawals to Cwallet users
Network: withdrawals to blockchain addresses
data.record.coinId	Integer	Coin ID
data.record.coinSymbol	String	Coin symbol
data.record.chain	String	Symbol of the chain
data.record.cwalletUser	String	Cwallet user ID. It will only be returned if the withdrawal is to a Cwallet user.
data.record.fromAddress	String	From address, if the transaction is a UTXO type or an internal transfer to Cwallet, this parameter will not be returned.
data.record.toAddress	String	Blockchain address. It will only be returned if the withdrawal is to a blockchain address.
data.record.toMemo	String	Memo of the address. It will only be returned if the withdrawal is to a blockchain address.
data.record.txId	String	Blockchain transaction ID. It will only be returned if the withdrawal is to a blockchain address.
data.record.status	String	
WaitingApproval: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard

Rejected: Withdrawal request has been rejected by merchant

Processing: transaction is processing

Success: transaction has been confirmed

Failed: transaction failed

data.record.orderId	String	Order ID
data.record.amount	String	Withdrawal amount
data.record.fee	Object	Network fee. Only withdrawals to a blockchain address will incur a network fee. 
data.record.fee.coinId	String	Coin ID of the network fee coin
data.record.fee.coinSymbol	String	Coin symbol of the network fee coin
data.record.fee.amount	String	Amount of the network fee
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "record": {
6        "recordId": "202403120909501767478092588126208",
7        "withdrawType": "Network",
8        "coinId": 1891,
9        "coinSymbol": "TETH",
10        "chain": "POLYGON",
11        "fromAddress": "0x1AE2828c18f9E3ae067F569aca1AE2828C4e7",
12        "toAddress": "0xBb9C4e7F3687aca1AE2828c18f9E3ae067F569FE",
13        "orderId": "1710234589577",
14        "txId": "0xb55bb28292de56432b06204f71c68847a71670f2fc311af5c53a6ded45ab047b",
15        "toMemo": "",
16        "status": "Success",
17        "amount": "0.004",
18        "fee": {
19          "coinId": 1891,
20          "coinSymbol": "TETH",
21          "amount": "0.001"
22        }
23      }
24    }
25  }
26    
Get Withdrawal Record List
This endpoint retrieves a list of withdrawals records.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppWithdrawRecordList

Parameters
Parameters	Type	Required	Description
coinId	Integer	No	Coin ID
orderIds	Array[string]	No	Order ID for the withdrawal. 3-64 in length. The maximum limit for one query is 20 order IDs.
chain	String	No	Symbol of the chain
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp.
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp.
nextId	String	No	
Next ID
If the query result exceeds 20 records, a "nextId" field will be returned.   You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getAppWithdrawRecordList";
8const args = JSON.stringify({
9  //"coinId": 1280,
10  //"orderIds": ["1697445039666"],
11  //"chain": "POLYGON",
12  //"startAt": 1672506061,
13  //"endAt": 1704042061,
14  //"nextId": "46f62e0546f785cf961b922d024236aa",
15});
16
17const timestamp = Math.floor(Date.now() / 1000);
18let signText = appId + timestamp;
19if (args.length !== 0) {
20  signText += args;
21}
22
23const sign = crypto
24  .createHmac("sha256", appSecret)
25  .update(signText)
26  .digest("hex");
27
28const options = {
29  method: "POST",
30  headers: {
31    "Content-Type": "application/json",
32    "Appid": appId,
33    "Sign": sign,
34    "Timestamp": timestamp.toString(),
35  },
36};
37
38const req = https.request(path, options, (res) => {
39  let respData = "";
40
41  res.on("data", (chunk) => {
42    respData += chunk;
43  });
44
45  res.on("end", () => {
46    console.log("Response:", respData);
47  });
48});
49
50req.write(args);
51req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.records	Array
data.records[index].recordId	String	CCPayment unique ID for a transaction
data.records[index].withdrawType	String	
Withdrawal type: 
Cwallet: withdrawals to Cwallet users
Network: withdrawals to blockchain addresses
data.records[index].coinId	Integer	Coin ID
data.records[index].coinSymbol	String	Coin symbol
data.records[index].chain	String	Symbol of the chain
data.records[index].orderId	String	Order ID
data.records[index].cwalletUser	String	Cwallet user ID. It will only be returned if the withdrawal is to a Cwallet user.
data.records[index].fromAddress	String	From address, if the transaction is a UTXO type or an internal transfer to Cwallet, this parameter will not be returned. 
data.records[index].toAddress	String	Blockchain address. It will only be returned if the withdrawal is to a blockchain address. 
data.records[index].toMemo	String	Memo of the address. It will only be returned if the withdrawal is to a blockchain address. 
data.records[index].amount	String	Withdrawal amount
data.records[index].txId	String	Blockchain transaction ID. It will only be returned if the withdrawal is to a blockchain address.
data.records[index].status	String	
Withdrawal status: 

Processing: transaction is processing

Success: transaction has been confirmed

Failed: transaction failed

WaitingApproval: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard

Rejected: Withdrawal request has been rejected by merchant
data.records[index].fee	Object	Network fee. Only withdrawals to a blockchain address will incur a network fee. 
data.records[index].fee.coinId	String	Coin ID of the network fee coin
data.records[index].fee.coinSymbol	String	Coin symbol of the network fee coin
data.records[index].fee.amount	String	Amount of the network fee
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "records": [
6        {
7          "recordId": "202403120909501767478092588126208",
8          "withdrawType": "Network",
9          "coinId": 1891,
10          "coinSymbol": "TETH",
11          "chain": "POLYGON",
12          "fromAddress": "0x1AE2828c18f9E3ae067F569aca1AE2828C4e7",
13          "toAddress": "0xBb9C4e7F3687aca1AE2828c18f9E3ae067F569FE",
14          "orderId": "1710234589577",
15          "txId": "0xb55bb28292de56432b06204f71c68847a71670f2fc311af5c53a6ded45ab047b",
16          "toMemo": "",
17          "status": "Success",
18          "amount": "0.004",
19          "fee": {
20            "coinId": 1891,
21            "coinSymbol": "TETH",
22            "amount": "0.001"
23          }
24        },
25        {
26          "recordId": "202403120913091767478929213362176",
27          "withdrawType": "Cwallet",
28          "coinId": 1329,
29          "coinSymbol": "MATIC",
30          "chain": "Cwallet OS",
31          "cwalletUser": "35255142",
32          "orderId": "1710234789039",
33          "txId": "",
34          "toMemo": "",
35          "status": "Success",
36          "amount": "0.002"
37        }],
38      "nextId": ""
39    }
40  }
41    
Swap API

Get Swap Quote
This endpoint retrieves the estimated amount of the target coin that will be received for a given amount of the input coin during a swap transaction.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/estimate

Parameters
Parameters	Type	Required	Description
coinIdIn	Integer	Yes	ID of the input coin
amountIn	String	Yes	Amount of input coin
coinIdOut	Integer	Yes	ID of the output coin
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/estimate';
8const args = JSON.stringify({
9"coinIdIn": 1280,
10"amountIn": "100",
11"coinIdOut": 1329
12});
13
14const timestamp = Math.floor(Date.now() / 1000);
15let signText = appId + timestamp;
16if (args) {
17signText += args;
18}
19
20const sign = crypto
21.createHmac('sha256', appSecret)
22.update(signText)
23.digest('hex');
24
25const options = {
26method: 'POST',
27headers: {
28'Content-Type': 'application/json',
29'AppId': appId,
30'Sign': sign,
31'Timestamp': timestamp.toString(),
32},
33};
34
35const req = https.request(path, options, (res) => {
36let respData = '';
37
38res.on('data', (chunk) => {
39respData += chunk;
40});
41
42res.on('end', () => {
43console.log('Response:', respData);
44});
45});
46
47req.write(args);
48req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.coinIdIn	Integer	ID of the input coin
data.coinIdOut	Integer	ID of the output coin
data.amountOut	String	Amount of the output coin
data.netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee
data.amountIn	String	Amount of the input coin
data.feeRate	String	CCPayment service fee rate for the swap. 
data.fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.swapRate	String	swapRate = amountIn/amountOut
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "coinIdIn": 1280,
6    "coinIdOut": 1329,
7    "amountOut": "194.09158706508187",
8    "amountIn": "100",
9    "swapRate": "1.9409158706508187",
10    "feeRate": "0.005",
11    "fee": "0.97045793532540935",
12    "netAmountOut": "193.12112912975646065"
13  }
14  }
Create and Fulfill Swap Order
This endpoint allows users to create a swap order and exchange one cryptocurrency for another. It returns the details of the swap transaction, including the calculated amount of the output coin, the swap rate, and the service fee.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/swap

Parameters
Parameters	Type	Required	Description
orderId	String	Yes	Swap order ID created by merchant, 3-64 characters in length
coinIdIn	Integer	Yes	ID of the input coin
amountIn	String	Yes	Amount of the input coin
coinIdOut	Integer	Yes	ID of the output coin
amountOutMinimum	String	No	The minimum amount of the output coin that the user is willing to receive for the swap. 
If the swap results in an amount less than this minimum, the transaction will not be executed. 
This parameter helps protect users from unfavorable exchange rates.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = "https://ccpayment.com/ccpayment/v2/swap";
8const args = JSON.stringify({
9    "orderId": "xxxxxxxxxx",
10    "coinIdIn": 1280,
11    "amountIn": "1",
12    "coinIdOut": 1329,
13});
14
15const timestamp = Math.floor(Date.now() / 1000);
16let signText = appId + timestamp;
17if (args) {
18  signText += args;
19}
20
21const sign = crypto
22  .createHmac('sha256', appSecret)
23  .update(signText)
24  .digest('hex');
25
26const options = {
27  method: 'POST',
28  headers: {
29    'Content-Type': 'application/json',
30    'AppId': appId,
31    'Sign': sign,
32    'Timestamp': timestamp.toString(),
33  },
34};
35
36const req = https.request(path, options, (res) => {
37  let respData = '';
38
39  res.on('data', (chunk) => {
40    respData += chunk;
41  });
42
43  res.on('end', () => {
44    console.log('Response:', respData);
45  });
46});
47
48req.write(args);
49req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.recordId	String	CCPayment unique ID for a transaction
data.orderId	String	Order ID
data.coinIdIn	Integer	ID of the input coin
data.coinIdOut	Integer	ID of the output coin
data.amountOut	String	Amount of the output coin
data.netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee
data.amountIn	String	Amount of the input coin
data.feeRate	String	CCPayment service fee rate for the swap
data.fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.swapRate	String	swapRate = amountIn/amountOut
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "recordId": "20240719085639165937311982694400",
6      "orderId": "1721379398507",
7      "coinIdIn": 1280,
8      "coinIdOut": 1329,
9      "amountOut": "1.9428459962937677",
10      "amountIn": "1",
11      "swapRate": "1.9428459962937677",
12      "fee": "0.1950648590656393",
13      "feeRate": "0.1004016064257028",
14      "netAmountOut": "1.7477811372281284",
15    }
16  }
Get Swap Record
This endpoint retrieves the details of a specific swap order, including the transaction details, swap rate, and service fee.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getSwapRecord

Parameters
Parameters	Type	Required	Description
recordId	String	No	CCPayment unique ID for a transaction
orderId	String	No	Swap order ID created by merchant, 3-64 characters in length
Note: Pass either orderId or recordId. Don't pass both or pass nothing.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getSwapRecord';
8const args = JSON.stringify({
9    "recordId": "xxxxxxxxxx",
10});
11
12const timestamp = Math.floor(Date.now() / 1000);
13let signText = appId + timestamp;
14if (args) {
15  signText += args;
16}
17
18const sign = crypto
19  .createHmac('sha256', appSecret)
20  .update(signText)
21  .digest('hex');
22
23const options = {
24  method: 'POST',
25  headers: {
26    'Content-Type': 'application/json',
27    'AppId': appId,
28    'Sign': sign,
29    'Timestamp': timestamp.toString(),
30  },
31};
32
33const req = https.request(path, options, (res) => {
34  let respData = '';
35
36  res.on('data', (chunk) => {
37    respData += chunk;
38  });
39
40  res.on('end', () => {
41    console.log('Response:', respData);
42  });
43});
44
45req.write(args);
46req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.record	Object	 
data.record.recordId	String	CCPayment unique ID for a transaction
data.record.orderId	String	Swap order ID created by merchant, 3-64 characters in length
data.record.coinInSymbol	String	Input coin symbol
data.record.coinIdIn	Integer	ID of the input coin
data.record.coinOutSymbol	String	Output coin symbol
data.record.coinIdOut	Integer	ID of the output coin
data.record.amountOut	String	Amount of the output coin
data.record.netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee
data.record.amountIn	String	Amount of the input coin
data.record.userId	String	User ID should be a string of 5 - 64 characters and can not start with 'sys'. 
data.record.swapRate	String	swapRate = amountIn/amountOut
data.record.feeRate	String	CCPayment service fee rate for the swap. 
data.record.fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.record.status	String	
Success: the transaction has been confirmed

Processing: blockchain is processing the transaction

Failed: transaction failed 
data.record.createdAt	Integer	Order creation timestamp, 10-digit
data.record.arrivedAt	Integer	Payment arrived timestamp
data.record.amountOutMinimum	String	The minimum amount of the output coin that the user is willing to receive for the swap.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "record": {
6        "recordId": "20240719085639165937311982694400",
7        "orderId": "1721379398507",
8        "coinInSymbol": "USDT",
9        "coinIdIn": 1280,
10        "coinOutSymbol": "MATIC",
11        "coinIdOut": 1329,
12        "amountOut": "1.9428459962937677",
13        "amountIn": "1.000000000000000000000000",
14        "netAmountOut": "1.747781137228128400000000",
15        "swapRate": "1.942845996293767700000000",
16        "feeRate": "0.1004016064257028",
17        "fee": "0.195064859065639300000000",
18        "status": "Success",
19        "createdAt": 1721379399,
20        "arrivedAt": 1721379399
21      }
22    }
23  }
Get Swap Record List
This endpoint retrieves the details of a list of swap orders.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getSwapRecordList

Parameters
Parameters	Type	Required	Description
recordIds	Array[string]	No	CCPayment unique ID for a transaction
orderIds	Array[string]	No	Swap order ID created by merchant, 3-64 characters in length
coinIdIn	Integer	No	ID of the input coin
coinIdOut	Integer	No	ID of the output coin
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp. 10-digit. 
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp. 10-digit. 
nextId	String	No	Next ID, If the query result exceeds 20 records, a 'nextId' field will be returned.

You can use the same query conditions along with the 'nextId' field to retrieve the remaining transaction data.
Note: The longest available time period is three months. The endAt should not be more than three months after the startAt.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getSwapRecordList';
8const args = '';
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'AppId': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.records	Array	 
data.records[index].recordId	String	CCPayment unique ID for a transaction
data.records[index].orderId	String	Swap order ID created by merchant
data.records[index].coinInSymbol	String	Input coin symbol
data.records[index].coinIdIn	Integer	ID of the input coin
data.records[index].coinOutSymbol	String	ID of the input coin
data.records[index].coinIdOut	Integer	ID of the output coin
data.records[index].amountOut	String	Amount of the output coin
data.records[index].netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee
data.records[index].amountIn	String	Amount of the input coin
data.records[index].swapRate	String	swapRate = amountIn/amountOut
data.records[index].feeRate	String	CCPayment service fee rate for the swap. 
data.records[index].fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.records[index].status	String	
Success: the transaction has been confirmed

Processing: blockchain is processing the transaction

Failed: transaction failed 
data.records[index].createdAt	Integer	Order creation timestamp, 10-digit
data.records[index].arrivedAt	Integer	Payment arrived timestamp
data.records[index].amountOutMinimum	String	The minimum amount of the output coin that the user is willing to receive for the swap.
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "records": [
6        {
7          "recordId": "20240719085639165937311982694400",
8          "orderId": "1721379398507",
9          "coinInSymbol": "USDT",
10          "coinIdIn": 1280,
11          "coinOutSymbol": "MATIC",
12          "coinIdOut": 1329,
13          "amountOut": "1.9428459962937677",
14          "amountIn": "1.000000000000000000000000",
15          "netAmountOut": "1.747781137228128400000000",
16          "swapRate": "1.942845996293767700000000",
17          "feeRate": "0.1004016064257028",
18          "fee": "0.195064859065639300000000",
19          "status": "Success",
20          "createdAt": 1721379399,
21          "arrivedAt": 1721379399
22        },
23        ...
24      ],
25      "nextId": ""
26    }
27  }
Create a Wallet System
If you want to establish a wallet system and allow users to have independent accounts, we recommend using our wallet system API. We will provide you with a user asset management list on the merchant dashboard.
User Balance
Get User Balance List
This endpoint retrieves the balance list of a user.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserCoinAssetList

Parameters
Parameters	Type	Required	Description
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = "https://ccpayment.com/ccpayment/v2/getUserCoinAssetList";
8const args = JSON.stringify({ 'userId': "1709021102608" });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'Appid': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
data.assets	Array	Balance list
data.assets[index].coinId	Integer	Coin ID
data.assets[index].coinSymbol	String	Coin symbol
data.assets[index].available	String	available amount
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "userId": "6322718677975328",
6    "assets": [
7      {
8        "coinId": 1445,
9        "coinSymbol": "XLM",
10        "available": "0"
11      },
12      {
13        "coinId": 1282,
14        "coinSymbol": "USDC",
15        "available": "0"
16      },
17      ...
18    ]
19  }}
Get coin balance of users
This endpoint retrieves specific coin balance of a user.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserCoinAsset

Parameters
Parameters	Type	Required	Description
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
coinId	Integer	Yes	Coin ID
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserCoinAsset';
8const args = JSON.stringify({'coinId':1280,'userId': "1709021102608" });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'Appid': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
data.asset	Object	Balance list
data.asset.coinId	Integer	Coin ID
data.asset.coinSymbol	String	Coin symbol
data.asset.available	String	available amount
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "userId": "6322718677975328",
6    "asset": {
7      "coinId": 1280,
8      "coinSymbol": "USDT",
9      "available": "0.020996"
10    }
11  }
12  }
User Deposit API
Create or Get User Deposit Address
This endpoint creates or gets the permanent deposit address of the user.
Merchant will receive Webhook notification for every payment made to this address. This type of deposit is "User Deposit".
Each APP ID can obtain 1000 user addresses via this interface. If you need more addresses, please contact customer service for further help.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getOrCreateUserDepositAddress

Parameters
Parameters	Type	Required	Description
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
chain	String	Yes	Symbol of the chain
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getOrCreateUserDepositAddress';
8const args = JSON.stringify({'userId': '1737014581861','chain':'BSC', });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'Appid': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.address	String	Permanent deposit address for the user
data.memo	String	For memo-required coins (such as XRP, XLM, etc.), the user must fill in the correct memo.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "address": "xxxxxxxxx",
6      "memo": ""
7    }
8  }
Webhook for User Deposit
After receiving a webhook, the merchant's server should call the "Get User Deposit Record" API to confirm the deposit information.
Webhook Parameters
Parameters	Type	Description
type	String	Type: UserDeposit
msg	Object
msg.recordId	String	CCPayment unique ID for a transaction
msg.userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
msg.coinId	Integer	Coin ID
msg.coinSymbol	String	Coin symbol
msg.status	String	
Processing: blockchain is processing the transaction

Success: the transaction has been confirmed

Failed: the transaction was not completed and the funds were not received

msg.isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
Request Example

1{
2  "type": "UserDeposit",
3  "msg": {
4    "recordId": "202403130938151...",
5    "userId": "6322718677975328",
6    "coinId": 1329,
7    "coinSymbol": "MATIC",
8    "amount": "0.1",
9    "status": "Success",
10    "isFlaggedAsRisky":false
11  }
12}
Get User Deposit Record
This endpoint retrieves the detailed information of a specific record ID. This is a very crucial endpoint for you to get transaction details and confirm the status of the transaction. You will need the information returned by the interface to update transaction status and credit your user accordingly.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserDepositRecord

Parameters
Parameters	Type	Required	Description
recordId	String	Yes	CCPayment unique ID for a transaction
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserDepositRecord';
8const args = JSON.stringify({'recordId': '20250116080551231516731711291392' });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'Appid': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.record	Object
data.record.userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
data.record.recordId	String	CCPayment unique ID for a transaction
data.record.coinId	Integer	Deposit Coin ID
data.record.coinSymbol	String	Deposit Coin symbol
data.record.chain	String	Symbol of the chain 
data.reocrd.contract	String	Contract
data.record.coinUSDPrice	String	Coin price in USD at the time of payment receipt
data.record.fromAddress	String	From address, if the transaction is a UTXO type, this parameter will not be returned. 
data.record.toAddress	String	Destination address
data.record.toMemo	String	Memo of the address
data.record.amount	String	Received amount
data.record.serviceFee	String	Service fee
data.record.txId	String	TXID
data.record.status	String	
Success: the transaction has been confirmed
Processing: blockchain is processing the transaction
Failed: transaction failed
data.record.isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
data.record.arrivedAt	Integer	Deposit arrived timestamp
In UTXO-type transactions, the fromAddress will not be returned. The actual sender address is among a variety of input addresses. Please confirm with the payer of the transaction to obtain the sender address.
Response

1{
2'code': 10000,
3'msg': 'success',
4'data': {
5  'record': {
6    'userId': '1737014581861',
7    'recordId': '20250116080551231516731711291392',
8    'coinId': 1482,
9    'chain': 'TRX',
10    'contract': 'TRX',
11    'coinSymbol': 'TRX',
12    'txId': 'dcb10a262e6a445dc1da0cf642bb095b2619b0d3789fdade3ba7b963adf1bccc',
13    'coinUSDPrice': '0.23803',
14    'fromAddress': 'TRPKg7eGMy9aZS2RumSPeWoyVkDqTVwLgL',
15    'toAddress': 'TMGT5iUxyNcdeYiwSD3L8cfVzhTFrVbWTX',
16    'toMemo': '',
17    'amount': '0.5',
18    'serviceFee': '0.0025',
19    'status': 'Success',
20    'arrivedAt': 1737014751,
21    'isFlaggedAsRisky': False
22   }
23  }
24}
Get User Deposit Record List
Get a list of deposits records within a specific time range. Deposit records are sorted by creation time in descending order.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserDepositRecordList

Parameters
Parameters	Type	Required	Description
coinId	Integer	No	Coin ID
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
chain	String	No	Symbol of the chain
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp.
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp.
nextId	String	No	
Next ID
If the query result exceeds 20 records, a "nextId" field will be returned.   You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserDepositRecordList';
8const args = JSON.stringify({'userId': '1737014581861',
9  # 'coinId': 1280,
10  # 'chain': 'POLYGON',
11  # 'startAt': 1697216461,
12  # 'endAt': 1708334085,
13  # 'nextId': '38fe94d7f06594bb9c1832b51601bc'
14    });
15
16const timestamp = Math.floor(Date.now() / 1000);
17let signText = appId + timestamp;
18if (args) {
19signText += args;
20}
21
22const sign = crypto
23.createHmac('sha256', appSecret)
24.update(signText)
25.digest('hex');
26
27const options = {
28method: 'POST',
29headers: {
30  'Content-Type': 'application/json',
31  'Appid': appId,
32  'Sign': sign,
33  'Timestamp': timestamp.toString(),
34},
35};
36
37const req = https.request(path, options, (res) => {
38let respData = '';
39
40res.on('data', (chunk) => {
41  respData += chunk;
42});
43
44res.on('end', () => {
45  console.log('Response:', respData);
46});
47});
48
49req.write(args);
50req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.records	Array
data.records[index].userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
data.records[index].recordId	String	CCPayment unique ID for a transaction
data.records[index].coinId	Integer	Deposit Coin ID
data.records[index].coinSymbol	String	Deposit Coin symbol
data.records[index].chain	String	Symbol of the chain 
data.records[index].contract	String	Contract
data.records[index].coinUSDPrice	String	Coin price in USD at the time of payment receipt
data.records[index].fromAddress	String	From address, if the transaction is a UTXO type, this parameter will not be returned. 
data.records[index].toAddress	String	Destination address
data.records[index].toMemo	String	Memo of the address
data.records[index].amount	String	Received amount
data.records[index].serviceFee	String	Service fee
data.records[index].txId	String	TXID
data.records[index].status	String	
Success: the transaction has been confirmed
Processing: blockchain is processing the transaction
Failed: transaction failed
data.records[index].isFlaggedAsRisky	Boolean	
true: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in Transaction > Risky Transaction on the merchant dashboard.

false: The transaction is not considered risky. 
data.records[index].arrivedAt	Integer	Deposit arrived timestamp
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
If the query result exceeds 20 records, a "nextId" field will be returned.   You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2  'code': 10000,
3  'msg': 'success',
4  'data': {
5    'records': [
6      {
7        'userId': '1737014581861',
8        'recordId': '20250116080551231516731711291392',
9        'coinId': 1482,
10        'chain': 'TRX',
11        'contract': 'TRX',
12        'coinSymbol': 'TRX',
13        'txId': 'dcb10a262e6a445dc1da0cf642bb095b2619b0d3789fdade3ba7b963adf1bccc',
14        'coinUSDPrice': '0.23803',
15        'fromAddress': 'TRPKg7eGMy9aZS2RumSPeWoyVkDqTVwLgL',
16        'toAddress': 'TMGT5iUxyNcdeYiwSD3L8cfVzhTFrVbWTX',
17        'toMemo': '',
18        'amount': '0.5',
19        'serviceFee': '0.0025',
20        'status': 'Success',
21        'arrivedAt': 1737014751,
22        'isFlaggedAsRisky': False
23      }
24    ],
25    'nextId': ''
26  }
27}
User Withdrawal API
Withdrawal to Blockchain Address
This endpoint creates a withdrawal order to a blockchain address.
If a withdrawal is processing, CCPayment will send a webhook with the status of "Processing". If a withdrawal is confirmed, CCPayment will send a second webhook with the status of "Success". In some cases, on-chain processing is too fast to capture processing information. There will only be one webhook sent with the status of "Success".
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/applyUserWithdrawToNetwork

Parameters
Parameters	Type	Required	Description
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
coinId	String	Yes	Coin ID
chain	String	Yes	Symbol of the chain
address	String	Yes	Withdrawal destination address
memo	String	No	Memo of the address
orderId	String	Yes	Withdrawal order ID, 3-64 characters in length
amount	String	Yes	Withdrawal amount
Request Example

1const https = require('https');
2  const crypto = require('crypto');
3  
4  const appId ='*** your appId ***';
5  const appSecret ='*** your appSecret ***';
6  
7  const path = 'https://ccpayment.com/ccpayment/v2/applyUserWithdrawToNetwork';
8  const args = JSON.stringify({
9    'coinId': 1280,
10    'address': '0x12438F04093EBc87f0Ba629bbe93F2451711d967',
11    'orderId': '121231313',
12    'userId': '1709021102608',
13    'chain': 'POLYGON',
14    'amount': '0.001',
15    # 'merchantPayNetworkFee': false,
16    # 'memo': ''
17      });
18  
19  const timestamp = Math.floor(Date.now() / 1000);
20  let signText = appId + timestamp;
21  if (args) {
22    signText += args;
23  }
24  
25  const sign = crypto
26    .createHmac('sha256', appSecret)
27    .update(signText)
28    .digest('hex');
29  
30  const options = {
31    method: 'POST',
32    headers: {
33      'Content-Type': 'application/json',
34      'Appid': appId,
35      'Sign': sign,
36      'Timestamp': timestamp.toString(),
37    },
38  };
39  
40  const req = https.request(path, options, (res) => {
41    let respData = '';
42  
43    res.on('data', (chunk) => {
44      respData += chunk;
45    });
46  
47    res.on('end', () => {
48      console.log('Response:', respData);
49    });
50  });
51  
52  req.write(args);
53  req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.recordId	String	Record ID
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "recordId": "2024032203112917xxxxxxxx"
6  }
7  }
Webhook for User Withdrawal
The payload of the webhook will include the record ID. You should use the record ID to call "Get User Withdrawal Record" to retrieve the transfer information and update the withdrawal status or deduct the amount from your user's account accordingly.
Webhook Parameters
Parameters	Type	Description
type	String	Type: UserWithdrawal
msg	Object
msg.recordId	String	CCPayment unique ID for a transaction
msg.orderId	String	Order ID
msg.userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
msg.coinId	Integer	Coin ID
msg.coinSymbol	String	Coin symbol
msg.status	String	
Withdrawal status: 

Processing: transaction is processing

Success: transaction has been confirmed

Failed: transaction failed

WaitingApproval: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard

Rejected: Withdrawal request has been rejected by merchant
Once a withdrawal transaction is initiated, the blockchain will confirm the transaction within a few minutes. However, due to rare external circumstances, merchants may sometimes fail to receive timely webhook notifications.If a withdrawal transaction has been initiated for 2 hours and you still have not received the webhook with the status of "Success", we suggest calling the "Get User Withdrawal Record" to retrieve transaction information and confirm the transaction.
Request Example

1{
2  "type": "UserWithdrawal",
3  "msg": {
4    "recordId": "2024031312073317...",
5    "orderId": "6322851679858976",
6    "userId": "6322718677975328",
7    "coinId": 1891,
8    "coinSymbol": "TETH",
9    "status": "Success"
10  }
11}
Withdrawal to Cwallet Account
This endpoint creates the withdrawal order to Cwallet account
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/applyUserWithdrawToCwallet

Parameters
Parameters	Type	Required	Description
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
coinId	String	Yes	Coin ID
cwalletUser	String	Yes	
Cwallet users, Cwallet ID and Email are both OK.
amount	String	Yes	Withdrawal amount. Minimum limit is 0.001 USD.
orderId	String	Yes	Order ID, 3-64 characters in length
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/applyUserWithdrawToCwallet';
8const args = JSON.stringify({
9  'coinId': 1280,
10  'userId': '1709021102608',
11  'cwalletUser': '9558861',
12  'orderId': '121231313',
13  'amount': '0.001',
14    });
15
16const timestamp = Math.floor(Date.now() / 1000);
17let signText = appId + timestamp;
18if (args) {
19signText += args;
20}
21
22const sign = crypto
23.createHmac('sha256', appSecret)
24.update(signText)
25.digest('hex');
26
27const options = {
28method: 'POST',
29headers: {
30  'Content-Type': 'application/json',
31  'Appid': appId,
32  'Sign': sign,
33  'Timestamp': timestamp.toString(),
34},
35};
36
37const req = https.request(path, options, (res) => {
38let respData = '';
39
40res.on('data', (chunk) => {
41  respData += chunk;
42});
43
44res.on('end', () => {
45  console.log('Response:', respData);
46});
47});
48
49req.write(args);
50req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.recordId	String	Record ID for the transaction
For transactions transferred to a Cwallet account, we will not send a webhook notification. Please reconfirm the withdrawal status using the Get User Withdrawal Record API. If the response indicates 'withdrawal success', this confirms that the withdrawal request has been successfully processed.
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "recordId": "20240322032xxxxxxxx0660770816"
6  }
7}
Get User Withdrawal Record
This endpoint retrieves one specific withdrawal information.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserWithdrawRecord

Parameters
Parameters	Type	Required	Description
recordId	String	No	CCPayment unique ID for a transaction
orderId	String	No	Withdrawal order ID, 3-64 characters in length
recordId and orderId cannot both be empty.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserWithdrawRecord';
8const args = JSON.stringify({
9    'recordId': '202403010604081763445093768892416',
10      });
11
12const timestamp = Math.floor(Date.now() / 1000);
13let signText = appId + timestamp;
14if (args) {
15  signText += args;
16}
17
18const sign = crypto
19  .createHmac('sha256', appSecret)
20  .update(signText)
21  .digest('hex');
22
23const options = {
24  method: 'POST',
25  headers: {
26    'Content-Type': 'application/json',
27    'Appid': appId,
28    'Sign': sign,
29    'Timestamp': timestamp.toString(),
30  },
31};
32
33const req = https.request(path, options, (res) => {
34  let respData = '';
35
36  res.on('data', (chunk) => {
37    respData += chunk;
38  });
39
40  res.on('end', () => {
41    console.log('Response:', respData);
42  });
43});
44
45req.write(args);
46req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.record	Object
data.record.userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
data.record.recordId	String	CCPayment unique ID for a transaction
data.record.coinId	Integer	Deposit Coin ID
data.record.coinSymbol	String	Deposit Coin symbol
data.record.chain	String	Symbol of the chain 
data.record.cwalletUser	String	
Cwallet users, Cwallet ID and Email are both OK.
data.record.fromAddress	String	From address, if the transaction is a UTXO type or an internal transfer to Cwallet, this parameter will not be returned.
data.record.toAddress	String	Blockchain address. It will only be returned if the withdrawal is to a blockchain address.
data.record.toMemo	String	Memo of the address. It will only be returned if the withdrawal is to a blockchain address.
data.record.txId	String	Blockchain transaction ID. It will only be returned if the withdrawal is to a blockchain address.
data.record.status	String	
Withdrawal status: 

Processing: transaction is processing

Success: transaction has been confirmed

Failed: transaction failed

WaitingApproval: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard

Rejected: Withdrawal request has been rejected by merchant
data.record.orderId	String	Order ID for the withdrawal 
data.record.amount	String	Withdrawal amount
data.record.fee	Object	Network fee. Only withdrawals to a blockchain address will incur a network fee. 
data.record.fee.coinId	String	Coin ID of the network fee coin
data.record.fee.coinSymbol	String	Coin symbol of the network fee coin
data.record.fee.amount	String	Amount of the network fee
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "record": {
6      "userId": "6322718677975328",
7      "recordId": "202403220324441771015126690828288",
8      "withdrawType": "Cwallet",
9      "coinId": 1280,
10      "chain": "Cwallet OS",
11      "orderId": "777777779",
12      "txId": "",
13      "coinSymbol": "USDT",
14      "cwalletUser": "35255142",
15      "toMemo": "",
16      "amount": "0.002",
17      "status": "Success"
18    }
19  }
20  }
Get User Withdrawal Record List
This endpoint retrieves a list of user withdrawal records.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserWithdrawRecordList

Parameters
Parameters	Type	Required	Description
coinId	Integer	No	Coin ID
toAddress	String	No	Destination address
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
chain	String	No	Symbol of the chain
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp.
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp.
nextId	String	No	
Next ID
If the query result exceeds 20 records, a "nextId" field will be returned.   You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserWithdrawRecordList';
8const args = JSON.stringify({
9  'userId': '1709021102608',
10  # 'coinId': 272366,
11  # 'address': 'kava1fc72crkczxzpdkn0xlxt65mklfywt485jqwazq',
12  # 'chain': 'DOGE',
13  # 'startAt':  1704042061,
14  # 'endAt': 1708426738,
15  # 'nextId': ''
16    });
17
18const timestamp = Math.floor(Date.now() / 1000);
19let signText = appId + timestamp;
20if (args) {
21  signText += args;
22}
23
24const sign = crypto
25  .createHmac('sha256', appSecret)
26  .update(signText)
27  .digest('hex');
28
29const options = {
30  method: 'POST',
31  headers: {
32    'Content-Type': 'application/json',
33    'Appid': appId,
34    'Sign': sign,
35    'Timestamp': timestamp.toString(),
36  },
37};
38
39const req = https.request(path, options, (res) => {
40  let respData = '';
41
42  res.on('data', (chunk) => {
43    respData += chunk;
44  });
45
46  res.on('end', () => {
47    console.log('Response:', respData);
48  });
49});
50
51req.write(args);
52req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.records	Array
data.records[index].userId	String	User ID should be a string of 5 - 64 characters and can not start with "sys". 

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
data.records[index].recordId	String	CCPayment unique ID for a transaction
data.records[index].withdrawType	String	
Withdrawal type: 
Cwallet: withdrawals to Cwallet users
Network: withdrawals to blockchain addresses
data.records[index].coinId	Integer	Coin ID
data.records[index].coinSymbol	String	Coin symbol
data.records[index].chain	String	Symbol of the chain
data.records[index].orderId	String	Unique ID for the order in your system.
data.records[index].cwalletUser	String	Cwallet user ID. It will only be returned if the withdrawal is to a Cwallet user.
data.records[index].fromAddress	String	From address, if the transaction is a UTXO type or an internal transfer to Cwallet, this parameter will not be returned. 
data.records[index].toAddress	String	Blockchain address. It will only be returned if the withdrawal is to a blockchain address. 
data.records[index].toMemo	String	Memo of the address. It will only be returned if the withdrawal is to a blockchain address. 
data.records[index].amount	String	Withdrawal amount
data.records[index].txId	String	Blockchain transaction ID. It will only be returned if the withdrawal is to a blockchain address.
data.records[index].status	String	
Withdrawal status: 

Processing: transaction is processing

Success: transaction has been confirmed

Failed: transaction failed

WaitingApproval: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard

Rejected: Withdrawal request has been rejected by merchant
data.records[index].fee	Object	Network fee. Only withdrawals to a blockchain address will incur a network fee. 
data.records[index].fee.coinId	String	Coin ID of the network fee coin
data.records[index].fee.coinSymbol	String	Coin symbol of the network fee coin
data.records[index].fee.amount	String	Amount of the network fee
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "records": [
6      {
7        "userId": "6322718677975328",
8        "recordId": "202403130916211767842120296566784",
9        "withdrawType": "Network",
10        "coinId": 1891,
11        "chain": "ETH_SEPOLIA",
12        "orderId": "6322809704579360",
13        "txId": "0x839abd6d240c371bf41749263f2de4c1b6a4bd9030df2079746b14486f2c666d",
14        "coinSymbol": "TETH",
15        "fromAddress": "0xBc87f0Ba629bbe92438F04093EBce93F",
16        "ToAddress": "0x12438F04093EBc87f0Ba629bbe93F2451711d967",
17        "toMemo": "",
18        "amount": "0.001",
19        "status": "Success",
20        "fee": {
21          "coinId": 1891,
22          "coinSymbol": "TETH",
23          "amount": "0.001"
24        }
25      },
26      ...
27    ],
28    "nextId": "c5f5026e18f7672f7d5eb5ac79205891"
29  }
30  }
User Internal Transaction API
Create an Internal Transaction
This endpoint creates an internal transaction between users.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/userTransfer

Parameters
Parameters	Type	Required	Description
fromUserId	String	Yes	From User ID, it should be a string of 5 - 64 characters and can not start with "sys".

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
toUserId	String	Yes	To User ID, it should be a string of 5 - 64 characters and can not start with "sys".

To transfer user funds to your merchant account, use the APP ID as the User ID.
coinId	Integer	Yes	Coin ID
amount	String	Yes	Withdrawal amount. Minimum limit is 0.001 USD.
orderId	String	Yes	Withdrawal order ID, 3-64 characters in length
remark	String	No	Transaction note, within 255 characters
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/userTransfer';
8const args = JSON.stringify({
9  'coinId': 1280,
10  'fromUserId': '1709021102608',
11  'toUserId': '1709021101247',
12  'orderId': '12121212',
13  'amount': '0.005',
14  # 'remark': 'test1'
15    });
16
17const timestamp = Math.floor(Date.now() / 1000);
18let signText = appId + timestamp;
19if (args) {
20signText += args;
21}
22
23const sign = crypto
24.createHmac('sha256', appSecret)
25.update(signText)
26.digest('hex');
27
28const options = {
29method: 'POST',
30headers: {
31  'Content-Type': 'application/json',
32  'Appid': appId,
33  'Sign': sign,
34  'Timestamp': timestamp.toString(),
35},
36};
37
38const req = https.request(path, options, (res) => {
39let respData = '';
40
41res.on('data', (chunk) => {
42  respData += chunk;
43});
44
45res.on('end', () => {
46  console.log('Response:', respData);
47});
48});
49
50req.write(args);
51req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.recordId	String	CCPayment unique ID for a transaction
For internal transactions, we will not send a webhook notification. When the returned status is "success", it means the transaction is successful, and merchants can credit the user accordingly.
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "recordId": "202403220335xxxxxxxxx837507252224"
6  }
7}
8    
Get User Internal Transaction Record
This endpoint gets the user's internal transaction record.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserTransferRecord

Parameters
Parameters	Type	Required	Description
recordId	String	No	CCPayment unique ID for a transaction
orderId	String	No	Withdrawal order ID, 3-64 characters in length
recordId and orderId cannot both be empty.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserTransferRecord';
8const args = JSON.stringify({
9  'recordId': '202403010610541763446796748591104',
10  # 'orderId': '1708507495559'
11    });
12
13const timestamp = Math.floor(Date.now() / 1000);
14let signText = appId + timestamp;
15if (args) {
16signText += args;
17}
18
19const sign = crypto
20.createHmac('sha256', appSecret)
21.update(signText)
22.digest('hex');
23
24const options = {
25method: 'POST',
26headers: {
27  'Content-Type': 'application/json',
28  'Appid': appId,
29  'Sign': sign,
30  'Timestamp': timestamp.toString(),
31},
32};
33
34const req = https.request(path, options, (res) => {
35let respData = '';
36
37res.on('data', (chunk) => {
38  respData += chunk;
39});
40
41res.on('end', () => {
42  console.log('Response:', respData);
43});
44});
45
46req.write(args);
47req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.record	Object
data.record.recordId	String	Record ID
data.record.coinId	Integer	Coin ID
data.record.coinSymbol	String	Coin symbol
data.record.orderId	String	Order ID
data.record.fromUserId	String	From user ID
data.record.toUserId	String	To user ID
data.record.amount	String	amount
data.record.status	String	
Transction status: 
Success: the transaction has been confirmed;
Failed: transaction failed
data.record.remark	String	Transaction note
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5  "record": {
6    "recordId": "202403220337521771018432423137280",
7    "coinId": 1329,
8    "coinSymbol": "MATIC",
9    "orderId": "6322718677975328",
10    "fromUserId": "6322718677975328",
11    "toUserId": "6322821127078176",
12    "amount": "0.002",
13    "status": "Success"
14    }
15  }
16}
Get User Internal Transaction Record List
This endpoint gets the user's internal transaction record list.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserTransferRecordList

Parameters
Parameters	Type	Required	Description
coinId	Integer	No	Coin ID
fromUserId	String	Yes	From User ID, it should be a string of 5 - 64 characters and can not start with "sys".

Note: The user ID for merchant accounts is APP ID. Please do not assign APP ID to your users.
toUserId	String	Yes	To User ID, it should be a string of 5 - 64 characters and can not start with "sys".

To transfer user funds to your merchant account, use the APP ID as the User ID.
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp.
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp.
nextId	String	No	
Next ID
If the query result exceeds 20 records, a "nextId" field will be returned.   You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId := '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserTransferRecordList';
8const args = JSON.stringify({
9    'fromUserId': '1709021102608',
10  # 'toUserId': '1709021101247',
11  # 'coinId': 2523,
12  # 'startAt': 1704042061,
13  # 'endAt': 1708581993,
14  # 'nextId': ''
15    });
16
17const timestamp = Math.floor(Date.now() / 1000);
18let signText = appId + timestamp;
19if (args) {
20signText += args;
21}
22
23const sign = crypto
24.createHmac('sha256', appSecret)
25.update(signText)
26.digest('hex');
27
28const options = {
29method: 'POST',
30headers: {
31  'Content-Type': 'application/json',
32  'Appid': appId,
33  'Sign': sign,
34  'Timestamp': timestamp.toString(),
35},
36};
37
38const req = https.request(path, options, (res) => {
39let respData = '';
40
41res.on('data', (chunk) => {
42  respData += chunk;
43});
44
45res.on('end', () => {
46  console.log('Response:', respData);
47});
48});
49
50req.write(args);
51req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.records	Array
data.records[index].fromUserId	String	From user ID
data.records[index].toUserId	String	To User ID, it should be a string of 5 - 64 characters and can not start with "sys".

To transfer user funds to your merchant account, use the APP ID as the User ID.
data.records[index].recordId	String	Record ID
data.records[index].coinId	Integer	Coin ID
data.records[index].coinSymbol	String	Coin symbol
data.records[index].orderId	String	Order ID
data.records[index].amount	String	amount
data.records[index].status	String	
Transction status: 
Success: the transaction has been confirmed
Failed: transaction failed
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "records": [
6      {
7        "recordId": "202403130959411767853027680587776",
8        "coinId": 1891,
9        "coinSymbol": "TETH",
10        "orderId": "6322820357488929",
11        "fromUserId": "6322718677975328",
12        "toUserId": "6322820357488928",
13        "amount": "0.001",
14        "status": "Success"
15      },
16      ...
17    ],
18    "nextId": ""
19   }
20}
User Swap API
User Get Swap Quote
This endpoint retrieves the estimated amount of the target coin that will be received for a given amount of the input coin during a swap transaction.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/estimate

Parameters
Parameters	Type	Required	Description
coinIdIn	Integer	Yes	ID of the input coin
amountIn	String	Yes	Amount of input coin
coinIdOut	Integer	Yes	ID of the output coin
extraFeeRate	String	No	Percentage rate you want to charge for this transaction as your service fee. This parameter is only available with the user swap interface. For example, a value of 0.01 corresponds to a 1% service fee.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/estimate';
8const args = JSON.stringify({
9  'coinIdIn':1280,
10  'amountIn':'100',
11  'coinIdOut':1482,
12  'extraFeeRate':'0.01',
13});
14
15const timestamp = Math.floor(Date.now() / 1000);
16let signText = appId + timestamp;
17if (args) {
18signText += args;
19}
20
21const sign = crypto
22.createHmac('sha256', appSecret)
23.update(signText)
24.digest('hex');
25
26const options = {
27method: 'POST',
28headers: {
29  'Content-Type': 'application/json',
30  'AppId': appId,
31  'Sign': sign,
32  'Timestamp': timestamp.toString(),
33},
34};
35
36const req = https.request(path, options, (res) => {
37let respData = '';
38
39res.on('data', (chunk) => {
40  respData += chunk;
41});
42
43res.on('end', () => {
44  console.log('Response:', respData);
45});
46});
47
48req.write(args);
49req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.coinIdIn	Integer	ID of the input coin
data.coinIdOut	Integer	ID of the output coin
data.amountOut	String	Amount of the output coin
data.netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee - extraFee
data.amountIn	String	Amount of the input coin
data.feeRate	String	CCPayment service fee rate for the swap. 
data.fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.swapRate	String	swapRate = amountIn/amountOut
data.extraFee	String	Extra fee amount, extra fee rate*output coin amount
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "coinIdIn": 1280,
6    "coinIdOut": 1482,
7    "amountOut": "3.6790100655646874",
8    "amountIn": "1",
9    "swapRate": "3.6790100655646874",
10    "feeRate": "0.1004016064257028",
11    "fee": "0.3693785206390248",
12    "extraFee": "0.036790100655646874",
13    "netAmountOut": "3.272841444270015726"
14  }
15}
Create and Fulfill User Swap Order
This endpoint allows users to create a swap order and exchange one cryptocurrency for another. It returns the details of the swap transaction, including the calculated amount of the output coin, the swap rate, and the service fee.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/userSwap

Parameters
Parameters	Type	Required	Description
orderId	String	Yes	3 - 64 characters in length. Unique ID for the order in your system.
userId	String	Yes	User ID should be a string of 5 - 64 characters and can not start with 'sys'. 
coinIdIn	Integer	Yes	ID of the input coin
amountIn	String	Yes	Amount of the input coin
coinIdOut	Integer	Yes	ID of the output coin
extraFeeRate	String	No	Percentage rate you want to charge for this transaction as your service fee. For example, a value of 0.01 corresponds to a 1% service fee.
amountOutMinimum	String	No	The minimum amount of the output coin that the user is willing to receive for the swap. 
If the swap results in an amount less than this minimum, the transaction will not be executed. 
This parameter helps protect users from unfavorable exchange rates.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/userSwap';
8const args = JSON.stringify({
9    "orderId": "xxxxxxxxxx",
10    "userId": "user-swap1",
11    "coinIdIn": 1280,
12    "amountIn": "100",
13    "coinIdOut": 1329
14});
15
16const timestamp = Math.floor(Date.now() / 1000);
17let signText = appId + timestamp;
18if (args) {
19  signText += args;
20}
21
22const sign = crypto
23  .createHmac('sha256', appSecret)
24  .update(signText)
25  .digest('hex');
26
27const options = {
28  method: 'POST',
29  headers: {
30    'Content-Type': 'application/json',
31    'AppId': appId,
32    'Sign': sign,
33    'Timestamp': timestamp.toString(),
34  },
35};
36
37const req = https.request(path, options, (res) => {
38  let respData = '';
39
40  res.on('data', (chunk) => {
41    respData += chunk;
42  });
43
44  res.on('end', () => {
45    console.log('Response:', respData);
46  });
47});
48
49req.write(args);
50req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.recordId	String	CCPayment unique ID for a transaction
data.orderId	String	Swap order ID created by merchant
data.coinIdIn	Integer	ID of the input coin
data.coinIdOut	Integer	ID of the output coin
data.amountOut	String	Amount of the output coin=amountIn*swapRate
data.netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee - extraFee
data.amountIn	String	Amount of the input coin
data.feeRate	String	CCPayment service fee rate for the swap. 
data.fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.swapRate	String	swapRate = amountIn/amountOut
data.extraFee	String	Extra fee amount, extra fee rate*output coin amount
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "recordId": "20240722021342166923068583059456",
6      "orderId": "1721614421267",
7      "coinIdIn": 1280,
8      "coinIdOut": 1329,
9      "amountOut": "1.8174262160994585",
10      "amountIn": "1",
11      "swapRate": "1.8174262160994585",
12      "fee": "0.1824725116565721",
13      "feeRate": "0.1004016064257028",
14      "extraFee": "0",
15      "netAmountOut": "1.6349537044428864",
16    }
17  }
Get User Swap Record
This endpoint retrieves the details of a specific swap order, including the transaction details, swap rate, and service fee.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserSwapRecord

Parameters
Parameters	Type	Required	Description
recordId	String	No	CCPayment unique ID for a transaction
orderId	String	No	Swap order ID created by merchant, 3-64 characters in length
Note: Pass either orderId or recordId. Don't pass both or pass nothing.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserSwapRecord';
8const args = JSON.stringify({
9    "recordId": "20240722021342166923068583059456",
10});
11
12const timestamp = Math.floor(Date.now() / 1000);
13let signText = appId + timestamp;
14if (args) {
15  signText += args;
16}
17
18const sign = crypto
19  .createHmac('sha256', appSecret)
20  .update(signText)
21  .digest('hex');
22
23const options = {
24  method: 'POST',
25  headers: {
26    'Content-Type': 'application/json',
27    'AppId': appId,
28    'Sign': sign,
29    'Timestamp': timestamp.toString(),
30  },
31};
32
33const req = https.request(path, options, (res) => {
34  let respData = '';
35
36  res.on('data', (chunk) => {
37    respData += chunk;
38  });
39
40  res.on('end', () => {
41    console.log('Response:', respData);
42  });
43});
44
45req.write(args);
46req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.record	Object	 
data.record.recordId	String	CCPayment unique ID for a transaction
data.record.orderId	String	Swap order ID created by merchant
data.record.coinInSymbol	String	Input coin symbol
data.record.coinIdIn	Integer	ID of the input coin
data.record.coinOutSymbol	String	Output coin symbol
data.record.coinIdOut	Integer	ID of the output coin
data.record.amountOut	String	Amount of the output coin
data.record.netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee - extraFee
data.record.amountIn	String	Amount of the input coin
data.record.userId	String	User ID should be a string of 5 - 64 characters and can not start with 'sys'. 
data.record.swapRate	String	swapRate = amountIn/amountOut
data.record.feeRate	String	CCPayment service fee rate for the swap. 
data.record.fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.record.status	String	
Success: the transaction has been confirmed

Processing: blockchain is processing the transaction

Failed: transaction failed 
data.record.createdAt	Integer	Order creation timestamp, 10-digit
data.record.arrivedAt	Integer	Payment arrived timestamp
data.record.amountOutMinimum	String	The minimum amount of the output coin that the user is willing to receive for the swap.
data.record.extraFee	String	Extra fee amount, extra fee rate*output coin amount
data.record.extraFeeRate	String	Percentage rate you want to charge for this transaction as your service fee.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "record": {
6        "recordId": "20240722021342166923068583059456",
7        "orderId": "1721614421267",
8        "coinInSymbol": "USDT",
9        "coinIdIn": 1280,
10        "coinOutSymbol": "MATIC",
11        "coinIdOut": 1329,
12        "amountOut": "1.8174262160994585",
13        "amountIn": "1.000000000000000000000000",
14        "netAmountOut": "1.634953704442886400000000",
15        "userId": "user-swap1",
16        "extraFee": "0",
17        "extraFeeRate": "0",
18        "swapRate": "1.817426216099458500000000",
19        "feeRate": "0.1004016064257028",
20        "fee": "0.182472511656572100000000",
21        "status": "Success",
22        "createdAt": 1721614422,
23        "arrivedAt": 1721614422
24      }
25    }
26  }
Get User Swap Record List
This endpoint retrieves the details of a list of swap orders.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getUserSwapRecordList

Parameters
Parameters	Type	Required	Description
recordIds	Array[string]	No	CCPayment unique ID for a transaction
orderIds	Array[string]	No	Swap order ID created by merchant, 3-64 characters in length
userId	String	No	User ID should be a string of 5 - 64 characters and can not start with 'sys'.
coinIdIn	Integer	No	ID of the input coin
coinIdOut	Integer	No	ID of the output coin
startAt	Integer	No	
Retrieve all transaction records starting from the specified startAt timestamp. 10-digit. 
endAt	Integer	No	
Retrieve all transaction records up to the specified endAt timestamp. 10-digit. 
nextId	String	No	Next ID, If the query result exceeds 20 records, a 'nextId' field will be returned.

You can use the same query conditions along with the 'nextId' field to retrieve the remaining transaction data.
You can make queries under a single condition or multiple conditions.
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getUserSwapRecordList';
8const args = '';
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'AppId': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.records	Array	 
data.records[index].recordId	String	CCPayment unique ID for a transaction
data.records[index].orderId	String	Swap order ID created by merchant
data.records[index].coinInSymbol	String	Input coin symbol
data.records[index].coinIdIn	Integer	ID of the input coin
data.records[index].coinOutSymbol	String	ID of the input coin
data.records[index].coinIdOut	Integer	ID of the output coin
data.records[index].amountOut	String	Amount of the output coin
data.records[index].netAmountOut	String	Net receivable output coin amount. netAmountOut = amountOut - fee - extraFee
data.records[index].amountIn	String	Amount of the input coin
data.records[index].userId	String	User ID should be a string of 5 - 64 characters and can not start with 'sys'.
data.records[index].swapRate	String	swapRate = amountIn/amountOut
data.records[index].feeRate	String	CCPayment service fee rate for the swap. 
data.records[index].fee	String	Fee amount, fee rate*amountOut.
If the calculated swap service fee for a transaction is lower than 0.1 USDT, a minimum fee equivalent to 0.1 USDT in the output coin will be applied instead.
data.records[index].status	String	
Success: the transaction has been confirmed

Processing: blockchain is processing the transaction

Failed: transaction failed 
data.records[index].createdAt	Integer	Order creation timestamp, 10-digit
data.records[index].arrivedAt	Integer	Payment arrived timestamp
data.records[index].amountOutMinimum	String	The minimum amount of the output coin that the user is willing to receive for the swap.
data.records[index].extraFee	String	Extra fee amount, extra fee rate*output coin amount
data.records[index].extraFeeRate	String	Percentage rate you want to charge for this transaction as your service fee.
data.nextId	String	
If the query result exceeds 20 records, a "nextId" field will be returned. 

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "records": [
6        {
7          "recordId": "20240722021342166923068583059456",
8          "orderId": "1721614421267",
9          "coinInSymbol": "USDT",
10          "coinIdIn": 1280,
11          "coinOutSymbol": "MATIC",
12          "coinIdOut": 1329,
13          "amountOut": "1.8174262160994585",
14          "amountIn": "1.000000000000000000000000",
15          "netAmountOut": "1.634953704442886400000000",
16          "userId": "user-swap1",
17          "extraFee": "0",
18          "extraFeeRate": "0",
19          "swapRate": "1.817426216099458500000000",
20          "feeRate": "0.1004016064257028",
21          "fee": "0.182472511656572100000000",
22          "status": "Success",
23          "createdAt": 1721614422,
24          "arrivedAt": 1721614422
25        },
26        ...
27      ],
28      "nextId": ""
29    }
30  }
Common API
Get Token List
This endpoint retrieves all details of tokens you've enabled for your business.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getCoinList

Parameters
Parameters	Type	Required	Description
No parameters required
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getCoinList";
8const args = "";
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac("sha256", appSecret)
18  .update(signText)
19  .digest("hex");
20
21const options = {
22  method: "POST",
23  headers: {
24    "Content-Type": "application/json",
25    "Appid": appId,
26    "Sign": sign,
27    "Timestamp": timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32let respData = "";
33
34res.on("data", (chunk) => {
35  respData += chunk;
36});
37
38res.on("end", () => {
39  console.log("Response:", respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.coins	Array	 
data.coins[index].coinId	Integer	Coin ID
data.coins[index].symbol	String	Coin symbol
data.coins[index].coinFullName	String	Coin full name
data.coins[index].logoUrl	String	Coin logo
data.coins[index].status	String	
Coin status: 
Normal: available deposit/withdrawal; 
Maintain: withdrawal suspended;  
Pre-delisting: deposit suspended;  
Delisted: deposit/withdrawal suspended
data.coins[index].networks	Object	List of supported networks for this coin
data.coins[index].networks.AVAX	Object	 
data.coins[index].networks.AVAX.chain	String	Symbol of the chain
data.coins[index].networks.AVAX.chainFullName	String	Full name of the chain
data.coins[index].networks.AVAX.contract	String	Coin contract
data.coins[index].networks.AVAX.precision	Integer	Precision
data.coins[index].networks.AVAX.canDeposit	Boolean	Deposit status
data.coins[index].networks.AVAX.canWithdraw	Boolean	Withdrawal status
data.coins[index].networks.AVAX.minimumDepositAmount	String	Minimal deposit amount
data.coins[index].networks.AVAX.minimumWithdrawAmount	String	Minimal withdrawal amount
data.coins[index].networks.AVAX.maximumWithdrawAmount	String	Maximum withdrawal amount. If the value is 0, there is no maximum amount for this coin
data.coins[index].networks.AVAX.isSupportMemo	Boolean	Whether transactions on this chain require a memo
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "coins": [
6        {
7          "coinId": 1207,
8          "symbol": "LINK",
9          "coinFullName":"ChainLink Token",
10          "logoUrl": "https://resource.cwallet.com/token/icon/link.png",
11          "status": "Normal",
12          "networks": {
13            "BSC": {
14              "chain": "BSC",
15              "chainFullName": "Binance Smart Chain",
16              "contract": "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
17              "precision": 18,
18              "canDeposit": true,
19              "canWithdraw": true,
20              "minimumDepositAmount": "0",
21              "minimumWithdrawAmount": "0.025",
22              "maximumWithdrawAmount": "0",
23              "isSupportMemo": false
24            },
25            "ETH": {
26              "chain": "ETH",
27              "chainFullName": "Ethereum",
28              "contract": "0x514910771af9ca656af840dff83e8264ecf986ca",
29              "precision": 18,
30              "canDeposit": true,
31              "canWithdraw": true,
32              "minimumDepositAmount": "0",
33              "minimumWithdrawAmount": "0.025",
34              "maximumWithdrawAmount": "0",
35              "isSupportMemo": false
36            }
37          }
38        },
39        ...
40      ]
41    }
42  }
Get Token Information
This endpoint retrieves the detailed information of one specific token
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getCoin

Parameters
Parameters	Type	Required	Description
coinId	Integer	Yes	Coin ID
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getCoin';
8const args = JSON.stringify({ 'coinId': 1280 });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24'Content-Type': 'application/json',
25'Appid': appId,
26'Sign': sign,
27'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.coin	Array	 
data.coin[index].coinId	Integer	Coin ID
data.coin[index].symbol	String	Coin symbol
data.coin[index].coinFullName	String	Coin full name
data.coin[index].logoUrl	String	Coin logo
data.coin[index].status	String	
Coin status: 
Normal: available deposit/withdrawal; 
Maintain: withdrawal suspended;  
Pre-delisting: deposit suspended;  
Delisted: deposit/withdrawal suspended
data.coin[index].networks	Object	List of supported networks for this coin
data.coin[index].networks[chain]	Object	 
data.coin[index].networks[chain].chain	String	Symbol of the chain
data.coin[index].networks[chain].chainFullName	String	Full name of the chain
data.coin[index].networks[chain].contract	String	Coin contract
data.coin[index].networks[chain].precision	Integer	Precision
data.coin[index].networks[chain].canDeposit	Boolean	Deposit status
data.coin[index].networks[chain].canWithdraw	Boolean	Withdrawal status
data.coin[index].networks[chain].minimumDepositAmount	String	Minimal deposit amount
data.coin[index].networks[chain].minimumWithdrawAmount	String	Minimal withdrawal amount
data.coin[index].networks[chain].maximumWithdrawAmount	String	Maximum withdrawal amount. If the value is 0, there is no maximum amount for this coin
data.coin[index].networks[chain].isSupportMemo	Boolean	Whether transactions on this chain require a memo
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5  "coin": {
6  "coinId": 1329,
7  "symbol": "MATIC",
8  "coinFullName":"Matic Token",
9  "logoUrl": "https://resource.cwallet.com/token/icon/matic.png",
10  "status": "Normal",
11  "networks": {
12    "BSC": {
13      "chain": "BSC",
14      "chainFullName": "Binance Smart Chain",
15      "contract": "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
16      "precision": 18,
17      "canDeposit": true,
18      "canWithdraw": true,
19      "minimumDepositAmount": "0",
20      "minimumWithdrawAmount": "0.025",
21      "maximumWithdrawAmount": "0",
22      "isSupportMemo": false
23    },
24    "ETH": {
25      "chain": "ETH",
26      "chainFullName": "Ethereum",
27      "contract": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
28      "precision": 18,
29      "canDeposit": true,
30      "canWithdraw": true,
31      "minimumDepositAmount": "0",
32      "minimumWithdrawAmount": "0.025",
33      "maximumWithdrawAmount": "0",
34      "isSupportMemo": false
35    },
36    "POLYGON": {
37      "chain": "POLYGON",
38      "chainFullName": "Polygon",
39      "contract": "137",
40      "precision": 18,
41      "canDeposit": true,
42      "canWithdraw": true,
43      "minimumDepositAmount": "0",
44      "minimumWithdrawAmount": "0.025",
45      "maximumWithdrawAmount": "0",
46      "isSupportMemo": false
47    }
48  }
49  }
50  }
51  }
52    
Get Token Price
POST
https://ccpayment.com/ccpayment/v2/getCoinUSDTPrice

Parameters
Parameters	Type	Required	Description
coinIds	Array	Yes	Array of coin IDs
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getCoinUSDTPrice';
8const args = JSON.stringify({ 'coinIds': [1280] });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24'Content-Type': 'application/json',
25'Appid': appId,
26'Sign': sign,
27'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.prices	Object	 
data.prices[coinId]	String	Equivalent USDT value of this coin
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5  "prices": {
6    "1329": "1.1683"
7   }
8  }
9  }
Balance Query APIs
Get Balance List
This endpoint retrieves all balance in the merchant account
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppCoinAssetList

Parameters
Parameters	Type	Required	Description
No parameters required
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getAppCoinAssetList";
8const args = "";
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac("sha256", appSecret)
18  .update(signText)
19  .digest("hex");
20
21const options = {
22  method: "POST",
23  headers: {
24    "Content-Type": "application/json",
25    "Appid": appId,
26    "Sign": sign,
27    "Timestamp": timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = "";
33
34  res.on("data", (chunk) => {
35    respData += chunk;
36  });
37
38  res.on("end", () => {
39    console.log("Response:", respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.assets	Array	Balance list
data.assets[index].coinId	Integer	Coin ID
data.assets[index].coinSymbol	String	Coin symbol
data.assets[index].available	String	available amount
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "assets": [
6        {
7          "coinId": 1864,
8          "coinSymbol": "SHIB",
9          "available": ""
10        },
11        ...
12      ]
13    }
14  }
Get Coin Balance
This endpoint retrieves the balance of one provided coin
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getAppCoinAsset

Parameters
Parameters	Type	Required	Description
coinId	Integer	Yes	Coin ID
Request Example

1const https = require("https");
2const crypto = require("crypto");
3
4const appId = "*** your appId ***";
5const appSecret = "*** your appSecret ***";
6
7const path = "https://ccpayment.com/ccpayment/v2/getAppCoinAsset";
8const args = JSON.stringify({
9  "coinId": 1280,
10});
11
12const timestamp = Math.floor(Date.now() / 1000);
13let signText = appId + timestamp;
14if (args.length !== 0) {
15  signText += args;
16}
17
18const sign = crypto
19  .createHmac("sha256", appSecret)
20  .update(signText)
21  .digest("hex");
22
23const options = {
24  method: "POST",
25  headers: {
26    "Content-Type": "application/json",
27    "Appid": appId,
28    "Sign": sign,
29    "Timestamp": timestamp.toString(),
30  },
31};
32
33const req = https.request(path, options, (res) => {
34  let respData = "";
35
36  res.on("data", (chunk) => {
37    respData += chunk;
38  });
39
40  res.on("end", () => {
41    console.log("Response:", respData);
42  });
43});
44
45req.write(args);
46req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.asset	Object	Balance list
data.asset.coinId	Integer	Coin ID
data.asset.coinSymbol	String	Coin symbol
data.asset.available	String	available amount
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "asset": {
6        "coinId": 1329,
7        "coinSymbol": "MATIC",
8        "available": ""
9      }
10    }
11  }
Rescan Lost Transaction
This endpoint allows you to trigger a rescan for a deposit transaction.
Use case:
If a user confirms that the on-chain transaction was successful but the funds haven’t been credited, you can call this endpoint to prompt the user to submit the transaction details. The system will then rescan the transaction to help speed up the crediting process.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/rescanLostTransaction

Parameters
Parameters	Type	Required	Description
chain	String	Yes	Chain symbol. For example, 'chains': ['BSC']
You can get the chain information by calling Get Chain List
toAddress	String	Yes	Receiving address of deposit
memo	String	No	Memo for memo-required coins 
(such as XRP, XLM, TON, etc.)
txId	String	Yes	TXID
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/rescanLostTransaction';
8const args = JSON.stringify({ 
9    'chain': "XLM",
10    'toAddress':'GBSCAK4DTAS4TUNZJUQ5QO5FCJBEXVH7JSMZNZLRTSIZGIDS3H7CWE7O',
11    'txId':'9f1597024ca2fabdef4048c4b203fbc2ee2cda1ba2504f184f3a8304d97c1487',
12    'memo':'109',
13});
14
15const timestamp = Math.floor(Date.now() / 1000);
16let signText = appId + timestamp;
17if (args) {
18signText += args;
19}
20
21const sign = crypto
22.createHmac('sha256', appSecret)
23.update(signText)
24.digest('hex');
25
26const options = {
27method: 'POST',
28headers: {
29'Content-Type': 'application/json',
30'Appid': appId,
31'Sign': sign,
32'Timestamp': timestamp.toString(),
33},
34};
35
36const req = https.request(path, options, (res) => {
37let respData = '';
38
39res.on('data', (chunk) => {
40respData += chunk;
41});
42
43res.on('end', () => {
44console.log('Response:', respData);
45});
46});
47
48req.write(args);
49req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.description	String	Detailed message returned by the system. You can display it to the user to indicate the current deposit processing status.
Response

1{
2  'code': 10000,
3  'msg': 'success',
4  'data': {
5    'description': 'The deposit has been rescanned. Please wait for the transaction to be credited.'
6  }
7}
Get Cwallet User Information
Pass Cwallet ID to this endpoint to see if the provided ID belongs to a Cwallet user and retrieve its username.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getCwalletUserId

Parameters
Parameters	Type	Required	Description
cwalletUserId	String	Yes	Cwallet user ID
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getCwalletUserId';
8const args = JSON.stringify({ 'cwalletUserId': '9558861' });
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24  'Content-Type': 'application/json',
25  'Appid': appId,
26  'Sign': sign,
27  'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.cwalletUserId	String	Cwallet user ID
data.cwalletUserName	String	Cwallet user name
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5  "cwalletUserId": "35255142",
6  "cwalletUserName": "j***@proton.me"
7  }
8  }
Check Withdrawal Address Validity
Provide the withdrawal address to this endpoint to verify if it's eligible to receive the transfer.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/checkWithdrawalAddressValidity

Parameters
Parameters	Type	Required	Description
chain	String	Yes	Symbol of the network, for example 'AVAX' for Avalanche
address	String	Yes	Receiving address of withdrawal
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/checkWithdrawalAddressValidity';
8const args = JSON.stringify({ 'chain': "POLYGON" ,'address':'0x43fEeF6879286BBAC5082f17AD3dA55EE456B934'});
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24  'Content-Type': 'application/json',
25  'Appid': appId,
26  'Sign': sign,
27  'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.addrIsValid	Boolean	
true:valid address
false:invalid address 
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "addrIsValid": true
6  }
7}
Get Withdrawal Network Fee
This endpoint retrieves withdrawal network fee for the given token.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getWithdrawFee

Parameters
Parameters	Type	Required	Description
coinId	Integer	Yes	Coin ID
chain	String	Yes	Symbol of the chain
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getWithdrawFee';
8const args = JSON.stringify({ 'coinId': 1280 ,'chain':'POLYGON'});
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24  'Content-Type': 'application/json',
25  'Appid': appId,
26  'Sign': sign,
27  'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.fee	Object
data.fee.coinId	Integer	Coin ID of the network fee
data.fee.coinSymbol	String	Network fee symbol
data.fee.amount	String	Amount of network fee
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "fee": {
6      "coinId": 1329,
7      "coinSymbol": "MATIC",
8      "amount": "0.0213814"
9    }
10  }
11  }
Get Fiat List
This endpoint retrieves the list of fiat information
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getFiatList

Parameters
Parameters	Type	Required	Description
No parameters required
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getFiatList';
8const args = '';
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24  'Content-Type': 'application/json',
25  'Appid': appId,
26  'Sign': sign,
27  'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.fiats	Array
data.fiats[index].fiatId	Integer	Fiat ID
data.fiats[index].symbol	String	Fiat symbol
data.fiats[index].logoUrl	String	Fiat logo URL
data.fiats[index].mark	String	Fiat icon
data.fiats[index].usdRate	String	Equivalent fiat value of 1 USD
Response

1{
2  "code": 10000,
3  "msg": "success",
4  "data": {
5    "fiats": [
6      {
7        "fiatId": 1022,
8        "symbol": "DKK",
9        "logoUrl": "https://resource.cwallet.com/fiat/DKK.png",
10        "mark": "KR",
11        "usdRate": "6.825765"
12      },
13      ...
14    ]
15  }
16  }
Get Swap Coin List
This endpoint retrieves the list of all coins available for swap.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getSwapCoinList

Parameters
Parameters	Type	Required	Description
No parameters required
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId = '*** your appId ***';
5const appSecret = '*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getSwapCoinList';
8const args = '';
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13  signText += args;
14}
15
16const sign = crypto
17  .createHmac('sha256', appSecret)
18  .update(signText)
19  .digest('hex');
20
21const options = {
22  method: 'POST',
23  headers: {
24    'Content-Type': 'application/json',
25    'AppId': appId,
26    'Sign': sign,
27    'Timestamp': timestamp.toString(),
28  },
29};
30
31const req = https.request(path, options, (res) => {
32  let respData = '';
33
34  res.on('data', (chunk) => {
35    respData += chunk;
36  });
37
38  res.on('end', () => {
39    console.log('Response:', respData);
40  });
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object	 
data.coins	Array	 
data.coins[index].coinId	Integer	Coin ID
data.coins[index].symbol	String	Coin symbol
data.coins[index].logoUrl	String	Coin logo
Note: Please add swappable coins to the Tokens for your business.
 list to get all swappable coin info returned.
Response

1{
2    "code": 10000,
3    "msg": "success",
4    "data": {
5      "coins": [
6        {
7          "coinId": 1254,
8          "symbol": "WAVES",
9          "logoUrl": "https://resource.cwallet.com/token/icon/waves.png"
10        },
11        {
12          "coinId": 1630,
13          "symbol": "ONE",
14          "logoUrl": "https://resource.cwallet.com/token/icon/one.png"
15        },
16        {
17          "coinId": 1193,
18          "symbol": "DCR",
19          "logoUrl": "https://resource.cwallet.com/token/icon/dcr.png"
20        }
21        ...
22      ]
23    }
24  }
Get Chain List
This endpoint retrieves the current network statuses for all supported chains. Pass chain symbols to check specific network statuses.
HTTP Request
POST
https://ccpayment.com/ccpayment/v2/getChainList

Parameters
Parameters	Type	Required	Description
chains	Array	No	Chain symbol. For example, 'chains': ['BSC']
Request Example

1const https = require('https');
2const crypto = require('crypto');
3
4const appId ='*** your appId ***';
5const appSecret ='*** your appSecret ***';
6
7const path = 'https://ccpayment.com/ccpayment/v2/getChainList';
8const args = JSON.stringify({ 'chains': ['ETH','POLYGON']});;
9
10const timestamp = Math.floor(Date.now() / 1000);
11let signText = appId + timestamp;
12if (args) {
13signText += args;
14}
15
16const sign = crypto
17.createHmac('sha256', appSecret)
18.update(signText)
19.digest('hex');
20
21const options = {
22method: 'POST',
23headers: {
24  'Content-Type': 'application/json',
25  'Appid': appId,
26  'Sign': sign,
27  'Timestamp': timestamp.toString(),
28},
29};
30
31const req = https.request(path, options, (res) => {
32let respData = '';
33
34res.on('data', (chunk) => {
35respData += chunk;
36});
37
38res.on('end', () => {
39console.log('Response:', respData);
40});
41});
42
43req.write(args);
44req.end();
Response Parameters
Parameters	Type	Description
data	Object
data.chains	Array
data.chains[index].chain	String	Chain symbol. For example, chain: 'BSC'
data.chains[index].chainFullName	String	Full name of the chain
data.chains[index].explorer	String	Blockchain explorer URL
data.chains[index].baseUrl	String	The base URL serves as the prefix for the on-chain transaction query URL. 
Usage: To retrieve transaction details, append the transaction ID (txid) to this base URL to construct a full on-chain transaction query URL.
data.chains[index].isEVM	Boolean	
True: The chain is EVM-compatible.
False: The chain is not EVM-compatible. 
data.chains[index].supportMemo	Boolean	
True:  Memo/tag is required when using addresses on this chain.
False:  Memo/tag is not required for addresses on this chain.
data.chains[index].logoUrl	String	Coin logo
data.chains[index].status	String	
Normal: Deposits and withdrawals through this chain are operating normally.

Maintenance: Deposits and withdrawals may experience delays, or transactions on this network cannot be processed at this moment. 
Response

1{
2    'code': 10000,
3    'msg': 'success',
4    'data': {
5        'chains': [
6            {
7                'chain': 'ETH',
8                'chainFullName': 'Ethereum',
9                'explorer': 'https://etherscan.io/',
10                'logoUrl': 'https://resource.cwallet.com/token/icon/ETH.png',
11                'status': 'Normal',
12                'baseUrl': 'https://etherscan.io/tx/%s',
13                'isEVM': True,
14                'supportMemo': False
15            },
16            {
17                'chain': 'POLYGON',
18                'chainFullName': 'Polygon',
19                'explorer': 'https://polygonscan.com',
20                'logoUrl': 'https://resource.cwallet.com/token/icon/matic.png',
21                'status': 'Normal',
22                'baseUrl': 'https://polygonscan.com/tx/%s',
23                'isEVM': True,
24                'supportMemo': False
25            }
26        ]
27    }
28}
Support
FAQ
Which deposit interface should I use for my business?
1. Deposit by orders
Industry: E-commerce, product-related business. Deposits will be linked to orders and have a requirement for a fixed amount.
The deposit address for order has a valid time. After the expiration time of the order, the merchant will still receive the deposit to this address for 7 days.
API documentation: Create Deposit Address for Order
2. Deposit by permanent addresses
Industry: gaming, streaming, social platforms. Deposits will be linked to users and have no requirement for a fixed amount.
The deposit address is assigned to one user. After the assignment, users can save the deposit address and make payments to this address anytime they want. Whenever there is a payment to the address, the merchant's server will receive a notification.
API documentation: Get Permanent Deposit Address
Contact your account manager to get more details.
Status Code
Status codes represent the processing status of API requests.
Status code	Tip	Description
10000	Success	The request has been successfully processed, and the system has returned the required information.
10001	Failed	Request failed. Please refer to the detailed error message to adjust your request or take necessary steps to resolve the issue.
Error Code
Common Errors
Error code	Error tip	Error description
11000	InvalidArgument	Invalid argument
11001	HeaderInvalidArgument	Invalid argument in header
11002	Internal	We may have a problem with our server. Try again later or report to our support team.
11003	NotFound	Data does not exist
11004	RateLimit	Reached the rate limit. Reduce the frequency of your request
11005	VerifySignFailed	Signature verification failed
11006	ReqExpired	Request has expired
11007	RepeatedSubmit	Repeated submission
11008	QueryDurationTooMax	Query time range cannot be too large
11009	ReqDailyLimit	Exceeded daily request limit
11010	QueryNumMax	The number of transactions queried is too large. Maximum: 100
11011	OrderDuplicate	Order ID is repeated
11012	ExpiredAtTooMax	The maximum valid period is 10 days
11013	NoSupportVersion	This account can only access the Version 1 interface
11014	MaliciousReq	Malicious request, this IP has been banned
11015	UserIdNotFound	userId does not exist
Account Errors
Error code	Error tip	Error description
12000	MerchantDisabled	Merchant account disabled
12001	MerchantNotFound	Merchant does not exist
12002	IpNotInWhitelist	IP not in whitelist, please check the IP whitelist settings on the developer page
12003	MerchantApiDisabled	Please go to dashboard to complete website verification
Token Errors
Error code	Error tip	Error description
13000	InvalidCoin	Unsupported coin
13001	InvalidChain	Unsupported network for this token
13002	AbnormalCoinPrice	Abnormal coin price
13003	AbnormalCoinPriceNotSupportMode	Abnormal coin price, only supports merchants paying network fees
13004	UnstableBlockchain	Unstable blockchain. Withdrawal of this coin is not available. Please try it later.
Withdrawal Errors
Error code	Error tip	Error description
14000	BalanceInsufficient	There is not enough balance for withdrawal
14001	WithdrawFeeTooLow	Withdrawal network fee is too low. Check the real-time network fee by calling network fee interface
14002	AddressNotActive	Invalid/Inactive receiving address, please check if the address is valid
14003	AddressEmptyMemo	Memo for this chain cannot be empty
14004	ChainStopWithdraw	Withdrawals on this chain are temporarily suspended
14005	WithdrawValueLessThanLimit	Withdrawal amount is less than the minimum withdrawal limit. Please check the limit for this coin by calling the Get Available Token List.
14006	WithdrawValueMoreThanLimit	Withdrawal amount exceeds the maximum withdrawal limit.
14007	WithdrawAddrFormat	Incorrect withdrawal address format
14008	WithdrawCannotSelf	Can not withdraw to your own CCPayment address
14009	CoinNoSupportMemo	This coin does not support memo
14010	NoSupportCoin	Merchant does not support this token. Please go to the merchant settings or use the "Get Token List" interface to view supported tokens
14011	WithdrawFeeBalanceNotEnough	Insufficient native token for paying network fee
14012	NotSupportMerchantTransfer	Transfer by Merchant account ID is only supported between main account and sub-accounts.
14013	CoinPrecisionLimit	Exceeded coin precision limit
14014	NotFinishCollection	Unpaid assets aggregation fees. See the details on your dashboard and deposit USDT to pay the outstanding balance
14015	WithdrawToContractAddress	Can not be withdrawn to contract addresses
14016	WithdrawInvalidAddressType	Address type error, we only support transfer to data accounts.
Deposit Errors
Error code	Error tip	Error description
15000	GenerateAddressFailed	Fail to generate address, please try again
15001	PaymentAddressNumTooMuch	Available deposit addresses for this account reached the maximum limit
15003	ChainStopDeposit	Deposits for this chain are suspended
Contact Us
Please feel free to contact support from CCPayment if you have any questions about integration.
Telegram support: https://t.me/CCPaymentSupportBot
E-mail: support@ccpayment.com
