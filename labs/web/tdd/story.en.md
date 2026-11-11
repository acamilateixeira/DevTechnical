**PO**: "New rule: a manager can only approve a trip that fits the budget AND their limit."

**Rushed dev**: "I'll start coding!" ⌨️

**Test** (jumping in front): "WAIT! In TDD **I'm born first**!" ✋

**Test 1**: "Given cost 500, budget 1000, and limit 800, I expect `ok: true`." *(runs)* 🔴 **RED**: "the function doesn't even exist!"

**Dev**: "I'll do the MINIMUM to pass." 🟢 **GREEN**

**Test 2**: "Cost 1200 with a 1000 budget? I expect `SEM_ORCAMENTO`." 🔴

**Dev**: "I'll add that `if`." 🟢

**Test 3**: "Cost exactly equal to the limit: approve or not?"

**Dev**: "…I don't know."

**Test 3**: "THEN ASK THE PO!" 🗣️

**PO**: "Equal to the limit is allowed."

**Test 3**: "Then I'll stay here forever documenting that." 📜 🟢

**Refactor** 🧹: "Now that everything is green, I can improve names and structure. If I break something, the tests will shout."

**Dev, months later**, accidentally changing `>` to `>=`: …

**Test 3**: 🔴 "HEY! THE PO SAID AT THE LIMIT IS FINE!" 🚨

**🧠 Interview takeaway**

"TDD is **red → green → refactor**: I write the test for the next behavior, watch it fail, do the minimum to pass, and improve with the tests protecting me. Edge cases become living documentation of the rule agreed with the PO."
