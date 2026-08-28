const crypto = require('crypto');
const signature = crypto.createHmac('sha256', 'TAQQSf1RVj6M+FhXQS3hDg==').update('{}').digest('hex');
console.log(signature);
