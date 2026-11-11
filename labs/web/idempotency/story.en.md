**Client** (the app): "Server, charge R$150 to the card, please!"

**Server**: "Charged! ✅ Here's the response: 201 Created!"

**Network** (eating the response on the way): "Nom nom. 😋"

**Client** (waiting…): "No response. Must have failed. I'LL TRY AGAIN!" 🔁

**Server**: "New R$150 request? Charged again! ✅"

**Network**: "Nom nom. 😋"

**Client**: "AGAIN!"

**Server**: "Charged again! ✅"

**Customer's card**: "R$450?! I ONLY BOUGHT ONE THING! 😱"

**Now with an Idempotency-Key:**

**Client**: "Charge R$150. My order number is **abc-123**." 🎫

**Server**: "First time I see abc-123: I charge and **write the number down with the response**."

**Network**: "Nom nom. 😋"

**Client**: "Charge R$150, order **abc-123**." *(the SAME number)*

**Server**: "abc-123? Already done! I won't charge again: here's the same response I saved." 📋

**Card**: "R$150. Just right." 😌

**Too-clever client** (generating a new number on every attempt): "Order **xyz-999**!"

**Server**: "New number = new order = new charge. The key must belong to the **intent to pay**, not to the attempt!" 🤦

**🧠 Interview takeaway**

"Retries are unavoidable because the network loses responses. The client sends one **Idempotency-Key** per operation intent; the server stores the key under a unique constraint along with the response and, if it comes back, returns the saved response without executing again."
