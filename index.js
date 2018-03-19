const helper = require('./helper');

const postCount = process.env.BOT_POST_COUNT || 1000;
const interval = process.env.BOT_INTERVAL_SECONDS || 10; // seconds
const recoveryPerInterval = (interval) * (20 / 24 / 60); // % VP

let posts = helper.generateRandomPosts(postCount);
let botVP = 100;
let postIndex = 0;

const run = () => {
  if (postIndex < posts.length) {
    if (botVP >= 99) {
      let post = posts[postIndex];
      let postVoteWeight = helper.getPostVoteWeight(post);
      let decreaseVP = helper.calcDecreaseVP(postVoteWeight);
      let recoveryTime = helper.calcRecoveryTime(decreaseVP);

      // vote
      botVP -= decreaseVP;

      console.log('Vote post: ' + (postIndex + 1) + '/' + postCount);
      console.log('Category: ' + post.category);
      console.log('Score: ' + post.score + '/100');
      console.log('Vote weight: ' + postVoteWeight.toFixed(3) + '%');
      console.log('Bot VP: -' + decreaseVP.toFixed(3) + '% (current: ' + botVP.toFixed(3) + '%)');
      console.log('Recovery time: ' + recoveryTime.toFixed(3) + ' minutes');
      console.log('');

      postIndex++;
    } else {
      console.log('Voting Power to low: ' + botVP.toFixed(3));
      console.log('');
    }
    botVP += recoveryPerInterval;
  }
};

run();
setInterval(run, interval * 1000);