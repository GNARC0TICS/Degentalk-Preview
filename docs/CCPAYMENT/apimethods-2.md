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