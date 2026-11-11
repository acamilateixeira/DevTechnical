**Redis** (the cache): "I keep product 42 for 5 seconds (TTL). Whoever asks, I answer instantly." ⚡

**Database**: "And I relax, because Redis spares me." 😌

**Clock**: "⏰ 5 seconds. Product 42 EXPIRED in Redis."

**50 users** (arriving TOGETHER): "I WANT PRODUCT 42!"

**Redis**: "I don't have it anymore! Go get it from the database!"

**50 users** (rushing to the database at once): "DATABASE! DATABASE! DATABASE!…" 🐃🐃🐃🐃

**Database**: "50 IDENTICAL QUERIES AT THE SAME TIME?! 😵" **← cache stampede**

**Now with single-flight:**

**User 1**: "Not in the cache. I'll go fetch it from the database." 🏃

**User 2**: "Not there for me either… but is someone already fetching it?"

**Single-flight**: "Yes, User 1. **Wait for that same fetch**, don't start another." 🤝

**Users 2 to 50**: "Fine, we'll wait together." ⏳

**Database**: "Just 1 query. That I can handle." 😌

**User 1**: "I'm back! I stored it in Redis for 5 s **plus a little random bit** (jitter), so many keys don't expire in the same second." 🎲

**🧠 Interview takeaway**

"Cache-aside: check the cache; if it's missing, load from the database and store it with a TTL. When a popular key expires, everyone hits the database at once (stampede). I prevent it by letting only one recompute (single-flight/lock), with TTL jitter and early refresh."
