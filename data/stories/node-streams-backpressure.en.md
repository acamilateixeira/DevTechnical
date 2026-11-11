# 🚰 The hose and the tiny cup

> Bia asked for a 5-million-row report over countryside 3G. The server has to send it without drowning.

## 🎭 Cast
- 🚰 **Water tank** · the database with 5 million rows · the data source
- 🪣 **Bucket** · `const rows = await db.findAll()` · loads EVERYTHING into memory before sending
- 🐍 **Hose** · a stream (`Readable` → `Transform` → `Writable`) · passes the data a little at a time
- 🥤 **Tiny cup** · the client on slow internet · drinks slowly
- 💦 **Puddle** · the internal buffer · where water piles up when nobody turns the tap off
- ✋ **Brake** · backpressure (`write()` returns `false`, the `drain` event) · turns off the tap when the cup is full
- 🔧 **Plumber** · `stream.pipeline()` · connects everything, brakes on its own, and closes everything on error

- 🧠 **Memory** · the server's RAM · bursts if everything is loaded at once
- 🧠 **Server memory** · the server's RAM · same thing, in a panic
## 🎬 Scene 1 · The bucket
**Bucket**: "Give me EVERYTHING at once and I'll build the CSV right here!" 🪣
**Water tank**: "5 million rows coming out!"
**Server memory**: "HELP, I'M GOING TO BURST!" 💥
> 🚨 Loading everything into memory takes the server down.
= 🪣 Rows in memory: 5 million at once
= 🧠 Server memory: bursting ❌
= 📤 Sent to the client: nothing yet

## 🎬 Scene 2 · The hose with no brake
**Hose**: "Leave it to me: row by row, from the database to CSV, from CSV to Bia."
**Tiny cup** 🐢: "Easy, people… I drink slowly…"
**Water tank**: "DON'T CARE, I KEEP GUSHING!" 🚿
**Puddle**: "It's all piling up in me… 💦💦💦" _(memory rises again)_
= 🐍 Flow: database → CSV → client, row by row
= 💦 Buffer: growing (nobody brakes)
= 🧠 Memory: ~131 MB and rising ❌

## 🎬 Scene 3 · With a brake
**Tiny cup**: "I'm full!" _(`write()` returned `false`)_
**Brake**: "TURN THE TAP DOWN!" ✋
**Tiny cup**: "Okay, drank it." _(the `drain` event)_
**Brake**: "You can open it again."
**Plumber**: "And if Bia closes the browser halfway, I shut every pipe myself, no leaks." 🔧
**Memory**: "Now it's steady as a rock." 😌
= ✋ `write()`: returned `false` → producer pauses
= 🔁 `drain` event: producer resumes
= 🧠 Memory: ~71 MB, steady ✅
= 🔧 Client disconnected: `pipeline` closes everything, no leak

## 💻 Translating to code
```js
import { pipeline } from 'node:stream/promises';

app.get('/export.csv', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  await pipeline(                       // 🔧 brakes on its own and propagates errors
    db.streamQuery('SELECT * FROM trips'), // 🚰 reads a bit at a time
    toCsv(),                            // 🐍 transforms row by row
    res,                                // 🥤 the client
  );
});
```

| Approach | Memory with 5 million rows |
| --- | --- |
| Bucket (`findAll`) | Grows until it bursts |
| Stream without backpressure | Grows in the buffer |
| `pipeline` | Stable |

Node lab 03 shows it: 131 MB with no brake vs 71 MB with `pipeline`.

## 🎤 For the interview
"With streams I process data in chunks, without loading everything into memory. Backpressure is the slow consumer braking the fast producer: `write()` returns `false` and the producer waits for `drain`. `stream.pipeline` does this on its own and also propagates errors and closes everything if the client disconnects."
