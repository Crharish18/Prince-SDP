const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { OAuth2 } = google.auth;

// Load the OAuth2 client credentials
const credentials = require('./credentials.json');

const oAuth2Client = new OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// Function to authenticate with Google Drive
async function authenticate() {
  const tokenPath = path.join(__dirname, 'token.json');

  if (fs.existsSync(tokenPath)) {
    const token = require(tokenPath);
    oAuth2Client.setCredentials(token);
  } else {
    // You need to handle the OAuth2 flow here (e.g., generate a new token)
  }

  return google.drive({ version: 'v3', auth: oAuth2Client });
}

module.exports = authenticate;
