# 🌳 The code's family tree

> On Monday you branched off main for a feature. Today is Friday. Main moved 20 commits without you.

## 🎭 Cast
- 🌳 **Main** · the main branch · the official line, what goes to production
- 🌿 **Twig** · your feature branch · branched off main and fell behind
- 🤝 **Joiner** · `git merge` · joins both and records "this is where they met"; history stays as it happened
- ✂️ **Replanter** · `git rebase` · takes your commits and replants them on top of today's main, in a straight line
- ⚔️ **Fight** · a conflict · you and Bia changed the SAME line
- 🚑 **Paramedic** · hotfix · branches from the version IN PRODUCTION to fix something urgent
- ↩️ **Polite undoer** · `git revert` · creates a new commit that undoes, without erasing history
- 😈 **Bulldozer** · `git push --force` on main · runs over everyone else's work

- 👩‍💻 **Rushed dev** · you · want your version to win
- 👩 **Bia** · the coworker who changed the same line
- 🧙 **Git** · Git itself · gives the advice
- 🔥 **Production** · what is live
- 👥 **Whole team** · everyone in chorus
## 🎬 Scene 1 · Updating the twig
**Twig**: "Main moved 20 commits and I fell behind…" 🌿
**Joiner**: "I'll join you two and record the meeting. Everything stays as it was, forks included." 🤝
**Replanter**: "I'll take your commits and replant them on top of today's main, as if you'd started now. Nice and straight." ✂️
**Replanter** _(whispering)_: "But I rewrite history, so only use me on YOUR twig, which nobody else uses."

## 🎬 Scene 2 · The fight
**Fight**: "You and Bia changed the same line. Who wins?" ⚔️
**Rushed dev**: "Mine, obviously!"
**Git**: "Easy, girl! Read what Bia meant to do, talk to her, combine both intentions, and run the tests." 🗣️
**Bia**: "Thanks for not deleting my work again." 😒

## 🎬 Scene 3 · Something's on fire
**Production**: "URGENT BUG IN CHECKOUT!" 🔥
**Paramedic**: "I branch from the version IN PRODUCTION, not from develop, which has untested stuff. I fix it, ship it, and then bring the fix back to develop." 🚑
**Bulldozer**: "Can I `--force` main to clean up the history?" 😈
**Whole team**: "NOOOO!"
**Polite undoer**: "On a shared branch, I do the undoing: a new commit that cancels the other, without erasing anyone's work." ↩️

## 💻 Translating to code
```bash
# 🤝 merge: preserves history
git switch feature/checkout && git merge main

# ✂️ rebase: linear history (only on YOUR branch)
git switch feature/checkout && git rebase main
git push --force-with-lease          # never --force, never on main

# ⚔️ conflict
git status                            # see the conflicting files
# edit, combine both intentions, run the tests
git add . && git rebase --continue

# 🚑 hotfix from what's in production
git switch -c hotfix/checkout v2.4.1
# ...fix, PR, tag v2.4.2, then merge back into develop/main

# ↩️ undo on a shared branch
git revert a1b2c3d
```

| | Merge | Rebase |
| --- | --- | --- |
| History | As it happened (with forks) | Linear |
| Rewrites commits? | No | Yes |
| Where to use | Shared branches | Only your own branch |

## 🎤 For the interview
"Merge preserves history; rebase makes it linear but rewrites it, so I only use it on my own branch, with `--force-with-lease`. I resolve conflicts by understanding both changes' intent, talking to whoever made the other change, and running the tests. A hotfix branches from the production version and goes back to the development line. On shared branches I use `revert`; `reset` only locally."
