# 🔍 DEBUG: Why Matrix Questions Aren't Being Asked

## What to Do:

1. **Open Browser Console** (F12)
2. **Click "Test in Browser"** in campaign wizard
3. **Look for this output:**

```
🏗️ Building agent with campaign config...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CAMPAIGN DATA RECEIVED:
  Name: [your campaign name]
  Matrices Count: [number]
  Targets Count: [number]

📝 YOUR MATRICES:
  1. [Matrix name]
     Call Script: "[your script here]"
  2. [Matrix name]
     Call Script: "[your script here]"

🎯 YOUR TARGETS:
  1. [Target name] (boolean): [description]

🏢 JOB DATA:
  Company: [company]
  Title: [job title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 COMPLETE PROMPT BEING SENT TO RETELL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full prompt here - CHECK IF YOUR QUESTIONS ARE IN IT!]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ Check These:

### If "Matrices Count: 0":
→ Matrices aren't being passed from wizard
→ Check if you're in Step 3 and added matrices

### If Matrices show but NOT in prompt:
→ callScript field is empty
→ Check you filled in the "Call Script" field in matrix

### If Prompt shows questions but AI doesn't ask them:
→ LLM is ignoring the prompt
→ Need to check LLM configuration in Retell

---

## 🎯 Expected Output:

**The prompt SHOULD include:**

```
## REQUIRED QUESTIONS - YOU MUST ASK ALL OF THESE:

### Standard Questions:
1. Are you currently available for work?
2. Are you interested in the Site Engineer position?
3. Do you know anyone currently working at Barrows & Sons?

### Campaign-Specific Questions (MUST ASK):
4. [YOUR MATRIX QUESTION 1]
5. [YOUR MATRIX QUESTION 2]
6. [YOUR MATRIX QUESTION 3]
```

**If your questions are in the prompt but AI still doesn't ask them:**
→ The LLM model needs to be configured differently in Retell

---

## 📋 Action Items:

1. **Test and copy console output**
2. **Check if matrices are in the prompt**
3. **Send me the console output**
4. **I'll diagnose the exact issue**

---

**Do the test and tell me:**
- How many matrices show?
- Are they in the prompt?
- What does the prompt say?

