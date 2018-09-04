const dotenv = require('dotenv');
const request = require('request');

const userInput = process.argv.slice(2);
const reposAndStars = {};

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

function getStarCounts(url, cb) {
  const options = {
    url: url,
    headers: {
      'User-Agent': 'request',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  };
  request(options, function(err, res, body) {
    cb(err, body);
  });
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

  parsed = JSON.parse(result);

  // Handle error if repo/owner name incorrect, or if token credentials incorrect
  if (parsed.message === 'Not Found') {
    console.log('Error: User or repo not found. Please make sure you entered the correct queries.');
    process.exit();
  } else if (parsed.message === 'Bad credentials') {
    console.log('Error: Your GitHub token is incorrect. Double check the .env file.');
    process.exit();
  }


  parsed.forEach(function(user) {
    const starredURL = `https://api.github.com/users/${user.login}/starred`;
    // request the current user's starred repos
    getStarCounts(starredURL, function(err, userStarred) {
      parsedInfo = JSON.parse(userStarred);
      // loop through each of the current users starred repos
      parsedInfo.forEach(function(item) {
        // Add the repo to the object if doesnt exist or increase starcount
        if (!reposAndStars[item.name]) {
          reposAndStars[item.name] = {
            'starCount': 1,
            'creator': item.owner.login
          }
        } else {
          reposAndStars[item.name].starCount++;
        }
      });
    });
  });

  // Wait 3 second for asynchronous functions to complete
  setTimeout(function() {
    let reposAndStarsArray = [];
    for (var i in reposAndStars) {
      reposAndStarsArray.push([i, reposAndStars[i].starCount, reposAndStars[i].creator]);
    }
    reposAndStarsArray.sort(function(a, b) {
      return b[1] - a[1];
    });
    for (let i = 0; i < 5; i++) {
      console.log(`[ ${reposAndStarsArray[i][1]} stars ] ${reposAndStarsArray[i][2]} / ${reposAndStarsArray[i][0]}`);
    } 
  }, 300);
});