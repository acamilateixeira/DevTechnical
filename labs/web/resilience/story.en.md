**API**: "I need credit offers. I'll ask all three providers **at the same time**." 📞📞📞

**Alpha**: "Offer in 100ms!" ⚡

**Gamma**: "Offer in 150ms!" ⚡

**Beta**: "Hmmm… let me see… hold on… 3 seconds… and… error 500." 🐌💥

**User**: "WHY DID THE SCREEN TAKE 3 SECONDS?! 😤"

**Now with a per-provider timeout:**

**API**: "Each of you gets **400ms**. Past that, I move on without you."

**Beta**: "But I was about to—"

**API**: "TIMEOUT. I answer with Alpha and Gamma and say Beta failed." **← partial response** ✂️

**Now with a circuit breaker:**

**Beta's breaker**: "Two failures in a row? **Tripped.** For the next 1.5 s nobody calls Beta: I answer 'unavailable' immediately, without spending the 400ms." 🔌

**User**: "It's fast again!" ⚡

**Breaker** (after 1.5 s): "I'll let ONE test call through to Beta… (half-open)"

**Beta**: "I'm back! Offer in 120ms!"

**Breaker**: "Reset. You can call Beta normally." ✅

**🧠 Interview takeaway**

"One slow dependency must not take everything down. I call in parallel with a **per-dependency timeout**, return a **partial response**, retry only idempotent operations with backoff and jitter, and use a **circuit breaker** to stop calling whoever keeps failing."
