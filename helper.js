const categories = require('./categories');

const helper = {
  generateRandomPosts(num) {
    let posts = [];
    for (let i = 0; i < num; i++) {
      posts.push({
        // let's use scores between 25 and 100, not important but seems more realistic than 1 and 100
        score: this.getRandomInt(25, 100),
        category: categories.list[this.getRandomInt(0, categories.list.length - 1)],
      });
    }
    return posts;
  },
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  getPostVoteWeight(post) {
    let min = categories.limits[post.category].min;
    let max = categories.limits[post.category].max;

    return ((max - min) * (post.score / 100)) + min;
  },
  calcRecoveryTime(decrease) {
    return decrease * 72;
  },
  calcDecreaseVP(voteWeight) {
    return 2 * voteWeight / 100;
  }
};

module.exports = helper;