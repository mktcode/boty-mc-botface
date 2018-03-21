const mongoose = require('mongoose');
const postSchema = require('./model/post');
const helper = require('./helper');

const botKey = process.env.BOT_KEY; // TODO: use SteemConnect instead of SteemJS
const botAccountName = process.env.BOT_ACCOUNT_NAME || 'mkt';
const minimumVotingPower = process.env.BOT_MIN_VOTING_POWER || 99;
const votingWeightMultiplier = process.env.BOT_VOTING_WEIGHT_MULTIPLIER || 1;

// TODO: use API instead of direct DB access
mongoose.connect('mongodb://localhost/utopian-io');
const db = mongoose.connection;

// TODO: add verbose logs

// connect to db
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  const posts = mongoose.model('post', postSchema);

  // TODO: look ahead, look behind, adjust global voting weight multiplier

  // check voting power first
  helper.getCurrentVotingPower(botAccountName, true).then(currentVotingPower => {
    if (currentVotingPower >= minimumVotingPower) {
      // then check if there are posts to upvote
      helper.getPostsWaitingForUpvote(posts, botAccountName).then(postsWaitingForUpvote => {
        if (postsWaitingForUpvote.length) {
          const nextPostToUpvote = postsWaitingForUpvote[0];
          const voteWeight = helper.getVoteWeightForPost(nextPostToUpvote);
          helper.upvotePost(botAccountName, botKey, nextPostToUpvote, voteWeight * votingWeightMultiplier).then((result) => {
            // TODO: comment
          }).catch(err => console.log(err));
        } else {
          console.log('There are currently no posts to upvote.');
        }
      }).catch(err => console.log(err));
    } else {
      console.log('Voting Power to low: ' + currentVotingPower.toFixed(2) + '%, Waiting to reach ' + minimumVotingPower + '%');
    }
  }).catch(err => console.log(err));
});