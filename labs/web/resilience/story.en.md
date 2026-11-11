# 🐌 The slow cousin who makes the whole family late

> The API fetches credit offers from three partner banks. Two are speedy. The third one… is Beta.

## 🎭 Cast
- 🖥️ **API** · `Promise.allSettled([...])` · asks all three at once and builds the response
- ⚡ **Alpha** · fast provider · answers in 100ms
- ⚡ **Gamma** · fast provider · answers in 150ms
- 🐌 **Beta** · slow, flaky provider · takes seconds and sometimes returns a 500 error
- ⏱️ **Stopwatch** · `TIMEOUT_MS = 400` · the longest the API waits for each one
- 🔌 **Circuit breaker** · `CircuitBreaker` · after consecutive failures, stops calling Beta for a while
- 👩 **Bia** · the user · watching the screen load

## 🎬 Scene 1 · Waiting for everyone
**API**: "Let's get offers! I called all three at once." 📞📞📞
**Alpha**: "Here you go, 100ms!" ⚡
**Gamma**: "Here you go, 150ms!" ⚡
**Beta**: "Hmmm… let me see… hold on, looking for my glasses… 3 seconds… and… error 500." 🐌💥
**Bia**: "THREE SECONDS FOR THIS?! I'm going to the competition!" 😤
> 🚨 The screen is only as fast as the slowest one in the group.

## 🎬 Scene 2 · With a stopwatch
**Stopwatch**: "Each of you gets 400ms. After that, we move on without you."
**Beta**: "But I was about to—"
**Stopwatch**: "TIME! ⏱️"
**API**: "I'll answer with Alpha and Gamma and say Beta didn't make it." ✂️
**Bia**: "Two offers in half a second? Works for me."

## 🎬 Scene 3 · With a circuit breaker
**Circuit breaker**: "Beta failed twice in a row? TRIPPED. For 1.5 s nobody calls Beta: I answer 'unavailable' right away, without spending the 400ms." 🔌
**Bia**: "It's fast again!" ⚡
**Circuit breaker** _(1.5 s later, suspicious)_: "I'll let ONE test call through to Beta…"
**Beta**: "I'm back! Offer in 120ms, good as new!"
**Circuit breaker**: "Fine, you're forgiven. Back on." ✅

## 💻 Translating to code
```js
const comTimeout = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw new Error('timeout'); })]);

const resultados = await Promise.allSettled([                 // 📞 all three at once
  comTimeout(alpha(), TIMEOUT_MS),
  comTimeout(gamma(), TIMEOUT_MS),
  breakerBeta.chamar(() => comTimeout(beta(), TIMEOUT_MS)),   // 🔌 open? fail immediately
]);
const ofertas = resultados.filter((r) => r.status === 'fulfilled'); // ✂️ partial response
```

| Breaker state | What happens |
| --- | --- |
| Closed | Calls normally and counts failures |
| Open | Doesn't call; fails immediately |
| Half-open | Lets 1 test call through; closes if it works |

Retry only idempotent operations, with backoff and jitter, or you become the stampede on a provider that's already struggling.

## 🎤 For the interview
"One slow dependency can't take everything down. I call dependencies in parallel with a timeout per dependency, return a partial response when it makes sense, retry only idempotent operations with exponential backoff and jitter, and use a circuit breaker to stop calling whatever is failing and test its recovery gradually (half-open)."
