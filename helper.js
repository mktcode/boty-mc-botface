const steem = require('steem');
const categories = require('./categories');

const helper = {
  getVoteWeightForPost(post) {
    let min = categories.limits[post.category].min;
    let max = categories.limits[post.category].max;

    return ((max - min) * (post.score / 100)) + min;
  },
  calcRecoveryTime(decrease) {
    return decrease * 72;
  },
  calcDecreaseVP(voteWeight) {
    return 2 * voteWeight / 100;
  },
  getCurrentVotingPower(account, humanReadable = false) {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([account], (err, accounts) => {
        if (!err) {
          const status = accounts[0];

          const secondsAgo = (new Date().getTime() - new Date(status.last_vote_time + 'Z').getTime()) / 1000;
          let votingPower = status.voting_power + (10000 * secondsAgo / 432000);

          if (humanReadable) votingPower /= 100;

          resolve(votingPower);
        } else {
          reject(err);
        }
      })
    });
  },
  getPostsWaitingForUpvote(posts, voterAccount) {
    return posts.find({
      reviewed: true,
      'json_metadata.score': { $ne : null },
      author: { $ne: voterAccount }, // prevent self-voting
      created: {
        // $gte: new Date((new Date()).getTime() - 6*60*60*1000).toISOString()
        $gte: new Date((new Date()).getTime() - 6*60*60*1000).toISOString()
      }
    }).sort({created: 1}).exec();
  },
  upvotePost(voter, key, post, weight) {
    return new Promise((resolve, reject) => {
      steem.broadcast.vote(key, voter, post.author, post.permlink, weight * 100, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }
};

module.exports = helper;