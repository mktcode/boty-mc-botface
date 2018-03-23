const mongoose = require('mongoose');
const postSchema = require('./model/post');
const helper = require('./helper');

const DEBUG = process.env.BOT_DEBUG || true;

const botKey = process.env.BOT_KEY; // TODO: use SteemConnect instead of SteemJS
const botAccountName = process.env.BOT_ACCOUNT_NAME || 'mkt';

// minimum number of posts waiting for a vote - don't vote if we are below
const waitListSize = process.env.BOT_WAIT_LIST_SIZE || 100;

// also don't vote if we are below
const minimumVotingPower = process.env.BOT_MIN_VOTING_POWER || 99;

// force vote if we go above - the smaller the bot interval, the closer this can be set to 100%
// 99.93 = bot needs to run every 5 minutes, to make sure we don't reach 100%
const maximumVotingPower = process.env.BOT_MAX_VOTING_POWER || 99.93;

// force vote if next post gets older than that
// should never really happen, but could also be set to a much lower value if possible
const maxPostAgeForVotes = process.env.BOT_MAX_POST_AGE || 6 * 24; // hours

// the deviation amplifier can adjust how "strong" voting weights will be adjusted automatically,
// in relation to the deviation between the desired and the actual wait list.
const deviationAmplifier = process.env.BOT_DEVIATION_AMPLIFIER || 1;

// global weight boundaries, applied after all adjustments
const globalMinimumVoteWeight = process.env.BOT_GLOBAL_MIN_VOTE_WEIGHT || 1;
const globalMaximumVoteWeight = process.env.BOT_GLOBAL_MAX_VOTE_WEIGHT || 50;

// TODO: use API instead of direct DB access
mongoose.connect('mongodb://localhost/utopian-io');
const db = mongoose.connection;

// TODO: add more verbose logs

// So, let's connect to the db...
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  const posts = mongoose.model('post', postSchema);
  // pull some data
  Promise.all([
    helper.getCurrentVotingPower(botAccountName, true),
    helper.getPostsWaitingForUpvote(posts, botAccountName)
  ]).then(values => {
    const currentVotingPower = values[0];
    const postsWaitingForUpvote = values[1];
    const nextPostToUpvote = postsWaitingForUpvote[0];

    let castVote = false;

    // check voting power first
    if (currentVotingPower >= minimumVotingPower) {
      // then check if there are enough posts waiting, to make some calculations based on them
      if (postsWaitingForUpvote.length >= waitListSize) {
        castVote = true;
      } else {
        console.log('Not enough posts waiting for an upvote. (' + nextPostToUpvote.length + '/' + waitListSize + ')');

        // force vote if next post gets too old
        // TODO: maybe this should even overrule minimum voting power... ?
        if (new Date(nextPostToUpvote.created).getTime() < (new Date()).getTime() - (maxPostAgeForVotes * 60 * 60 * 1000)) {
          console.log('Force vote because post gets to old. (' + nextPostToUpvote.created + ')');
          castVote = true;
        } else {
          // force vote if voting power gets to high
          if (currentVotingPower >= maximumVotingPower) {
            console.log('Force vote because Voting Power gets to high. (' + currentVotingPower + '/' + maximumVotingPower + ')');
            castVote = true;
          } else {
            console.log('No post to upvote. No reason to force.');
          }
        }
      }
    } else {
      console.log('Voting Power to low: ' + currentVotingPower.toFixed(2) + '%, Waiting to reach ' + minimumVotingPower + '%');
    }

    if (castVote) {
      // increase/decrease votes by the deviation percentage of desired and actual wait list size
      let votingWeightMultiplier = 1;
      let waitListSizeDeviation = (Math.abs(waitListSize - postsWaitingForUpvote.length) / waitListSize); // percentage
      if (postsWaitingForUpvote.length > waitListSize) {
        // decrease voting power to vote faster if posts pile up
        votingWeightMultiplier -= (waitListSizeDeviation * deviationAmplifier);
      } else {
        // increase voting power to vote slower if posts become less
        votingWeightMultiplier += (waitListSizeDeviation * deviationAmplifier);
      }

      // get vote weight based on category's min and max, review score and global min and max
      let voteWeight = helper.getVoteWeightForPost(nextPostToUpvote) * votingWeightMultiplier;
      if (voteWeight < globalMinimumVoteWeight) voteWeight = globalMinimumVoteWeight;
      if (voteWeight > globalMaximumVoteWeight) voteWeight = globalMaximumVoteWeight;

      console.log('Voting on https://utopian.io/utopian-io/@' + nextPostToUpvote.author + '/' + nextPostToUpvote.permlink);
      console.log('At ' + currentVotingPower + '% Voting Power and ' + voteWeight + ' Voting Weight');
      helper.upvotePost(botAccountName, botKey, nextPostToUpvote, voteWeight * 100).then(() => {
        if (!DEBUG) {
          // TODO: post comment
        }
      }).catch(err => console.log(err));
    }
  }).catch(err => console.log(err));
});