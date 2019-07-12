const steem = require("steem");
const helper = require("./helper");
require("dotenv").config({ path: __dirname + "/.env" });

const database = helper.getDatabase();
const pendingPRs = database.filter(pr => pr.rewards === null);

const requests = [];
pendingPRs.forEach(pr => {
  requests.push(
    new Promise(resolve => {
      // resolve in any case
      steem.api.getContent(pr.steemUser, pr.permlink, (err, result) => {
        if (!err) {
          if (result.last_payout === "1970-01-01T00:00:00") {
            // not payed out yet
            // total payout - 25% curator rewards (* 0.75)
            let pendingRewards = result.pending_payout_value.split(" ")[0];
            pendingRewards = parseFloat(result.pending_payout_value) * 0.75;
            pr.pendingRewards = pendingRewards.toFixed(3) + " SBD";
          } else {
            // payed out, curator rewards are already substracted
            pr.rewards = result.total_payout_value;
            pr.pendingRewards = null;
          }
        }
        resolve();
      });
    })
  );
});

Promise.all(requests).then(() => {
  helper.updateDatabase(database);
});
