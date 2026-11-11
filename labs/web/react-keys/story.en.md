**Ana, Bruno, and Carla** sit in chairs 0, 1, and 2. Each has a notebook (the `<input>`) with notes.

**React**: "To know who's who, everyone wears a **badge** (the `key`)."

**With `key={index}`** the badges are the **chair number**: "chair 0", "chair 1", "chair 2".

**Ana** (chair 0): "I wrote 'hi' in my notebook!"

**Davi** arrives and sits in **chair 0**, pushing everyone one chair down.

**React**: "Badge 'chair 0' still exists, so the notebook with 'hi' stays in chair 0… which now belongs to Davi!" 😬

**Davi**: "Hey, who wrote 'hi' in MY notebook?!"

**Ana**: "IT WAS MINE! 😭"

**Now with `key={item.id}`** the badges have **names**: "Ana", "Bruno", "Carla".

**Davi** arrives and sits in chair 0.

**React**: "New badge 'Davi'? I create a new notebook for him. Badge 'Ana' changed chairs? I carry her notebook along!" ✅

**`Math.random()`** (out of nowhere): "What if I give everyone a new badge every render?"

**React**: "Then I think everyone is new and throw ALL the notebooks away every time! 🗑️"

**🧠 Interview takeaway**

"The `key` is each item's identity across renders. It must be **stable and unique**, like the record ID. With the index, inserting, removing, or reordering puts state on the wrong item."
