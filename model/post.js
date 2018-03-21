const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  abs_rshares: {
    type: Number,
  },
  active: {
    type: String,
  },
  active_votes: {
    type: Array,
  },
  allow_curation_rewards: {
    type: Boolean,
  },
  allow_replies: {
    type: Boolean,
  },
  allow_votes: {
    type: Boolean,
  },
  author: {
    type: String,
  },
  author_reputation: {
    type: Number,
  },
  author_rewards: {
    type: Number,
  },
  beneficiaries: {
    type: Array,
  },
  body: {
    type: String,
  },
  body_length: {
    type: Number,
  },
  cashout_time: {
    type: String,
  },
  category: {
    type: String,
  },
  children: {
    type: Number,
  },
  children_abs_rshares: {
    type: Number,
  },
  created: {
    type: String,
  },
  curator_payout_value: {
    type: String,
  },
  depth: {
    type: Number,
  },
  id: {
    type: Number,
  },
  json_metadata: {
    type: Object,
  },
  last_payout: {
    type: String,
  },
  last_update: {
    type: String,
  },
  max_accepted_payout: {
    type: String,
  },
  max_cashout_time: {
    type: String,
  },
  net_rshares: {
    type: Number,
  },
  net_votes: {
    type: Number,
  },
  parent_author: {
    type: String,
  },
  parent_permlink: {
    type: String,
  },
  pending_payout_value: {
    type: String,
  },
  percent_steem_dollars: {
    type: Number,
  },
  permlink: {
    type: String,
  },
  promoted : {
    type: String,
  },
  reblogged_by: {
    type: Array,
  },
  replies: {
    type: Array,
  },
  reward_weight: {
    type: Number,
  },
  root_comment: {
    type: Number,
  },
  root_title: {
    type: String,
  },
  title: {
    type: String,
  },
  total_payout_value: {
    type: String,
  },
  total_pending_payout_value: {
    type: String,
  },
  total_vote_weight: {
    type: Number,
  },
  url: {
    type: String,
  },
  vote_rshares: {
    type: Number,
  },
  reviewed: {
    type: Boolean,
  },
  flagged: {
    type: Boolean,
  },
  pending: {
    type: Boolean,
  },
  reserved: {
    type: Boolean,
    default: false,
  },
  moderator: {
    type: String,
  },
});

PostSchema.index(
  {
    "body": "text",
    "title": "text"
  },
  {
    "weights": {
      "body": 2,
      "title": 5
    }
  }
);

PostSchema.index({
  'author': 1,
  'permlink': 1,
}, {
  unique: true,
});

module.exports = PostSchema;