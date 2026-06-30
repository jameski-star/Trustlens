import mongoose from 'mongoose';
import { config } from './config';
import { KnowledgeArticle } from './models/KnowledgeArticle';
import { logger } from './utils/logger';

const articles = [
  {
    title: 'Phishing: How to Identify and Avoid Phishing Attacks',
    slug: 'phishing-attacks',
    excerpt: 'Learn how phishing attacks work, how to spot fake emails and websites, and what to do if you fall victim.',
    icon: 'Shield',
    order: 1,
    category: 'phishing',
    content: `Phishing is one of the most common and dangerous cyber threats today. It is a type of social engineering attack where criminals impersonate legitimate organizations to trick you into revealing sensitive information such as passwords, credit card numbers, or bank details.

## How Phishing Works

Phishing attacks typically follow a predictable pattern:

1. **The Bait**: You receive an email, text message, or social media message that appears to be from a trusted source — your bank, a popular online service, a government agency, or even a colleague.

2. **The Hook**: The message creates a sense of urgency or fear. Common tactics include claiming your account has been compromised, a payment has failed, or you need to verify your identity immediately.

3. **The Trap**: You are directed to click a link that leads to a fake website that looks nearly identical to the legitimate one. Any information you enter is captured by the attackers.

## Real-World Examples

### The LinkedIn Recruitment Phish
In 2025-2026, a widespread phishing campaign targeted professionals on LinkedIn. Attackers posed as recruiters from well-known companies and sent messages with links to fake job applications. When victims clicked the link and entered their credentials, their accounts were hijacked and used to spread the attack further.

### The KYC Verification Scam
With the rise of cryptocurrency and fintech platforms, scammers send fake "Know Your Customer" (KYC) verification emails. These messages claim your account will be frozen unless you re-submit your identification documents. Victims upload their passport, driver's license, or other ID — which scammers then use for identity theft and selling on the dark web.

### The Fake Delivery Notice
A text message arrives claiming to be from DHL, FedEx, or your local postal service: "Your package could not be delivered. Please confirm your address and pay a small redelivery fee." The link leads to a page that steals both your address and payment card details.

## Common Red Flags

- **Generic greetings**: "Dear Customer" or "Dear User" instead of your name
- **Misspelled URLs**: The link looks like "paypaI.com" (with a capital I instead of l) or "amaz0n.co"
- **Poor grammar and spelling**: Professional companies have editors
- **Threats and urgency**: "Your account will be closed in 24 hours"
- **Unsolicited attachments**: Especially .zip, .docm, or .exe files
- **Requests for credentials**: Legitimate companies never ask for your password via email

## How to Protect Yourself

1. **Never click links in unsolicited messages**. Manually type the website address into your browser.
2. **Check the sender's email address**. Hover over the "From" name to reveal the actual email address.
3. **Use two-factor authentication (2FA)** on all accounts. This prevents attackers from accessing your account even if they steal your password.
4. **Keep your browser and security software updated**.
5. **If something feels wrong, trust your instinct**. Contact the organization directly using their official phone number or website.

## What to Do If You've Been Phished

1. Change your passwords immediately — start with your email account.
2. Enable 2FA on all accounts that support it.
3. Contact your bank if you entered financial information.
4. Report the phishing attempt to your national cyber security agency (e.g., Report Fraud in the UK, IC3 in the US).
5. Monitor your accounts for unusual activity for several months.

Phishing attacks are constantly evolving, but the fundamentals remain the same. Stay skeptical, verify before trusting, and never let urgency override your judgment.`,
  },
  {
    title: 'Crypto Scams: Cryptocurrency Investment Fraud Awareness',
    slug: 'crypto-scams',
    excerpt: 'Understand cryptocurrency scams including rug pulls, pump and dump schemes, and fake investment platforms.',
    icon: 'CreditCard',
    order: 2,
    category: 'crypto',
    content: `Cryptocurrency scams have exploded in recent years, with criminals exploiting the complexity and hype around digital assets to steal billions from investors. Unlike traditional banking, crypto transactions are irreversible and pseudonymous, making them an attractive target for fraud.

## Types of Crypto Scams

### Rug Pulls
A rug pull occurs when developers create a seemingly legitimate cryptocurrency project, attract investors, and then suddenly drain all the funds and disappear. In 2025 alone, rug pulls stole over $2.8 billion from investors.

**How to spot a rug pull:**
- The development team is anonymous or uses fake identities
- The project's smart contract has not been audited by a reputable firm
- Early investors are promised impossibly high returns (1-5% daily)
- The project's liquidity is locked for a suspiciously short period

### Fake Investment Platforms
Scammers build professional-looking websites that mimic legitimate crypto exchanges or investment platforms. They lure victims with sign-up bonuses and show fake trading profits to encourage larger deposits. When victims try to withdraw, they are hit with endless fees or the site simply disappears.

**The KYC Document Scam Connection**: Many fake platforms require "identity verification" and ask users to upload passport photos, driver's licenses, and selfies holding their ID. These documents are then sold on dark web marketplaces for identity theft. Your KYC documents can be used to open bank accounts, apply for loans, or commit fraud in your name.

### Pig Butchering (Sha Zhu Pan)
This is a sophisticated long-term scam where criminals build romantic or friendly relationships with victims over weeks or months, then convince them to invest in a fake crypto platform. The name comes from the idea of "fattening up" the victim before the slaughter.

### Pump and Dump Schemes
Organized groups artificially inflate the price of a low-value cryptocurrency through coordinated buying and social media hype, then sell their holdings at the peak, causing the price to crash and leaving other investors with worthless tokens.

## What Documents Do Scammers Use Your KYC For?

When you upload your identification documents to a fake platform, here is what happens:

1. **Identity Selling**: Your passport or driver's license is sold on the dark web for $50-300
2. **Synthetic Identity Fraud**: Your real ID is combined with fake information to create a new identity used for loan fraud
3. **Account Takeover**: Your documents are used to socially engineer customer support agents at banks and crypto exchanges
4. **Money Laundering**: Your identity is used to set up accounts that criminals use to launder money

## How to Protect Yourself

1. **Only use well-known, regulated exchanges** like Coinbase, Binance, or Kraken
2. **Verify any investment platform** through independent sources — never trust ads or social media recommendations
3. **Be skeptical of guaranteed returns** — if it sounds too good to be true, it is
4. **Check smart contract audits** for any DeFi project before investing
5. **Never share your private keys or seed phrase** with anyone
6. **Research the team** behind any project — real teams are transparent about their identities`,
  },
  {
    title: 'Job Scams: Fake Job Offers and Employment Fraud',
    slug: 'job-scams',
    excerpt: 'How to identify fake job offers, employment fraud, and recruitment scams targeting job seekers.',
    icon: 'Briefcase',
    order: 3,
    category: 'job-scams',
    content: `Job scams are on the rise as scammers exploit people looking for work. These schemes range from fake job listings that steal personal information to "employment" that involves laundering money.

## How Job Scams Work

### The Fake Interview Process
Scammers post legitimate-looking job listings on sites like LinkedIn, Indeed, and Glassdoor. After a quick interview (often via text chat), you receive a job offer. The catch: you need to pay for "training materials," "background checks," or "equipment deposits." Once you pay, the job disappears.

### The Check Overpayment Scam
You are "hired" as a remote assistant or virtual secretary. Your first task: deposit a check and use the funds to purchase supplies from a specific vendor. The check is fake, but the bank doesn't know yet. You send real money to the "vendor" (the scammer), and weeks later the bank reverses the check, leaving you in debt.

### Identity Theft Through Job Applications
Fake employers ask for extensive personal information during the "application process": Social Security number, bank account details (for direct deposit), a photo of your driver's license, and even your passport. This information is used for identity theft.

### The LinkedIn Scam Connection
Scrapers on LinkedIn collect profile data and use it to craft personalized job offers. They reference your actual experience and skills, making the offer seem legitimate. The message often includes a link to a fake company website that mirrors a real company's branding.

## Red Flags

- The company has no online presence beyond a basic website
- The job offer comes after only a text-based interview
- You are asked to pay for training, background checks, or equipment
- The salary is unusually high for the role
- The employer asks for your bank details before you start
- Communication is only through encrypted messaging apps like WhatsApp or Telegram
- The "company" wants you to receive and forward packages (reshipping scam)

## Real-World Example

In 2025, a massive job scam campaign targeted recent university graduates on LinkedIn. Scammers posed as recruiters from Fortune 500 companies. Victims completed "interviews" via WhatsApp, received fake offer letters with company logos, and were asked to pay $150-500 for "background verification." Thousands of graduates lost money, and their personal information was sold on the dark web.

## How to Protect Yourself

1. **Research the company independently**. Call their official phone number and ask to speak to HR.
2. **Never pay for a job**. Legitimate employers never ask for money during the hiring process.
3. **Verify the person contacting you**. Check if the recruiter has a company email address, not a Gmail or Yahoo address.
4. **Be wary of remote jobs that seem too easy**. Data entry from home for $5,000/month is almost always a scam.
5. **Protect your personal information**. Do not provide your bank details, Social Security number, or ID documents until you have verified the employer.`,
  },
  {
    title: 'SMS Scams: Text Message and WhatsApp Fraud',
    slug: 'sms-scams',
    excerpt: 'Learn about smishing, WhatsApp fraud, and how to protect yourself from text message scams.',
    icon: 'MessageSquare',
    order: 4,
    category: 'sms-scams',
    content: `SMS scams, also known as smishing (SMS phishing), have become one of the most effective attack vectors because text messages have a much higher open rate than email — over 90% of texts are read within three minutes.

## Common Types of SMS Scams

### Package Delivery Scams
You receive a text: "Your package is awaiting delivery. Please confirm your address and pay a $2.99 redelivery fee." The link leads to a fake UPS/USPS/FedEx page that steals your credit card information.

### Bank Fraud Alerts
"Your account has been compromised. Click here to verify your identity and secure your funds." The fake banking portal steals your online banking credentials.

### WhatsApp "Friend in Need"
A message arrives from an unknown number claiming to be a family member or friend who has lost their phone. They ask you to send money urgently or click a link to help them recover their account. The scammers use publicly available information from social media to make the story convincing.

### The "Mum, Dad, I broke my phone" Scam
A common WhatsApp scam: "Hi Mum/Dad, I dropped my phone in the toilet. This is my new number. I need you to pay a bill for me urgently." Scammers target parents by exploiting their natural desire to help their children.

### Fake WhatsApp Invitations
You receive a message claiming you have been invited to join a WhatsApp group for a "government relief fund" or "investment opportunity." The group administrators then pressure members to send money or share personal information.

### Yahoo Boys and Advance Fee Fraud
West African cybercriminals, colloquially known as "Yahoo Boys," frequently use SMS and WhatsApp to conduct advance fee fraud. They build trust over text, claim you have won a lottery or inheritance, and ask you to pay fees to release the funds.

## How to Protect Yourself

1. **Never click links in unsolicited text messages**. Even if the message appears to be from a company you use.
2. **Verify emergencies independently**. Call your family member on their known phone number before sending money.
3. **Block and report** suspicious numbers. On WhatsApp, you can block and report spam directly.
4. **Do not reply** to suspicious texts. Replying confirms your number is active, leading to more spam.
5. **Enable WhatsApp two-step verification** in Settings > Account > Two-step verification.
6. **Forward phishing texts** to 7726 (SPAM) to report them to your mobile carrier.`,
  },
  {
    title: 'Romance Scams: Dating and Relationship Fraud',
    slug: 'romance-scams',
    excerpt: 'How romance scammers operate on dating apps and social media, and how to spot catfishing before it costs you.',
    icon: 'Heart',
    order: 5,
    category: 'romance-scams',
    content: `Romance scams cost victims billions of dollars annually and cause immense emotional harm. These scams involve criminals creating fake identities on dating apps and social media to build romantic relationships, then exploiting that trust for financial gain.

## How Romance Scams Work

1. **Profile Creation**: Scammers steal photos from real people (often models or military personnel) and create attractive profiles on Tinder, Bumble, Hinge, Facebook Dating, or Instagram.

2. **The Love Bombing Phase**: They quickly declare strong feelings, talk about a future together, and isolate you from friends and family who might be skeptical. They communicate multiple times a day and seem perfect.

3. **The Crisis**: After weeks or months, a crisis emerges. They need money for a medical emergency, a plane ticket to visit you, a business deal that went wrong, or legal fees. They always promise to pay it back.

4. **The Extraction**: Money is sent repeatedly through wire transfers, gift cards, or cryptocurrency. The excuses become more elaborate. Eventually, the scammer disappears or the victim runs out of money.

## The Social Media Connection

Scammers often start on dating apps but quickly move conversations to WhatsApp, Telegram, or Signal where they are harder to trace. They exploit Facebook and Instagram to learn details about your life — your job, your interests, your financial situation — and use this information to build trust.

## Who Is Targeted

Anyone can be a target, but scammers often focus on:
- Older adults who may be lonely after losing a spouse
- People who recently went through a divorce or breakup
- Individuals with public social media profiles
- People who openly discuss their income or financial situation online

## Red Flags

- The person's photos look too perfect or like a model
- They refuse to video call or meet in person
- They have excuses for why they cannot meet ("deployed overseas," "working on an oil rig")
- They profess love very quickly (within days or weeks)
- They ask for money, gift cards, or cryptocurrency
- Their stories do not add up over time
- They get angry or defensive when you ask questions

## How to Verify Someone's Identity

1. **Reverse image search** their profile photos using Google Images or Social Catfish
2. **Ask for a live video call** — not a pre-recorded video
3. **Verify their job and location** through independent research
4. **Talk to friends and family** about the relationship — outsiders often spot red flags
5. **Never send money** to someone you have not met in person

## What to Do If You Are a Victim

1. Stop all communication immediately.
2. Report the profile to the dating platform.
3. Contact your bank or credit card company to try to reverse transactions.
4. Report to law enforcement (Report Fraud in the UK, FBI IC3 in the US).
5. Seek emotional support — romance scams are traumatic and professional counseling can help.`,
  },
  {
    title: 'Investment Fraud: Ponzi Schemes and Fake Investments',
    slug: 'investment-fraud',
    excerpt: 'How to identify Ponzi schemes, pyramid schemes, and fake investment opportunities targeting ordinary people.',
    icon: 'Globe',
    order: 6,
    category: 'investment',
    content: `Investment fraud involves tricking people into putting money into fake or manipulated investment opportunities. These scams can appear sophisticated, with professional-looking websites, fake testimonials, and even simulated trading platforms.

## Types of Investment Fraud

### Ponzi Schemes
Named after Charles Ponzi, these schemes promise high returns with little risk. Early investors are paid with money from new investors, not from actual profits. The scheme collapses when there are not enough new investors to pay existing ones.

**Bernie Madoff's $65 billion Ponzi scheme** is the most famous example, but smaller versions operate constantly. In 2025, a scheme targeting Nigerian diaspora communities promised 20% monthly returns on "crypto trading" and collapsed after 18 months, stealing over $50 million.

### Pyramid Schemes
Unlike Ponzi schemes, pyramid schemes require participants to recruit new members. Each new member pays an entry fee, and a portion goes up the chain. These are illegal in most countries because they cannot sustain themselves without endless recruitment.

### Fake Trading Platforms
Scammers build realistic trading platforms showing fake profits. Victims deposit money, see their "investments" grow, but can never withdraw. Common tactics include:
- Showing impressive but fake trading history
- Requiring you to pay taxes before withdrawing
- Claiming your account needs to be "upgraded" to a premium tier

### The Yahoo Boys and Advance Fee Fraud
Nigerian cybercriminals (Yahoo Boys) are infamous for advance fee fraud. The classic "Nigerian Prince" email has evolved. Modern versions include:
- Fake inheritance notifications
- Lottery winnings from contests you never entered
- "Investment opportunities" in oil, gold, or real estate
- Romance-based investment pitches (pig butchering)

## Warning Signs

- Guaranteed returns with no risk
- Consistently high returns regardless of market conditions
- Unregistered investment products
- Pressure to invest quickly or "you'll miss out"
- Complex strategies you cannot understand
- Difficulty withdrawing money or requests for additional fees to withdraw
- No physical address or the company is registered in a tax haven

## How to Protect Yourself

1. **Check if the investment is registered** with your country's financial regulator (SEC in the US, FCA in the UK).
2. **Independent verification**: Research the company through independent sources, not their website.
3. **Be skeptical of unsolicited offers**: If someone contacts you with an investment opportunity, it is almost certainly a scam.
4. **Understand the investment**: If you cannot explain how it generates returns, do not invest.
5. **Start small**: Test withdrawals before committing significant money.
6. **Get independent advice**: Talk to a financial advisor who is not associated with the investment.`,
  },
  {
    title: 'Identity Theft: Protecting Your Personal Information',
    slug: 'identity-theft',
    excerpt: 'How identity thieves steal and sell your personal data, what documents are used for, and how to protect yourself.',
    icon: 'Users',
    order: 7,
    category: 'identity-theft',
    content: `Identity theft is the criminal use of someone else's personal information for financial gain. In 2025, identity fraud affected over 15 million people in the US alone, with losses exceeding $25 billion.

## How Identity Thieves Get Your Information

### Data Breaches
Large-scale breaches of company databases expose millions of records. The 2024-2025 breaches at major credit bureaus, healthcare providers, and social media platforms have put virtually every adult's personal information at risk.

### Phishing and Social Engineering
Scammers trick you into giving them your information directly through fake emails, calls, or texts. The KYC scam trend specifically targets people who use cryptocurrency or fintech apps.

### Physical Theft
Stolen wallets, mail, and discarded documents containing personal information remain a significant source of identity theft. "Dumpster diving" for bank statements and credit card offers is still common.

### Dark Web Marketplaces
Stolen identities are bought and sold on dark web marketplaces. A "fullz" (complete identity package) typically includes name, address, Social Security number, date of birth, and often bank account details — all for $10-50.

## What Scammers Do With Your Identity

### Document Selling
Your passport, driver's license, or national ID card photo can be sold on the dark web:
- **Passport scan**: $100-300
- **Driver's license**: $50-150
- **Selfie with ID**: $150-500 (used to bypass biometric verification)
- **Bank statement**: $30-80

### Account Takeover
Your identity is used to:
- Open credit cards and take loans in your name
- Access your existing bank accounts
- File fraudulent tax returns and claim your refund
- Subscribe to services using your credit

### Synthetic Identity Fraud
Criminals combine real information (like a real Social Security number) with fake information to create entirely new identities. This makes detection extremely difficult because the identity does not correspond to a real person with a credit history.

### Medical Identity Theft
Your health insurance information is used to receive medical treatment or prescription drugs, leaving you with fraudulent medical bills and corrupted health records.

### The Yahoo Boys Connection
West African cybercrime groups (Yahoo Boys) are major consumers of stolen identities. They use them to create social media accounts for romance scams, set up bank accounts for money laundering, and verify accounts on cryptocurrency exchanges.

## How to Protect Yourself

1. **Freeze your credit** with all three major credit bureaus (Experian, Equifax, TransUnion). This prevents anyone from opening new accounts in your name.
2. **Use a password manager** to create unique, strong passwords for every account.
3. **Enable two-factor authentication** everywhere it is available.
4. **Shred documents** containing personal information before discarding.
5. **Monitor your credit reports** regularly — you are entitled to one free report per year from each bureau.
6. **Use a VPN** on public Wi-Fi to prevent interception of your data.
7. **Be careful what you share on social media** — even your mother's maiden name, pet's name, and birth date can be used to answer security questions.

## What to Do If You Are a Victim

1. Contact your bank and credit card companies to freeze accounts.
2. Place a fraud alert on your credit files.
3. File a report with the Federal Trade Commission (FTC) or your country's equivalent.
4. File a police report.
5. Change passwords on all accounts.
6. Consider identity theft protection services.`,
  },
  {
    title: 'Online Safety: General Cybersecurity Best Practices',
    slug: 'online-safety',
    excerpt: 'Essential cybersecurity practices for everyday online safety including passwords, social media privacy, and safe browsing.',
    icon: 'BookOpen',
    order: 8,
    category: 'online-safety',
    content: `Online safety is about developing good habits that protect your digital life. These best practices apply to everyone, from casual social media users to professionals working remotely.

## Password Hygiene

Your password is the first line of defense. Follow these rules:

1. **Use a unique password for every account**. Never reuse passwords across different sites.
2. **Make passwords long and complex**. At least 12 characters with a mix of uppercase, lowercase, numbers, and symbols.
3. **Use a password manager**. Tools like Bitwarden, 1Password, or Apple Keychain generate and store strong passwords securely.
4. **Never share passwords via text, email, or phone**.
5. **Change passwords immediately** if you suspect an account has been compromised.

## Two-Factor Authentication (2FA)

2FA adds a second layer of security beyond your password. Always enable it on:
- Email accounts (this is the most important — your email is the key to resetting all other passwords)
- Banking and financial accounts
- Social media accounts
- Work accounts and VPNs

**Prefer authenticator apps** (Google Authenticator, Microsoft Authenticator, Authy) over SMS-based 2FA, as SIM swapping attacks can bypass text message codes.

## Social Media Privacy

Social media platforms are a goldmine for scammers. Protect yourself:

1. **Limit what you share publicly**. Your full birth date, home address, and phone number should never be public.
2. **Review your privacy settings** regularly. Platforms frequently change their default settings.
3. **Be selective about friend requests**. Do not accept requests from people you do not know.
4. **Disable location tagging** on posts.
5. **Beware of quizzes and games** that ask for personal information — they are often data harvesting operations.

## Safe Browsing Habits

1. **Check for HTTPS** before entering any information on a website. Look for the padlock icon in your browser.
2. **Do not download attachments** from unknown senders.
3. **Keep your browser and operating system updated**. Security patches fix vulnerabilities that attackers exploit.
4. **Use a content blocker or ad blocker** to block malicious ads.
5. **Avoid using public computers** for sensitive activities like banking.

## Social Media Scams: Facebook, Instagram, and LinkedIn

### Facebook Scams
- **Fake marketplace listings**: Scammers post items at too-good-to-be-true prices, ask for deposits, and disappear
- **Account cloning**: Scammers copy your profile picture and name, send friend requests to your friends, and ask them for money
- **Fake charity pages**: Created after natural disasters to collect donations that never reach victims

### Instagram Scams
- **Fake influencers**: Accounts with purchased followers promote scam products or investment schemes
- **DM phishing**: Messages claiming your account will be deleted unless you click a link to verify
- **Fake giveaways**: "You won! Click here to claim your prize" — leads to credential theft

### LinkedIn Scams
- **Fake recruiter messages**: Personalized messages with links to fake job applications
- **Connection harvesting**: Fake profiles connect with you to collect professional information for targeted attacks
- **Endorsement spam**: Automated endorsements used to build fake credibility before sending malicious messages

## Protecting Your Devices

1. **Install antivirus software** on all devices.
2. **Keep your operating system updated** — enable automatic updates.
3. **Only install apps from official app stores** (Apple App Store, Google Play Store).
4. **Review app permissions** — does a flashlight app really need access to your contacts?
5. **Use device encryption** (FileVault on Mac, BitLocker on Windows, device encryption on phones).
6. **Back up your data regularly** to an external drive or cloud service.

## WiFi Safety

1. **Use a strong password** on your home WiFi — WPA2 or WPA3 encryption.
2. **Change the default router admin password**.
3. **Avoid using public WiFi** for sensitive activities without a VPN.
4. **Turn off WiFi and Bluetooth** when not in use to prevent unauthorized connections.

## The Bottom Line

Security is not about being paranoid — it is about being prepared. Most cyber attacks target easy victims. By following these basic practices, you become a much harder target, and attackers will move on to someone else.`,
  },
];

export async function seedKnowledgeArticles(): Promise<void> {
  for (const article of articles) {
    const existing = await KnowledgeArticle.findOne({ slug: article.slug });
    if (existing) {
      logger.info({ slug: article.slug }, 'Article already exists, skipping');
      continue;
    }
    await KnowledgeArticle.create(article);
    logger.info({ slug: article.slug }, 'Created knowledge article');
  }
}

async function run() {
  await mongoose.connect(config.mongodbUri);
  logger.info('Seeding knowledge articles...');
  await seedKnowledgeArticles();
  await mongoose.disconnect();
  logger.info('Done');
}

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('seed-knowledge') ||
  process.argv[1].endsWith('seed-knowledge.ts') ||
  process.argv[1].endsWith('seed-knowledge.js')
);

if (isMainModule) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
