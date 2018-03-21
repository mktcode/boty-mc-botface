# A Bot Suggestion

Prototype, concept is not mature but maybe promising...

```
// run
node index
```

```
// set interval
export BOT_INTERVAL_SECONDS=60

// number of post stubs to generate
export BOT_POST_COUNT=100
```

# Idea

- VP checked in a very short interval (1)
- bot votes next (oldest) approved and unvoted contribution once it reaches 99% VP (yes, only one!)
- waits until VP reaches 99% again, votes next one in line

VP recovery (for calculation):
   - ~20% per 24h
   - ~0.833333333% per hour
   - ~0,013888889% per minute

examples:
- post get's a 1% upvote = VP -0.02% = ~1.44 minutes recovery
- post get's a 10% upvote = VP -0.2% = ~14.4 minutes recovery
- post get's a 25% upvote = VP -0.5% = ~36 minutes recovery
- post get's a 50% upvote = VP -1% = ~72 minutes recovery

- example:
   - 100 posts (avg) to upvote per day
   - to vote all: ~14.4 minutes avg vote interval (1440 minutes per day / 100 posts)
   - to make sure all get voted: avg vote must be ~10% (see above)
   - this avg can be predicted by looking at the next 100 posts (can still be based on category min/max and quality score)
   - adjust votes using a global, permanent value
       - initial value: 1 (all vote weights * 1, therefore no adjustment)
       - predicted avg vote > or < 10% = value decreases/increases in relation to the difference between desired and actual avg vote weight
   - if the number of avg posts per day increases/decreases, all following parameters will be adjusted accordingly and automatically


# Advantages

- we never waste voting power (bot never reaches 100% as long as there's a post to vote)
- posts won't suffer low VP (~80%)
- category min/max votes can be adjusted to
    - avoid contributions piling up (lower votes)
    - slow the bot down (higher votes)
- we could display when the next vote will happen
- we could display the number in line for every post
- ...