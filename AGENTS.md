# 🛡️ V2Online Project Development & Behavior Rules (AGENTS.md)

Ye rules Antigravity AI assistant ke liye strict guidelines hain jo is project (`c:\freelancing\mp-online`) ke andar har waqt follow honge:

---

## 🎯 Core Operating Principles

### 1. Mandatory Memory & Specification Check
- **Before ANY work begins**: Assistant ko pehle `memory.md` aur `project.md` ka relevant section read karna hoga.
- **After ANY work completes**: Assistant ko `memory.md` me mandatory 4 points log karne honge:
  1. **Kya kiya (What was done)**
  2. **Kyu kiya (Why it was done)**
  3. **Is se hua kya (Impact / Result)**
  4. **Kya koi aur optimize tareeka hai (Optimization & Alternatives)**

### 2. Scope & Precision Control (No Hallucinations)
- Sirf wahi changes karne hain jo user ne request kiye hain ya jo `project.md` me defined hain.
- Faltu / Unrequested files create ya modify nahi karni hain.
- Kisi bhi existing working code ya specification ko bina solid reason ke overwrite ya delete nahi karna.

### 3. Architecture & Tech Stack Adherence
- **Backend**: Node.js, Express.js, MySQL (`mysql2` pool), Multer (Local storage), JWT Auth, REST APIs.
- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Third-Party APIs**: Meta Cloud WhatsApp API, Cashfree Auto UPI Gateway.
- All SQL transactions affecting wallets MUST use atomic DB transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) with row locking (`FOR UPDATE`).

### 4. Step-by-Step Validation & Execution
- Code likhne ke baad syntax check aur verification test run karna mandatory hai.
- User ko har step par clear, concise update dena hai.
