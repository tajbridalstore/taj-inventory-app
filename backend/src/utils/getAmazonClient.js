const SellingPartnerAPI = require('amazon-sp-api');
const  getAccessToken =require("./genarateToken");  // import the access token fetch function

// Function to get the Access Token
const getAmazonClient = async () => {
    const spapiClient = new SellingPartnerAPI({
      region: 'eu',
      refresh_token: process.env.REFRESH_TOKEN,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: process.env.LWA_CLIENT_ID,
        SELLING_PARTNER_APP_CLIENT_SECRET: process.env.LWA_CLIENT_SECRET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE
      }
    });
  
    return spapiClient;
  };
  

module.exports =  getAmazonClient;
