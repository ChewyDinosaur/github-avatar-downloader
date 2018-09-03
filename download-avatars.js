const dotenv = require('dotenv');
const request = require('request');
const fs = require('fs');
const path = require('path');

const userInput = process.argv.slice(2);

const result = dotenv.config()
try {
  if (result.error) {
    throw result.error
  }
} catch(err) {
  console.log('Error: .env file not found. Please make sure it has been created and is in the root directory');
  process.exit(err.errno);
}


console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': process.env.GITHUB_TOKEN
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
    console.log('Error, please enter 2 parameters: <owner> & <repo>');
    return;
  }

  const parsed = JSON.parse(result);
  
  // Check if the provided repo/owner was entered incorrectly
  if (parsed.message) {
    console.log('User or repo not found, please check to ensure user and repo were entered correctly');
    return;
  }

  parsed.forEach(function(item, i) {
    const filePath = `avatars/${item.login}.jpg`;
    //downloadImageByURL(item.avatar_url, filePath, i);
  });
});



//0348bd036908a822bca5ba39f888b8c58c079f34