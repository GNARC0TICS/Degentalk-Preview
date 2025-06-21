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
