const helper = require('./helper');

const interval = 10; // seconds
const recoveryPerInterval = (interval) * (20 / 24 / 60); // % VP

let posts = helper.generateRandomPosts(1000);
let botVP = 100;
let timePassed = 0; // minutes
let postIndex = 0;

setInterval(() => {
  if (postIndex < posts.length) {
    if (botVP >= 99) {
      let post = posts[postIndex];
      let postVoteWeight = helper.getPostVoteWeight(post);
      let decreaseVP = helper.calcDecreaseVP(postVoteWeight);
      let recoveryTime = helper.calcRecoveryTime(decreaseVP);

      // vote
      botVP -= decreaseVP;

      console.log('Vote post: ' + postIndex);
      console.log('Category: ' + post.category);
      console.log('Score: ' + post.score + '/100');
      console.log('Vote weight: ' + postVoteWeight.toFixed(3) + '%');
      console.log('Bot VP: -' + decreaseVP.toFixed(3) + '% (current: ' + botVP.toFixed(3) + '%)');
      console.log('Recovery time: ' + recoveryTime.toFixed(3) + ' minutes');
      console.log('');

      timePassed += recoveryTime;
      postIndex++;
    } else {
      console.log('Voting Power to low: ' + botVP.toFixed(3));
      console.log('');
    }
    botVP += recoveryPerInterval;
  }
}, interval * 1000);