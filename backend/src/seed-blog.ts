import mongoose from 'mongoose';
import { config } from './config';
import { BlogPost } from './models/BlogPost';

const posts = [
  {
    title: 'How to Spot Phishing Emails in 2024',
    slug: 'how-to-spot-phishing-emails',
    excerpt: 'Phishing attacks are more sophisticated than ever. Learn to spot the red flags — urgent language, spoofed sender addresses, suspicious links — and protect yourself from email scams.',
    content: `Phishing remains one of the most dangerous and widespread cyber threats today. Cybercriminals send emails that appear to come from trusted companies — banks, social media platforms, shipping carriers — in an attempt to steal your passwords, credit card numbers, or personal information.

## Common Phishing Red Flags

**Urgent or threatening language.** Scammers want you to act before you think. Phrases like "Your account will be suspended" or "Unauthorized login detected" are designed to panic you into clicking.

**Spoofed sender addresses.** The display name may look legitimate, but check the actual email address. A message from "PayPal Support" might come from paypal-support@secure-verify.net rather than paypal.com.

**Generic greetings.** Legitimate companies know your name. Emails that start with "Dear Customer" or "Dear User" should raise suspicion.

**Suspicious links and attachments.** Hover over any link before clicking. If the URL displayed differs from the one in the status bar, do not click. Attachments you weren't expecting — especially ZIP files, DOCM files, or PDFs — are common malware delivery methods.

**Poor spelling and grammar.** While AI-generated phishing emails are getting better, many scams still contain awkward phrasing, typos, or inconsistent formatting that legitimate companies would not send.

## How to Protect Yourself

1. **Enable two-factor authentication (2FA).** Even if a phisher gets your password, they cannot access your account without the second factor.
2. **Use email filters.** Most email providers have built-in spam filtering. Ensure yours is enabled and review your spam folder periodically.
3. **Verify through official channels.** If you receive an alarming email from your bank or a service you use, navigate directly to their website rather than clicking any links in the email.
4. **Report phishing attempts.** Forward suspicious emails to your email provider's abuse address. In the US, report to the FTC at reportfraud.ftc.gov.

## What to Do If You Clicked

If you accidentally clicked a phishing link or entered credentials on a fake site, act immediately: change your password, enable 2FA, check for unauthorized activity, and run a security scan on your device. Time is critical — the faster you respond, the less damage a scammer can do.

Stay vigilant. The best defense against phishing is a healthy dose of skepticism.`,
    category: 'Phishing',
    tags: ['phishing', 'email security', 'cybersecurity', 'social engineering'],
    author: 'TrustLens Security Team',
    seo: {
      metaTitle: 'How to Spot Phishing Emails in 2024 | TrustLens',
      metaDescription: 'Learn to identify phishing emails with our comprehensive guide. Spot red flags like urgent language, spoofed senders, and suspicious links to stay safe online.',
      canonicalUrl: '',
    },
  },
  {
    title: 'Crypto Scams: What to Look For',
    slug: 'crypto-scams-what-to-look-for',
    excerpt: 'Cryptocurrency scams cost victims billions every year. From fake airdrops and rug pulls to impersonation schemes, here is how to recognize the warning signs before you lose your investment.',
    content: `The cryptocurrency market continues to attract both legitimate investors and sophisticated scammers. In 2025 alone, crypto-related fraud losses exceeded $3 billion in the first half of the year. Understanding how these scams operate is your best protection.

## Most Common Crypto Scams

**Fake Airdrops and Giveaways.** Scammers promise free tokens if you "connect your wallet" or send a small amount of crypto first. Once you connect, a malicious contract drains your wallet. Legitimate airdrops never require you to pay gas fees or share your private keys.

**Rug Pulls.** Developers launch a new token or DeFi project, attract investor funds, and then suddenly pull all liquidity, leaving investors with worthless coins. Red flags include anonymous teams, locked liquidity that can still be withdrawn, and promises of guaranteed returns.

**Impersonation Scams.** Fraudsters pose as well-known crypto figures, exchange support agents, or project founders on social media and messaging platforms. They may use deepfake video or audio to appear legitimate. No legitimate crypto project will ever DM you first asking for funds or private keys.

**Pump and Dump Schemes.** Coordinated groups artificially inflate the price of a low-value token through misleading hype on social media. Once the price spikes, the organizers sell their holdings, crashing the price and leaving retail investors with losses.

**Fake Exchanges and Wallets.** Scammers create apps that look like legitimate exchanges or wallet services. These apps steal your login credentials and funds. Always download wallet software and exchange apps from official sources only.

## Warning Signs to Watch For

- Guaranteed high returns with little or no risk
- Pressure to act quickly (FOMO tactics)
- Anonymous or unverifiable team members
- No clear whitepaper or technical documentation
- Difficulty withdrawing funds or unexplained delays
- Requests for private keys or seed phrases (legitimate services never ask for these)

## How to Protect Yourself

1. **Do your own research (DYOR).** Verify the team, read the whitepaper, check audit reports, and look for independent reviews before investing.
2. **Only use reputable exchanges.** Stick with well-known platforms that have regulatory compliance and a track record of security.
3. **Never share your seed phrase.** Your seed phrase is the master key to your wallet. No legitimate service will ever ask for it.
4. **Use hardware wallets.** For long-term storage, keep your crypto in a hardware wallet like Ledger or Trezor that keeps your private keys offline.
5. **Be skeptical of unsolicited messages.** If someone contacts you out of the blue with an investment opportunity, it is almost certainly a scam.

The golden rule: if an offer sounds too good to be true, it is.`,
    category: 'Crypto',
    tags: ['crypto scams', 'cryptocurrency', 'blockchain', 'investment fraud', 'DeFi'],
    author: 'TrustLens Security Team',
    seo: {
      metaTitle: 'Crypto Scams: What to Look For | TrustLens',
      metaDescription: 'How to recognize cryptocurrency scams before you lose your investment. Learn about rug pulls, fake airdrops, pump and dump schemes, and more.',
      canonicalUrl: '',
    },
  },
  {
    title: 'SMS Scams Are on the Rise: Stay Protected',
    slug: 'sms-scams-are-on-the-rise',
    excerpt: 'Smishing — SMS phishing — is exploding as scammers shift from email to text messages. Learn to spot fake delivery alerts, bank fraud warnings, and other text-based scams.',
    content: `Smishing (SMS phishing) attacks have surged dramatically in recent years. Scammers send text messages that appear to come from trusted sources — banks, shipping companies, government agencies — tricking recipients into clicking malicious links or sharing personal information.

## Why SMS Scams Are Growing

Text messages feel more personal and urgent than email. People are conditioned to read and respond to texts quickly. Scammers exploit this by sending messages that appear to come from known contacts or trusted institutions. Unlike email, SMS lacks built-in spam filtering on many devices, making it easier for scam messages to reach your inbox.

## Common SMS Scam Types

**Fake Delivery Notifications.** "Your package could not be delivered. Click here to reschedule." These messages impersonate USPS, FedEx, UPS, or DHL. The link leads to a fake website that steals your personal information or installs malware.

**Bank Fraud Alerts.** "Suspicious transaction detected on your account. Verify now or your account will be frozen." Scammers spoof bank phone numbers to make the message appear in the same thread as legitimate bank texts.

**Government Impersonation.** Fake messages claiming to be from the IRS, Social Security Administration, or other agencies threaten legal action if you do not pay immediately or call a provided number.

**"Hi Mum" / Family Emergency Scams.** Scammers pretend to be a family member who has lost their phone and needs money urgently sent to a new account. They exploit your concern for loved ones to bypass critical thinking.

**Fake Job Offers.** Unsolicited texts offering high-paying remote jobs with minimal effort. These often lead to "task scams" where you complete small paid tasks, then are asked to deposit your own money for "premium" tasks — which you never get back.

## How to Protect Yourself

1. **Never click links in unsolicited texts.** If you receive a delivery notification, go directly to the carrier's website rather than clicking the link.
2. **Verify through official channels.** If a text claims to be from your bank, call the number on the back of your card, not any number in the text.
3. **Do not respond.** Even replying "STOP" can confirm your number is active, leading to more scam messages.
4. **Report smishing attempts.** Forward suspicious texts to 7726 (SPAM) on most carriers. In the US, report to the FTC at reportfraud.ftc.gov.
5. **Use call and text blocking apps.** Apps like Nomorobo, Hiya, or your carrier's spam blocking service can filter many scam messages.

## What to Do If You Fell for a Smishing Scam

If you clicked a link or provided information: immediately contact your bank and credit card companies, change passwords on affected accounts, enable 2FA, and monitor your accounts for unusual activity. Consider freezing your credit if you provided your Social Security number.

Remember: legitimate organizations do not ask for sensitive information via text message. When in doubt, verify through a trusted channel.`,
    category: 'Scam Alert',
    tags: ['smishing', 'SMS scams', 'phishing', 'text scams', 'cybersecurity'],
    author: 'TrustLens Security Team',
    seo: {
      metaTitle: 'SMS Scams Are on the Rise: Stay Protected | TrustLens',
      metaDescription: 'Smishing attacks are exploding. Learn to spot fake delivery alerts, bank fraud texts, and other SMS scams before they trick you.',
      canonicalUrl: '',
    },
  },
];

async function seedBlog() {
  await mongoose.connect(config.mongodbUri);
  let created = 0;
  for (const post of posts) {
    const existing = await BlogPost.findOne({ slug: post.slug });
    if (existing) {
      console.log(`Skipping "${post.title}" — already exists`);
      continue;
    }
    await BlogPost.create({
      ...post,
      isPublished: true,
      publishedAt: new Date(post.slug === 'how-to-spot-phishing-emails' ? '2024-12-15' : post.slug === 'crypto-scams-what-to-look-for' ? '2024-12-12' : '2024-12-10'),
    });
    console.log(`Created "${post.title}"`);
    created++;
  }
  console.log(`Done. ${created} blog post(s) created.`);
  await mongoose.disconnect();
}

seedBlog().catch((err) => {
  console.error(err);
  process.exit(1);
});
