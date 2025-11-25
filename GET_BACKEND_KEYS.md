# 🔑 Get the CORRECT Backend Keys

## ⚠️ You're Looking at the WRONG Project!

The screenshot shows keys from **frontend** project (`jtdqqbswhhrrhckyuicp`).

You need keys from **BACKEND** project (`xnscpftqbfmrobqhbbqu`).

---

## 📝 Step-by-Step: Get Backend Keys

### 1. Go to Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Find the BACKEND Project
Look for project with reference: **`xnscpftqbfmrobqhbbqu`**

**NOT** `jtdqqbswhhrrhckyuicp` (that's frontend)

### 3. Open Backend Project
Click on the **`xnscpftqbfmrobqhbbqu`** project

### 4. Go to Settings → API

### 5. Copy the Anon Key
Under "Project API keys" → Copy the **anon** (public) key

**It should decode to contain:** `"ref":"xnscpftqbfmrobqhbbqu"`  
**NOT:** `"ref":"jtdqqbswhhrrhckyuicp"`

### 6. Add to .env
```bash
VITE_BACKEND_SUPABASE_ANON_KEY=eyJ...the_backend_anon_key...
```

### 7. Restart
```bash
npm run dev
```

---

## 🔍 How to Verify You Have the Right Key

### Frontend Key (You already have this):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZHFxYnN3aGhycmhja3l1aWNwIi...
                                                                          ^^^^^^^^^^^^^^^^^^^
                                                                          jtdqqbswhhrrhckyuicp (frontend)
```

### Backend Key (What you need):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuc2NwZnRxYmZtcm9icWhiYnF1Ii...
                                                                          ^^^^^^^^^^^^^^^^^^^
                                                                          xnscpftqbfmrobqhbbqu (backend)
```

---

## 🎯 Your .env Should Have:

```bash
# Frontend Database (jtdqqbswhhrrhckyuicp)
VITE_SUPABASE_URL=https://jtdqqbswhhrrhckyuicp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...jtdqqbswhhrrhckyuicp_key...

# Backend Database (xnscpftqbfmrobqhbbqu) ← DIFFERENT!
VITE_BACKEND_SUPABASE_URL=https://xnscpftqbfmrobqhbbqu.supabase.co
VITE_BACKEND_SUPABASE_ANON_KEY=eyJ...xnscpftqbfmrobqhbbqu_key...  ← NEED THIS!
```

---

## 💡 Quick Check

The backend anon key JWT payload should contain:
```json
{
  "iss": "supabase",
  "ref": "xnscpftqbfmrobqhbbqu",  ← Must be this!
  "role": "anon"
}
```

---

**Go to dashboard, open the xnscpftqbfmrobqhbbqu project, get THAT anon key!** 🔑

