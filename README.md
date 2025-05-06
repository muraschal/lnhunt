# ⚡ lnhunt

**An Interactive Bitcoin Lightning Experience for Education, Events, and Communities**

---

## ✨ Overview

**lnhunt** is a gamified learning app built on the Vercel Fullstack (Next.js + Serverless). It enables users to explore Bitcoin and Lightning through a location-based or digital scavenger hunt. Each quiz station is unlocked via a Lightning payment using LNURL-Pay.

Correct answers reveal keywords. When combined, these form a predefined sentence or phrase – often drawn from Bitcoin history, but fully customizable.

---

## 🎯 Learning Goals

- Real-world interaction with the Lightning Network (QR codes, LNURL, fees, wallets)
- Reinforcement of key concepts (e.g. time preference, money history, protocol design)
- Physical activation and team collaboration
- Gamified knowledge transfer with emotional anchoring
- **Encourages exploration and real-world interaction by requiring players to find physical codes at physical locations.**

---

## 🧠 Game Mechanics

- Multiple quiz stations, each with a unique question
- Two-step access process:
  1. Enter the correct physical code (found in the real world)
  2. Complete the Lightning payment to unlock the question
- **Physical codes (code_physical) are distributed in the physical world (e.g. as QR codes, stickers, or clues at specific locations). Players must find them to unlock each question.**
- **After answering correctly, you receive a digital code (code_digital) as a solution word for the final phrase.**
- Configurable access modes:
  - *Low-fee*: Multiple Choice with feedback
  - *Premium*: Instant access to the correct answer
- Correct answers unlock one word (or element) each
- **Solved questions display a full-tile image badge and a checkmark.**
- **Progress indicator and secret phrase are only shown if at least one question is solved.**
- Goal: Collect all elements and reconstruct a final message

---

## 🛠️ Tech Stack

| Layer        | Tech                       | Purpose                            |
|-------------|----------------------------|------------------------------------|
| Framework   | Next.js (Vercel)           | SSR, routing, API endpoints        |
| Styling     | Tailwind CSS               | Responsive mobile-first UI         |
| UI          | Radix UI                   | Accessible components              |
| Animations  | Framer Motion              | Smooth transitions & effects       |
| Hosting     | Vercel                     | Scalable deployment                |
| Payments    | LNbits + LNURL-Pay         | Lightning-native payments          |
| API         | Next.js API Routes         | Handles LNbits polling & logic     |
| Data        | Local/dynamic JSON         | Quiz content & logic               |
| State Mgmt  | LocalStorage               | Progress tracking per device       |
| **Audio**   | MP3, HTML5 Audio           | **Success/fail sounds, Easteregg** |

---

## ⚙️ How It Works (Simplified)

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant L as LNbits
    participant W as Wallet

    U->>A: Opens station (e.g. /q1)
    A->>U: Prompts for physical code
    U->>A: Enters physical code
    A->>U: Displays LNURL-Pay QR code (from config)
    U->>W: Pays Lightning invoice via wallet
    W->>L: Sends payment to LNbits
    A-->>L: Polls LNbits if payment was received
    L-->>A: Confirms payment
    A->>U: Reveals the quiz question
```

Each question is locked behind both a physical code and a Lightning payment. Once both are completed, the question is revealed. Answering it correctly unlocks a "digital code" for the final message.
**Solved questions display their image as a badge on the start screen.**

---

## 🧩 Sample Knowledge Areas

- Bitcoin fundamentals and economic history  
- Cantillon Effect  
- Time Preference  
- Protocol concepts (e.g. Static Channel Backups, Submarine Swaps)  
- Key historic events and personalities (e.g. 1971 Nixon shock, Silk Road)

All questions and answers are fully customizable via JSON.
**Each question can have an image ("image": "q1.png") that is shown in the question screen and as a badge.**
**Hints are only shown in the question screen (with toggle button), not on the start page.**

---

## ✅ Benefits

- Fully whitelabel and reusable  
- Supports educational, team-building, and onboarding use cases  
- Runs on Bitcoin-native infrastructure (LNURL, LNbits, non-custodial)  
- Blends movement, collaboration, and learning  
- Modern, accessible UI with smooth animations
- Two-factor access (knowledge + payment) for enhanced engagement
- **All static assets (images, audio) are versioned in the public folder.**
- **Copyright notice in the footer with the current year.**
- **Responsive, accessible UI.**

---

## 🔧 LNbits Setup (Basic)

To keep things simple, use [LNbits](https://legend.lnbits.com) as your Lightning backend:

1. **Create a Wallet** on LNbits (no node required)
2. Enable the **LNURLp plugin** under Extensions
3. For each question (`/q1`, `/q2`, etc.):
   - Create one LNURL-Pay link via the plugin
   - Use a fixed amount (e.g. 100 sats)
   - Set `description` to the question ID (e.g. `"q1"`)
4. Copy the **LNURL** and insert it into your `questions.json` config:

```json
{
  "id": "q1",
  "question": "What is the block subsidy after the next halving?",
  "options": [
    "1.25 BTC",
    "1.5625 BTC",
    "1.75 BTC"
  ],
  "correct_index": 1,
  "code_digital": "fix",
  "code_physical": "magic",
  "hint": "The block subsidy halves every 210,000 blocks.",
  "image": "q1.png"
}
```

5. The frontend displays this LNURL as a QR code.
6. The backend polls LNbits to check if the payment has been received.
7. Once confirmed, the question becomes visible to the user.
**After all questions are solved, a prominent button 'Finish LNHunt & Sats geschenkt bekommen!' appears at the top.**
**The final LNURL is shown as a QR code and direct link. The participant's name should be entered in the comment field of the wallet. After successful withdrawal, the success URL redirects to `/thnx`.**

No dynamic invoice creation. No node. No complexity. Just working.

---

## 📦 Optional Features

- Admin dashboard for question control and payment logs  
- Team-based scoring, timers, and leaderboards  
- Badge system and proof-of-participation export (PDF/NFT)  
- Adaptive question paths or branching logic  
- **Audio feedback after each answer (success/fail).**
- **Easter egg: In the info panel, the sounds can be played via buttons.**
- **Debug panel and info panel can be toggled via button. Info panel contains technical details and Easter egg sound buttons.**
- **After the withdrawal transaction via LNURL, users are redirected to a /thnx page ('Thank you for participating').**

---

## 🧪 Local Setup

```bash
git clone https://github.com/muraschal/lnhunt.git
cd lnhunt
npm install
cp .env.example .env.local
# Add LNbits API Key and base URL
npm run dev
```

---

## 🚀 Deployment

1. Push the project to GitHub  
2. Connect it to [Vercel](https://vercel.com/)  
3. Add environment variables (API keys, base URLs) in the Vercel dashboard:
   - `LNBITS_API_URL`: Your LNbits instance API URL
   - `LNBITS_API_KEY`: Your LNbits API key
   - `LNBITS_WALLET_ID`: Your LNbits wallet ID
   - `LNBITS_LNURL`: The LNURL-withdraw link for the final reward
4. Deploy and start playing – no backend setup required

---

## 🐙 GitHub & 🚀 Vercel Deployment

1. Initialisiere ein Git-Repository (falls noch nicht geschehen):
   ```bash
git init
git add .
git commit -m "Initial commit"
   ```
2. Erstelle ein neues Repository auf GitHub und pushe dein Projekt:
   ```bash
git remote add origin https://github.com/DEIN_USERNAME/DEIN_REPO.git
git push -u origin main
   ```
3. Gehe zu [vercel.com](https://vercel.com), importiere dein GitHub-Repo und setze die Umgebungsvariablen (siehe .env.example).
4. Deploye das Projekt – fertig!

---

## 🛠️ Für Entwickler

### Systemanforderungen
- Node.js 16.x oder höher
- NPM 7.x oder höher
- Moderne Browser (Chrome, Firefox, Safari, Edge)

### Entwicklungsmodus
Die Anwendung besitzt einen eingebauten Entwicklungsmodus, der aktiviert wird, wenn keine LNbits-API-Schlüssel konfiguriert sind. In diesem Modus werden Lightning-Zahlungen simuliert, sodass keine echten Sats verwendet werden müssen.

### Sicherheitshinweise
- Speichern Sie niemals sensitive Daten wie API-Schlüssel im Git-Repository
- Die `.env.local` Datei ist in `.gitignore` eingetragen und sollte NIEMALS eingecheckt werden
- Die Anwendung implementiert Rate-Limiting für API-Anfragen zur Verhinderung von Missbrauch

### Fehlerbehandlung
Häufige Probleme:
- **API-Fehler**: Überprüfen Sie die API-Schlüssel und URL in Ihren Umgebungsvariablen
- **Zahlungsfehler**: Stellen Sie sicher, dass Ihre LNbits-Instanz korrekt konfiguriert ist
- **Entwicklungsmodus**: Für Tests ohne echte Zahlungen können Sie die API-Schlüssel leer lassen

### Lizenz
Dieses Projekt steht unter der MIT-Lizenz.

---

## 👥 License & Contribution

Open for customization, whitelabel deployments, and community use.  
If you adapt or build on top of lnhunt, contributions and feedback are welcome!

---

## 🚨 Updates & Features

- **Completely new UI:**
  - Question tiles now show the respective image as a full badge after solving.
  - Progress indicator and secret phrase are only shown if at least one question is solved.
  - The hint 'Click on a question...' is only shown if there are still open questions.

- **Questions & Answers:**
  - All questions and answers are managed via the `questions.json` file.
  - Each question can have an `image` that is shown in the question screen and as a badge.
  - Hints are only shown in the question screen (with toggle button), not on the start page.

- **Lightning Integration:**
  - Dynamic invoice creation via LNbits API.
  - After all questions are solved, a prominent button 'LNHunt abschließen & Sats geschenkt bekommen!' appears at the top.
  - Integration of a fixed LNURL-withdraw link for the final reward (players receive sats as a reward for completion).
  - The LNURL-withdraw link is configured via the `LNBITS_LNURL` environment variable.
  - Note: The participant's name is entered in the comment field of the wallet.

- **Audio Feedback:**
  - Success and fail sounds after each answer (MP3, compatible with web/mobile/desktop).
  - Easter egg: In the info panel, the sounds can be played via buttons.

- **Completion & Thank You Page:**
  - After the withdrawal transaction via LNURL, users are redirected to a /thnx page ('Thank you for participating').

- **Debug & Info:**
  - Debug panel and info panel can be toggled via button.
  - Info panel contains technical details and Easter egg sound buttons.

- **Best Practices:**
  - Copyright notice in the footer with the current year.
  - Responsive, accessible UI.
  - All static assets (images, audio) are versioned in the public folder.

---

### Example for the new questions.json

```json
{
  "id": "q1",
  "question": "What is the block subsidy after the next halving?",
  "options": [
    "1.25 BTC",
    "1.5625 BTC",
    "1.75 BTC"
  ],
  "correct_index": 1,
  "code_digital": "fix",
  "code_physical": "magic",
  "hint": "The block subsidy halves every 210,000 blocks.",
  "image": "q1.png"
}
```

---

### Notes on LNURL Withdrawal Reward

- The final LNURL-withdraw is shown as a QR code and direct link as soon as all questions are solved.
- The LNURL is configured in the `LNBITS_LNURL` environment variable.
- The participant's name should be entered in the comment field of the wallet.
- Players receive sats as a reward for completing all questions.
- After successful withdrawal, the success URL redirects to `/thnx`.

---

**Tip:**
You can freely customize questions, images, and sounds – everything is controlled via JSON and the public folder!
