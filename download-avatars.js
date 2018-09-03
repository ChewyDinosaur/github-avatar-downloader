const dotenv = require('dotenv');
const request = require('request');
const fs = require('fs');
const path = require('path');
const secrets = require('./secrets');

const userInput = process.argv.slice(2);

console.log('Welcome to the GitHub Avatar Downloader!');


const userEnv = dotenv.config()
// Ensure .env file has been created and is in the proper directory
try {
  if (userEnv.error) {
    throw userEnv.error
  }
} catch(err) {
  console.log('Error: .env file not found. Please make sure it has been created and is in the root directory');
  process.exit(err.errno);
}
// Check contents of the .env file
if (!userEnv.parsed.GITHUB_TOKEN) {
  console.log('Error: .env file missing information. Please make sure the file is configured like the following: GITHUB_TOKEN=<your_token>');
  process.exit();
}



function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  };
  request(options, function(err, res, body) {
    cb(err, body);
  });
}

function downloadImageByURL(url, filePath, index) {
  // First create the folder to save images to if it does not exist
  createFolder(filePath);
  
  // Send the request and download the images
  request.get(url)
       .on('error', function (err) {
         throw err;
       })
       .on('response', function (response) {
         console.log(`Downloading Image #${index + 1}...`);
       })
       .pipe(fs.createWriteStream(filePath));     
}

// Helper function to create directory if it doesn't exist
function createFolder(filePath) {
  const dirName = path.dirname(filePath);
  if (!fs.existsSync(dirName)) {
    fs.mkdir(dirName, function(err) {
      if (err) {
        throw err;
      }
      console.log('avatars directory created.');
    });
  }
}



getRepoContributors(userInput[0], userInput[1], function(err, result) {
  if (err) {
    throw err;
  }
  // Check to make sure user entered 2 parameters
  if (!userInput[0] || !userInput[1]) {
    console.log('Error: Missing argument. Please enter 2 arguments: <owner> & <repo>');
    process.exit();
  }

  const parsed = JSON.parse(result);
  
  // Handle error if repo/owner name incorrect, or if token credentials incorrect
  if (parsed.message) {
    console.log(`Error: ${parsed.message}`);
    process.exit();
  }

  parsed.forEach(function(item, i) {
    const filePath = `avatars/${item.login}.jpg`;
    downloadImageByURL(item.avatar_url, filePath, i);
  });
});

