# 🚚 Deploy on Friday? Sure, if it's like this

> The dev opened a PR with a checkout change. Between the PR and the customer there's a whole assembly line.

## 🎭 Cast
- 👩‍💻 **Dev** · opened the PR · dying to see it live
- 🤖 **Belt inspector** · CI (GitHub Actions) · runs lint, types, tests, build, and scans on every PR
- 👀 **Reviewer** · code review · another pair of eyes
- 📀 **Sealed box** · an immutable Docker image tagged with the commit · the SAME one goes to staging and production
- 🗄️ **Polite migration** · a compatible migration (expand/contract) · works with the old and new versions at the same time
- 🎚️ **Switch** · feature flag · the code is in production, but turned off
- 🐤 **Canary** · canary release · the new version getting only 5% of traffic
- ⏪ **Back button** · automatic rollback · returns to the previous version if a metric gets worse
- 📊 **Report card** · DORA metrics · shows whether the team is improving

- 🏭 **Pipeline** · the whole pipeline (CI + CD) · the assembly line from PR to production
## 🎬 Scene 1 · The assembly line
**Dev**: "PR opened!"
**Belt inspector**: "Lint ✅, types ✅, tests ✅, build ✅, checked for leaked passwords ✅, vulnerable dependencies ✅. Ready for review." 🤖
**Reviewer**: "Approved, but please rename that `x2` variable, for heaven's sake." 👀
**Sealed box**: "I was built ONCE, labeled with the commit. The same box goes to staging and then to production. No rebuilding along the way." 📀
= 🤖 CI: lint ✅ · types ✅ · tests ✅ · build ✅ · scans ✅
= 📀 Image: `app:3f9c2e1` (tag = commit)
= 🌍 Where it is: staging

## 🎬 Scene 2 · Going live without a scare
**Polite migration**: "I'm compatible with the old and new versions, because during the deploy both run together." 🗄️
**Switch**: "The new code is there, but OFF. I turn it on for 1% of users first." 🎚️
**Canary**: "I'm the new version taking 5% of traffic. If the error rate goes up…" 🐤
**Back button**: "…I go back to the previous version on my own, in seconds." ⏪
= 🗄️ Migration: expand: new optional column, the old one stays
= 🎚️ Feature flag: on for 1%
= 🐤 Canary: 5% of traffic on the new version
= ⏪ Automatic rollback: if errors go above 1%

## 🎬 Scene 3 · The forbidden question
**Dev**: "So can I deploy on Friday at 5 p.m.?" 😏
**Pipeline**: "With a small deploy, a switch, a canary, and a tested back button… yes. The fear comes from huge deploys with no way back."
**Report card**: "And I track whether you're improving: how often you ship, how long from commit to live, how many changes cause problems, and how long it takes to fix them." 📊
= 📊 Deploy frequency: several times a day
= ⏱️ Lead time: hours
= 💥 Change failure rate: low (small deploys)
= ♻️ Time to restore: minutes (rollback)

## 💻 Translating to code
```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  ci:                                      # 🤖
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint && npm run typecheck && npm test
      - run: docker build -t app:${{ github.sha }} .   # 📀 tag = commit
```
```ts
if (flags.isEnabled('new-checkout', { userId })) return newCheckout(); // 🎚️
```

| DORA metric | Question |
| --- | --- |
| Deployment frequency | How often do we ship? |
| Lead time | How long from commit to production? |
| Change failure rate | How many deploys cause problems? |
| Time to restore | How long to get back to normal? |

## 🎤 For the interview
"Fast CI on every PR with lint, types, tests, build, and scans; an immutable image promoted across environments; migrations compatible via expand/contract; feature flags separating deploy from release; and a canary with automatic metric-based rollback. Fearless deploys mean shrinking the blast radius and the recovery time, measured with DORA metrics."
