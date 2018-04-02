const steem = require('steem');
const categories = require('./categories');

const DEBUG = !(process.env.BOT_DEBUG && process.env.BOT_DEBUG === 'no');

const helper = {
  getVoteWeightForPost(post) {
    let meta = JSON.parse(post.json_metadata);
    let category = meta.type;
    category = category.indexOf('task-') !== -1 ? 'task-requests' : category;

    let min = categories.limits[category].min;
    let max = categories.limits[category].max;

    return ((max - min) * (meta.score / 100)) + min;
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
          votingPower = votingPower > 10000 ? 10000 : votingPower;

          if (humanReadable) votingPower /= 100;

          resolve(votingPower);
        } else {
          reject(err);
        }
      })
    });
  },
  async getPostsWaitingForUpvote(voterAccount) {
    let postsWaitingForUpvote = [];
    let maxAge = 6.5 * 24 * 60 * 60 * 1000;
    let posts;
    let lastPost;
    let lastPostAge;
    let startAuthor;
    let startPermlink;

    do {
      posts = await this.getPosts(startAuthor, startPermlink);
      lastPost = posts[posts.length - 1];
      lastPostAge = new Date().getTime() - new Date(lastPost.created).getTime();
      startAuthor = lastPost.author;
      startPermlink = lastPost.permlink;

      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        let postAge = new Date().getTime() - new Date(post.created).getTime();
        let meta = JSON.parse(post.json_metadata);
        let isUtopianPost = meta.hasOwnProperty('app') && meta.app.indexOf('utopian') !== -1;
        let isApproved = meta.hasOwnProperty('moderator') && meta.moderator.reviewed === true;
        let isVoted = this.isVoted(post.active_votes, voterAccount);

        if (postAge < maxAge && isUtopianPost && isApproved && !isVoted) {
          postsWaitingForUpvote.push(post);
        }
      }

    } while (lastPostAge < maxAge);

    return postsWaitingForUpvote.reverse(); // reverse to have oldest post first
  },
  getPosts(start_author, start_permlink) {
    return new Promise((resolve, reject) => {
      steem.api.getDiscussionsByCreated({
        tag: 'utopian-io',
        limit: 100,
        start_author: start_author,
        start_permlink: start_permlink
      }, (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  },
  isVoted(activeVotes, voterAccount) {
    let voted = false;
    for (let i = 0; i < activeVotes.length; i++) {
      if (activeVotes[i].voter === voterAccount) {
        voted = true;
      }
    }
    return voted;
  },
  getStatsFromPast(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const statsFromPast = {
        votedPostsTotal: 500,
        votedPostsPerDay: 71.4,
        averageVotingWeight: 1300, // actual used voting weight
        averageScore: 75,
      };
      resolve(statsFromPast);
    });
  },
  upvotePost(voter, key, post, weight) {
    return new Promise((resolve, reject) => {
      steem.api.getActiveVotes(post.author, post.permlink, (err, activeVotes) => {
        if (!err) {
          if (!this.isVoted(activeVotes, voter)) {
            if (!DEBUG) {
              steem.broadcast.vote(key, voter, post.author, post.permlink, weight, (err, result) => {
                if (!err) {
                  resolve(result);
                } else {
                  reject(err);
                }
              });
            } else {
              resolve();
            }
          } else {
            console.log('Already voted on ' + post.author + '/' + post.permlink);
          }
        } else {
          reject(err);
        }
      });
    });
  }
};

module.exports = helper;
