const steem = require("steem");
const fs = require("fs");
require("dotenv").config({ path: __dirname + "/.env" });

const DEBUG = !(process.env.BOT_DEBUG && process.env.BOT_DEBUG === "no");

const helper = {
  getDatabase() {
    return JSON.parse(
      fs.readFileSync(process.env.DATABASE, { encoding: "utf-8" })
    );
  },
  getVoteWeightForPost(post) {
    let meta = JSON.parse(post.json_metadata);
    return meta.score;
  },
  calcRecoveryTime(percentage) {
    return percentage * 72;
  },
  calcDecreaseVP(voteWeight) {
    return (2 * voteWeight) / 100;
  },
  getCurrentVotingPower(account, humanReadable = false) {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([account], (err, accounts) => {
        if (!err) {
          const status = accounts[0];

          const secondsAgo =
            (new Date().getTime() -
              new Date(status.last_vote_time + "Z").getTime()) /
            1000;
          let votingPower = status.voting_power + (10000 * secondsAgo) / 432000;
          votingPower = votingPower > 10000 ? 10000 : votingPower;

          if (humanReadable) votingPower /= 100;

          resolve(votingPower);
        } else {
          reject(err);
        }
      });
    });
  },
  async getPostsWaitingForUpvote(voterAccount) {
    const postsWaitingForUpvote = [];
    const maxAge = 6.4 * 24 * 60 * 60 * 1000;
    const posts = await this.getPosts();
    const database = this.getDatabase();

    for (let i = 0; i < posts.length; i++) {
      let post = posts[i];
      let postAge = new Date().getTime() - new Date(post.created).getTime();
      let meta = JSON.parse(post.json_metadata);
      let hasScore = meta.hasOwnProperty("score") && meta.score > 0 === true;
      let isInDatabase = database.find(pr => pr.id === meta.prId);

      if (isInDatabase && postAge < maxAge && hasScore) {
        let isVoted = await this.isVoted(
          post.author,
          post.permlink,
          voterAccount
        );
        if (!isVoted) postsWaitingForUpvote.push(post);
      }
    }

    return postsWaitingForUpvote.reverse(); // reverse to have oldest post first
  },
  getPosts() {
    return new Promise((resolve, reject) => {
      steem.api.getContentReplies(
        "merge-rewards",
        "merge-rewards-beta-root-post",
        (err, res) => {
          if (!err) {
            resolve(res);
          } else {
            reject(err);
          }
        }
      );
    });
  },
  isVoted(author, permlink, voterAccount) {
    return new Promise((resolve, reject) => {
      steem.api.getActiveVotes(author, permlink, function(err, activeVotes) {
        if (!err) {
          let voted = false;
          for (let i = 0; i < activeVotes.length; i++) {
            if (activeVotes[i].voter === voterAccount) {
              voted = true;
            }
          }
          resolve(voted);
        } else {
          reject(err);
        }
      });
    });
    return voted;
  },
  upvotePost(voter, key, post, weight) {
    return new Promise((resolve, reject) => {
      steem.api.getActiveVotes(
        post.author,
        post.permlink,
        (err, activeVotes) => {
          if (!err) {
            if (!this.isVoted(activeVotes, voter)) {
              if (!DEBUG) {
                steem.broadcast.vote(
                  key,
                  voter,
                  post.author,
                  post.permlink,
                  weight,
                  (err, result) => {
                    if (!err) {
                      resolve(result);
                    } else {
                      reject(err);
                    }
                  }
                );
              } else {
                resolve();
              }
            } else {
              console.log(
                "Already voted on " + post.author + "/" + post.permlink
              );
            }
          } else {
            reject(err);
          }
        }
      );
    });
  }
};

module.exports = helper;
