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

Wait List = 100

**The bot has voted on a post. There are now only 99 (while desired value X is 100) on the wait list. So the bot will wait for another post to get approved. What if there's no new approved post for over 24h?**

- the voting power triggers the max value (let's say 99.9 %) maybe 15 times (without reaching 100 %!): forces 15 votes, 84 posts left.
- 10 post reach the maximum date: forces 10 votes, 74 left "less competition"
- the voting weights have automatically increased by 26 % by now... 
- slowing the bot down for to let the wait list fill up.
- 26 % heigher votes = 26 % more often the minimum VP is reached
- and votes take 26 % longer to recover in general

**The bot is voting as expected because there are constantly over 100 posts in the wait list. What if posts get more and more, pile up to 200 in the wait list and the bot can't keep up?**

- 101/100 posts already means the next upvote will be decreased by 1%, recovery of VP will be 1% faster, next post can be upvoted 1% earlier.
- 120/100: next vote -20 %, etc...
- 200/100 means 100% more posts than desired, vote weight will be reduced by 100% (global min weight of 1% will be used, category based limits could also be used or new ones added for that scenario).
- To reach 200/100 a dramatic sudden increase in approved posts would be necessary, so that the gradual decrease of voting weights (from 100 % all the way down to 1 %) is not fast enough. Hopefully quite unlikely, the larger we set the desired wait list (maybe 500) the more unlikely.
- There's also an amplifier mechanic to speed up or slow down the adjustment if necessary.

# Adjusting / Fine-Tuning

- length of wait list
- min/max voting power
- min/max global weights 
- min/max category weights
- voting weight adjustment amplifier
- vote interval
- automatically set base values based on statistics (not implemented)

# Bot live status on platform frontend:

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
