**Client**: "I want 50 trips, each with the name of who requested it." 📋

**`trips` resolver**: "SELECT the 50 trips. Done!" *(1 query)*

**`requester` resolver** (running ONCE PER TRIP): "Trip 1? Fetch user 1 from the database. Trip 2? Fetch user 2. Trip 3? Fetch user 3…" 🏃🏃🏃

**Database**: "51 QUERIES?! And half are for the same user! 😵" **← N+1**

**Now with DataLoader (the smart waiter):**

**DataLoader** 🧑‍🍳: "I won't go to the kitchen for every order. I'll **write down** every order at the table right now…"

**Resolvers**: "User 1! User 2! User 1! User 3! User 2!…"

**DataLoader**: "Noted. Removed duplicates: users 1, 2, 3… 10. Now ONE trip to the kitchen: `WHERE id IN (1..10)`." *(it waits for the end of the tick with a **microtask**, just like in the event loop lab!)*

**Database**: "2 queries total. 🙏"

**DataLoader**: "And I serve each dish **in the order you asked**, otherwise user 1 gets user 2's name." 🍽️

**DataLoader** (about itself): "Oh, and I'm born and die **with each request**: if I were one for the whole server, I'd cache one user's data and show it to another."

**🧠 Interview takeaway**

"In GraphQL each field has a resolver; in a list, the resolver runs once per item and causes N+1 queries. **DataLoader** batches the `load(id)` calls from the same tick into one `IN` query, returns results in request order, and is created per request."
