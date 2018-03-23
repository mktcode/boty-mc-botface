# A Bot Suggestion

(Prototype)

```
// run
node bot
```

# Concept

- Bot upvotes one post at a time / per run. First in first out.
- Bot waits until X posts have piled up (intended Wait List).
- Bot votes as long as X posts are on the Wait List and Voting Power is above the minimum.
- Exceptions:
    - Next post in line reaches a specific age: Vote will be forced.
    - Voting Power reaches a specific value, slightly below 100 % (depending on bot interval): Vote will be forced.
- Voting Weight:
    - Calculated based on min and max values per category, review score and global min and max values.
    - If contributions pile up or get less, the bot speeds up or slows down with them by lowering or increasing the weights.
    - Weight gets multiplied by the percentage of deviation: Actual number of posts waiting in line and desired number X.
- Can be fine-tuned to the specific situation.

# Scenarios

The bot has voted on a post. There are now only 99 on the wait list. 
What if there's no new approved post for over 24h?

- the voting power triggers the max value maybe 15 times (without reaching 100 %!): forces 15 votes, 85 posts left.
- 10 post reach the maximum date: forces 10 votes, 75 left "less competition"
- the voting weights have automatically increased by 25 % by now... 
- slowing the bot down for to let the wait list fill up.
- 25 % heigher votes = 25 % more often the minimum VP is reached
- and votes take 20 % longer to recover in general

# Bot status on platform frontend:

- 103 Posts waiting in line.
- 36 other contributions before yours will be upvoted. Est. time: 8 hours
- Bot is alright! Rewards are increased by 23 %.
- Bot is overheated! Rewards are reduced by 15 %.

# Notes

## VP recovery:
 
- ~20 % per 24h
- ~0.833333333 % per hour
- ~0,013888889 % per minute

### Examples:
 
At 100 % VP:
- post get's a 1 % upvote = VP -0.02 % = ~1.44 minutes recovery
- post get's a 10 % upvote = VP -0.2 % = ~14.4 minutes recovery
- post get's a 25 % upvote = VP -0.5 % = ~36 minutes recovery
- post get's a 50 % upvote = VP -1 % = ~72 minutes recovery

At 50 % VP:
- post get's a 1 % upvote = VP -0.01 % = ~0.72 minutes recovery
- post get's a 10 % upvote = VP -0.1 % = ~7.2 minutes recovery
- post get's a 25 % upvote = VP -0.25 % = ~18 minutes recovery
- post get's a 50 % upvote = VP -0.5 % = ~36 minutes recovery