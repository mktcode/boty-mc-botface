const steem = require("steem");
const helper = require("./helper");
require("dotenv").config({ path: __dirname + "/.env" });

const database = helper.getDatabase();
const pendingPRs = database.filter(pr => pr.rewards === null);

pendingPRs.forEach(pr => {
  steem.api.getContent(pr.steemUser, pr.permlink, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      if (pr.last_payout === "1970-01-01T00:00:00") {
        // not payed out yet
        // total payout - 25% curator rewards (* 0.75)
        pr.pendingRewards = result.pending_payout_value * 0.75;
      } else {
        // payed out, curator rewards are already substracted
        pr.rewards = result.total_payout_value;
        pr.pendingRewards = null;
      }
    }
  });
});

helper.updateDatabase(database);
