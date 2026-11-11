**Node** (the restaurant's only waiter) 🧑‍🍳: "I'm just one, but I handle a thousand tables: I take the order, hand it to the kitchen (the OS / libuv), and serve the next table while it cooks."

**Table 1**: "I want data from the database." → **Node**: "Order placed, be right back!" 🏃

**Table 2**: "I want a file." → **Node**: "Order placed, be right back!" 🏃

**Table 3** (CPU-bound): "I want YOU to compute 10 million calculations, right here in front of me."

**Node**: "…okay." 🧮🧮🧮 *(stuck at table 3 for 1.5 s)*

**Tables 4 to 1000**: "WAITER?! WAITER?! 😤 It was just a glass of water!" **← blocked event loop**

**Worker thread** 👷: "Hand me that heavy calculation. I'll compute it in the other room and let you know when I'm done."

**Node**: "Thanks! Back to serving everyone." 😌

**🧠 Interview takeaway**

"JavaScript runs on a single thread, but I/O is handed to libuv and the OS, which is why Node handles thousands of connections. Heavy (CPU-bound) work blocks the whole event loop: I move it off the request with `worker_threads`, a queue + worker, or more processes. See Node lab 02 running."
