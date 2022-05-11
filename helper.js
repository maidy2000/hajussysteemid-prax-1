const NodeRSA = require("node-rsa");
const prompt = require("prompt-sync")({ sigint: true });
const axios = require("axios").default;

// public keys
// -----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALplS6RCLvnvymjt/WzqWsSEQupJ9em0VArB5RCit4WdJYurdXDl2yHFF3jWZ2aHghqxRGO5GXaP9i29vTN22pkCAwEAAQ==-----END PUBLIC KEY-----
// -----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMeOo2bs79TZh+3Nqip9PeRXn7BnPdHpdVfAkReWEvkts84OxUnAex50nvnaF5F4Iza9vPxZKpq1bdS5sGhbC2kCAwEAAQ==-----END PUBLIC KEY-----
// -----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ5wqJLL63/Z1Fz0FmevNJR3AKzkvU6r7WHYLgQuQlKSVT3adYZoGkO0m7J1LegiWbhjbqLZ6if75V+5S9b1E+kCAwEAAQ==-----END PUBLIC KEY-----

const users = [
  "-----BEGIN RSA PRIVATE KEY-----MIIBPAIBAAJBALplS6RCLvnvymjt/WzqWsSEQupJ9em0VArB5RCit4WdJYurdXDl2yHFF3jWZ2aHghqxRGO5GXaP9i29vTN22pkCAwEAAQJASWvTMt2bEXqB+XkdZUSfAl+y2ATQKAGPRTmBGF9v+OHzjR9+C/7yGyi4/uXV6ZFWkq0SM8jw/9QBdYOt2eyL/QIhAPTRQvMngAs6SQl2zOvrMc4LP72oHBc07Wts9vDltllzAiEAwujjL9qoZuARjr2X8qCKMO50PqPIMsBcTxlNPD9eaMMCIQCwRCLiE2SbsOF5UPIGQpbfdTX1hZ6EDvWKTTAXDi2WhQIhAIQkgGKhTCrzHvQ3dhz42rfx8r3FLKW75Nl7vfFqxQchAiEAxI4t2AiCYpr+Wwf3r6V73PRk4MXZJEYvbDVVL904bNQ=-----END RSA PRIVATE KEY-----",
  "-----BEGIN RSA PRIVATE KEY-----MIIBOgIBAAJBAMeOo2bs79TZh+3Nqip9PeRXn7BnPdHpdVfAkReWEvkts84OxUnAex50nvnaF5F4Iza9vPxZKpq1bdS5sGhbC2kCAwEAAQJBALi4GBkWCYqFMYW2cmWSONA9K9wmNNsxtyTbY3Lpv/ZV66yV7iwMsPRFQSU2/G7o1X5m+LEL1/glDaHKSRirT+ECIQD2imqwNhrwPZB3qNP2+sK69ly4FXxAypAYrlBjLpIuWwIhAM82vOr4UqzNjfEwcfuQK7dr17jf9PIrLLOdWOHbeaCLAiA+90ccThU/OloFVacdMxo86eLwWPxtB88ZnpuFWUWYdQIgV8L6PpaQBYpF3OpEzGQib9woELAiAVNR6nzxAS/AksMCICn9Wvei0Ibww8Bea4Tg9KzbnLKiYJEqPQpg+w5LZmWt-----END RSA PRIVATE KEY-----",
  "-----BEGIN RSA PRIVATE KEY-----MIIBOwIBAAJBAJ5wqJLL63/Z1Fz0FmevNJR3AKzkvU6r7WHYLgQuQlKSVT3adYZoGkO0m7J1LegiWbhjbqLZ6if75V+5S9b1E+kCAwEAAQJAbM/wZgjYbtDaMRCNhp3kXYYxF4xsmugmuojuaX6fm/a7yPPCFWOxSr48NE+f/mP0Dim91YGNC2QloaX4jHuwgQIhAPUf5aQMIqjhkmARM74m90aUMf9YP6zwWdh6z6w1vOt5AiEApXg020EH7/eq2l83Um2tlVg/oaHeEuUkeGqmpLql3/ECIQCdkL5doAtbgXxE0mnvTj7fGH23BHQR54HpXLBHo1doCQIgIvGPt/2zv2l+Gz+gXzfqQG+ygF++lh7t5MAhEQiZnwECIQCVdYEcYDv/QuHJiVipXT3bzoeafDhzK+qSkNSH8xnvFA==-----END RSA PRIVATE KEY-----",
];

const selectUserInput = prompt("Choose sender (0-2): ");
const selectedUserPrivate = users[parseInt(selectUserInput)];
const selectedUserKey = new NodeRSA(selectedUserPrivate);
const selectedUserPublic = selectedUserKey.exportKey("public").split('\n').join('');

const targetUserInput = prompt("Choose receiver (0-2): ");
const targetUserPrivate = users[parseInt(targetUserInput)];
const targetUserKey = new NodeRSA(targetUserPrivate);
const targetUserPublic = targetUserKey.exportKey("public").split('\n').join('');

const sum = parseFloat(prompt("Amount to transfer: "));
const timestamp = new Date().toISOString();

const transactionBody = `${selectedUserPublic}${targetUserPublic}${sum}${timestamp}`;
const signature = selectedUserKey.sign(transactionBody, "base64", "utf8");

const transaction = {
  from: selectedUserPublic,
  to: targetUserPublic,
  sum: sum,
  timestamp: timestamp,
  signature: signature,
};

const targetNodePort = parseInt(prompt("Target node's port: "));

axios.post(`http://127.0.0.1:${targetNodePort}/transactions`, transaction).catch();
