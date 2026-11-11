**Database** 🚰 (with 5 million rows): "I'll send everything!"

**Without streams**: "Give me EVERYTHING at once and I'll build the CSV in memory." 🪣

**Server memory**: "5 MILLION ROWS?! I'M GOING TO BURST!" 💥

**With streams (the hose)**: "No. The water flows bit by bit: row by row from the database → becomes CSV → goes to the user."

**Client on slow internet** 🐢: "Easy… I drink slowly…"

**Database without backpressure**: "DON'T CARE, I KEEP GUSHING!" 🚿

**Buffer in the middle**: "It's all piling up in me… 💦💦💦" *(memory climbs)*

**With backpressure (`pipeline`)**: "Slow client? `write()` returned `false`: TURN THE TAP DOWN. When it drinks (`drain`), open it again." 🚰✋

**Memory**: "Now it's stable." 😌

**🧠 Interview takeaway**

"With streams I process data in chunks without loading it all into memory. Backpressure is the slow consumer throttling the fast producer; `stream.pipeline` does it automatically and also propagates errors and closes everything if the client disconnects. See Node lab 03."
