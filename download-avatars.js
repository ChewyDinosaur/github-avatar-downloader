const request = require('request');
const fs = require('fs');
const path = require('path');
const token = require('./secrets');


console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': token.GITHUB_TOKEN
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


getRepoContributors("jquery", "jquery", function(err, result) {
  if (err) {
    throw err;
  }
  const parsed = JSON.parse(result);
  parsed.forEach(function(item, i) {
    const filePath = `avatars/${item.login}.jpg`;
    downloadImageByURL(item.avatar_url, filePath, i);
  });
});
