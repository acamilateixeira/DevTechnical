**Main** 🌳: "I'm the official line."

**Your branch** 🌿: "I left main on Monday. It's Friday and main moved 20 commits…"

**Merge** 🤝: "I join both and record a commit saying 'they joined here'. History stays as it happened."

**Rebase** ✂️: "I take your commits and **replay them on top** of the current main, as if you'd started today. Everything in a straight line."

**Rebase**: "But I rewrite history, so only use me on YOUR branch, which nobody else uses."

**Conflict** ⚔️: "You and Bia changed the SAME line. Who wins?"

**Rushed dev**: "Mine, obviously!"

**Git**: "Easy! Read what Bia meant to do, talk to her, combine both intentions, and run the tests." 🗣️

**Production** 🔥: "URGENT BUG!"

**Hotfix** 🚑: "I branch from the version **in production**, not from develop (which has untested stuff). I fix it, ship it, and then bring the fix back to develop."

**`git push --force` on main** 😈: "May I?"

**Everyone**: "NO!" (`--force-with-lease`, and only on your branch.)

**🧠 Interview takeaway**

"Merge preserves history; rebase makes it linear but rewrites it, so only on my own branch. Conflicts are resolved by understanding both changes' intent and running the tests. A hotfix branches from the production version and goes back to the development line. `revert` on shared branches, `reset` only locally."
