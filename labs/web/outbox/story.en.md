**API**: "Trip approved! Saved to the database. COMMIT! ✅ Now I'll tell RabbitMQ…"

**Server**: 💥 *(crashed before telling anyone)*

**Database**: "Trip APPROVED here."

**RabbitMQ**: "Approved? Nobody told me."

**Email service**: "Then I won't send any email."

**Requester**: "My trip was approved and nobody told me?! 😤" **← dual write**

**Now with an Outbox:**

**API**: "In the SAME transaction I save the approval **and** a little note in the outbox table: 'notify: trip approved'. Either both are saved, or neither." 📝

**Server**: 💥 *(crashed again, right after commit)*

**Relay** (another process that reads the outbox every so often): "Found an unpublished note! Publishing to RabbitMQ." 📮

**Email service**: "Got it! 📧 Email sent."

**Relay**: "Now I'll mark the note as published and—" 💥 *(crashed before marking)*

**Relay** (restarted): "Unmarked note? PUBLISHING AGAIN!" 📮

**Email service without dedupe**: "Got it again! 📧 Sent again!" *(the requester gets 2 emails)*

**Email service with dedupe**: "I already processed this message ID. Ignoring." 🛑

**🧠 Interview takeaway**

"The database and the queue don't share a transaction (dual write). With an **outbox**, I write the event in the same transaction as the data and a relay publishes it later. That gives **at-least-once**: the message may arrive twice, so the consumer must be **idempotent** (dedupe by ID)."
