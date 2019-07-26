const axios = require("axios");
const mysql = require("mysql");
require("dotenv").config({ path: __dirname + "/.env" });

const database = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const QUERY_BOUNTIES =
  "SELECT * FROM bounties WHERE claimedAt IS NULL ORDER BY createdAt ASC";
const UPDATE_BOUNTY = "UPDATE bounties SET balance = ? WHERE id = ?";

database.query(QUERY_BOUNTIES, (error, bounties) => {
  if (error) {
    console.log(error);
  } else {
    bounties.forEach(bounty => {
      const amountRequests = [];
      [
        "btcAddress",
        "ltcAddress",
        "ethAddress",
        "xmrAddress",
        "steemAddress"
      ].forEach(type => {
        amountRequests.push(
          axios
            .get("https://blocktrades.us/api/v2/transactions/", {
              params: {
                inputAddress: bounty[type],
                sessionToken: bounty.sessionToken,
                lastModifiedSince: bounty.createdAt
              }
            })
            .then(response => {
              const transactions = response.data.filter(
                tx => tx.inputAddress === bounty[type]
              );
              let totalAmount = 0;
              transactions.forEach(tx => {
                totalAmount += Number(tx.outputAmount);
              });
              return totalAmount;
            })
            .catch(e => console.log(e.response.data.error))
        );
      });

      Promise.all(amountRequests).then(amounts => {
        const totalAmount = amounts.reduce((total, amount) => {
          return total + amount;
        }, 0);
        database.query(UPDATE_BOUNTY, [totalAmount, bounty.id], error => {
          if (error) {
            console.log(error);
          } else {
            process.exit();
          }
        });
      });
    });
  }
});
