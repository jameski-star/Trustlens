# TrustLens

**Know Before You Click.**

TrustLens helps you determine whether websites, emails, SMS messages, phone numbers, job offers, investment platforms, QR codes, or screenshots are safe or potentially fraudulent — before you engage.

## How It Works

**1. Paste or upload** the content you want to check (URL, email, phone number, SMS, screenshot, or QR code).

**2. Our engine analyzes** it across multiple dimensions: SSL validity, domain age, blacklists, WHOIS data, brand impersonation, suspicious patterns, and AI-powered text analysis.

**3. You get a clear risk score** (0–100) with a detailed report explaining why, including recommendations.

No signup required for basic scans.

## What You Can Check

| Tool | What It Does |
|------|-------------|
| **URL Checker** | Scan any website link for phishing, malware, or fraud indicators |
| **Email Checker** | Analyze email addresses and content for scams |
| **SMS / Phone Checker** | Verify phone numbers and SMS messages |
| **Screenshot Scanner** | Upload a screenshot — OCR extracts text for analysis |
| **QR Code Scanner** | Upload a QR code to decode and analyze the destination |
| **Community Reports** | Browse what others are reporting to spot new threats |
| **Scam Alerts** | Stay informed about active, trending scams |
| **Knowledge Center** | Learn to recognize phishing, crypto scams, job fraud, and more |

## Getting Started

Visit **https://trustlens.app** (or run locally — see below).

### Run Locally

```bash
git clone https://github.com/yourusername/trustlens.git
cd trustlens

# Start backend
cd backend
cp .env.example .env   # edit with your MongoDB URI and secrets
npm install
npm run dev

# In another terminal, start frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Using Docker

```bash
docker-compose up -d
```

Then open **http://localhost** in your browser.

## Reading a Report

Every scan produces a report with:

- **Risk Score** — 0 (critical) to 100 (safe), color-coded green/yellow/orange/red
- **SSL Check** — Is the certificate valid and properly configured?
- **Domain Age** — How long has the domain existed? (new domains are riskier)
- **Blacklist Status** — Is the domain listed on known threat databases?
- **AI Analysis** — Pattern-based detection of phishing, spam, and social engineering
- **Detected Risks** — Specific findings with severity levels
- **Recommendations** — Actionable steps based on the results
- **Confidence Score** — How reliable the analysis is

Reports can be downloaded as PDF and shared via a unique link.

## FAQ

**Is my data stored?**  
No personal data is stored unless you create an account. Scan results are saved with an anonymous share ID so you can revisit or share them.

**How accurate is the analysis?**  
Our engine checks SSL certificates, domain registration data, blacklists, brand impersonation patterns, and uses AI-based text analysis. Confidence scores are shown on every report.

**Do I need an account?**  
No. Basic scanning is free and requires no registration. Accounts are optional and allow you to track your scan history.

**Is TrustLens free?**  
Yes. All core security analysis tools are free to use.

## Questions?

Visit the **[FAQ page](https://trustlens.app/faq)** or **[Contact us](https://trustlens.app/contact)**.
