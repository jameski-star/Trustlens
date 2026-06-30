export interface EmailIntel {
  provider?: string;
  isDisposable: boolean;
  isFreeProvider: boolean;
  isCustomDomain: boolean;
  organization?: string;
}

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'throwaway.com', 'yopmail.com', 'sharklasers.com', 'grr.la',
  'maildrop.cc', 'getairmail.com', 'trashmail.com', 'mailnator.com',
  'dispostable.com', 'temp-mail.org', 'temp-mail.ru', 'fakeinbox.com',
  'mailexpire.com', 'spamgourmet.com', 'mintemail.com', 'spambox.com',
  'mytrashmail.com', 'trash2009.com', 'maileater.com', 'kaspop.com',
  'dontreg.com', 'mailnull.com', 'sneakemail.com', 'emailias.com',
  'spamhole.com', 'nervmich.net', 'nobulk.com', 'nospamfor.us',
  'spamcon.org', 'spamday.com', 'spamhereplease.com', 'spammehere.com',
  'spamspot.com', 'thankyou2010.com', 'uggsrock.com', 'wuzup.net',
  'veryrealemail.com', 'zippymail.com', 'mailmetrash.com', 'gzb.ro',
  'rcpt.at', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'spamavert.com', 'spamfree24.org', 'spamfree24.de', 'spamfree24.eu',
  'spamfree24.net', 'spamfree24.org', 'spamfree24.info',
  'jetable.com', 'jetable.net', 'jetable.org', 'moncourrier.fr.nf',
  'casino.com', 'dynu.net', 'mailcatch.com', 'mailmetrash.com',
  'debugmail.com', 'devnullmail.com', 'emailondeck.com',
  'mail-tester.com', 'mailsac.com', 'mailtrap.io', 'moakt.com',
  'spambog.com', 'spambob.com', 'spambob.net', 'spambob.org',
  'spambog.net', 'spambog.ru', 'spambox.us', 'tempinbox.com',
  'temporaryemail.net', 'temporaryforwarding.com', 'tempr.email',
  '20minutemail.com', '30minutemail.com', '60minutemail.com',
  '2prong.com', 'anonbox.net', 'bouncr.com', 'burnermail.io',
  'byom.de', 'chacuo.net', 'ckptr.com', 'correotemporal.org',
  'cuvox.de', 'dandikmail.com', 'dayrep.com', 'emailfake.com',
  'emailgo.de', 'emaillime.com', 'emailn.de', 'emailtmp.com',
  'fakemailgenerator.com', 'fakemail.net', 'faketemporary.com',
  'filzmail.com', 'foobarbot.net', 'frapmail.com', 'garrymccooey.com',
  'generator.email', 'getnada.com', 'gettempmail.com', 'gmx.co.uk',
  'googuu.xyz', 'guerrillamail.net', 'guerrillamail.org',
  'haltospam.com', 'hotmailproduct.com', 'ijustspam.com',
  'inkmaze.com', 'insorgmail.info', 'ipoo.org', 'irish2me.com',
  'kabinc.com', 'klassmaster.com', 'klassmaster.net', 'kulturbetrieb.info',
  'lookugly.com', 'lopl.co.cc', 'lortemail.dk', 'mail-filter.com',
  'mail107.net', 'mail114.net', 'mail666.ru', 'mailabook.com',
  'mailbiz.biz', 'mailblocks.com', 'mailbucket.org', 'mailcat.biz',
  'mailhaven.com', 'mailhood.com', 'mailimate.com', 'mailinator2.com',
  'mailismagic.com', 'mailme.ir', 'mailmetrash.com', 'mailmoat.com',
  'mailnator.com', 'mailorg.org', 'mailpick.biz', 'mailquack.com',
  'mailsac.com', 'mailshiv.com', 'mailtemp.net', 'maktap.com',
  'mbx.cc', 'mega.zap', 'meinspamschutz.de', 'meltmail.com',
  'messagebeamer.de', 'mierdamail.com', 'moburl.com', 'mrpost.com',
  'mycleaninbox.net', 'mymail-in.net', 'mymailoasis.com', 'mytempemail.com',
  'mytempmail.com', 'negated.com', 'neomailbox.com', 'nepwk.com',
  'nincsmail.com', 'nobulk.com', 'nobuma.com', 'nomail.pw',
  'nospamfor.us', 'nospamthanks.info', 'nowmymail.com', 'objectmail.com',
  'odnorazovoe.ru', 'one-time.email', 'oneoffemail.com', 'ontheweb.com',
  'opayq.com', 'ordinaryamerican.net', 'otherinbox.com', 'outmail.win',
  'outmore.info', 'pookmail.com', 'privacy-guard.com', 'punkass.com',
  'putthisinyourspamdatabase.com', 'quickinbox.com', 'receiveee.com',
  'reliable-mail.com', 'rhyta.com', 'royal.net', 'runbox.com',
  'safetymail.info', 'sastagi.com', 'saynotospams.com', 'selfdestructingmail.com',
  'sharklasers.com', 'shiftmail.com', 'sinnlos-mail.de', 'slaskpost.se',
  'slopsbox.com', 'smsforum.net', 'sneakemail.com', 'sofimail.com',
  'spam4.me', 'spamail.de', 'spamarrest.com', 'spamaway.info',
  'spamcon.org', 'spamenless.com', 'spamex.com', 'spamfree24.org',
  'spamgel.de', 'spamgoes.in', 'spamherelots.com', 'spamjag.cf',
  'spaml.de', 'spammotel.com', 'spamobox.com', 'spamslicer.com',
  'spamspame.com', 'spamspot.com', 'spamstack.net', 'spamthisplease.com',
  'spamtrail.com', 'spamtroll.net', 'speed.1s.fr', 'spoofmail.de',
  'stopdropandroll.com', 'stuffmail.de', 'su10.de', 'suremail.info',
  'temp-mail.com', 'temp-mail.de', 'temp-mail.org', 'tempail.com',
  'tempemail.com', 'tempemail.net', 'tempemail.org', 'tempinbox.co.uk',
  'tempinbox.com', 'tempmail.co', 'tempmail.de', 'tempmail.eu',
  'tempmail.it', 'tempmail.us', 'tempmail2.com', 'tempmaildemo.com',
  'tempmailer.com', 'tempmailer.de', 'temporaryemail.us',
  'temporaryforwarding.com', 'temporaryinbox.com', 'thankyou2010.com',
  'thisisnotmyrealemail.com', 'thraml.com', 'throwaway.email',
  'throwaway.com', 'trash2009.com', 'trashdevil.com', 'trashdevil.de',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.ws',
  'trashymail.com', 'trashymail.net', 'tyldd.com', 'uggsrock.com',
  'umpire.com', 'upliftnow.com', 'upozowas.life', 'vegemail.com',
  'verifymail.win', 'veryrealemail.com', 'viewcastmedia.com',
  'viewcastmedia.net', 'viralemail.org', 'vomoto.com', 'vpnmail.win',
  'walala.org', 'walkmail.net', 'walkmail.ru', 'webemail.me',
  'weg-werf-mail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'wh4f.org', 'whyspam.me', 'willselfdestruct.com', 'winemaven.info',
  'wronghead.com', 'wuzup.net', 'xagloo.com', 'xemaps.com',
  'xents.com', 'xmaily.com', 'xpag.es', 'xoxy.net', 'yep.it',
  'yogamaven.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'ypmail.webarnak.fr.eu.org', 'yuurok.com', 'zehnminutenmail.de',
  'zippymail.info', 'zoaxe.com', 'zoemail.org',
]);

const FREE_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.fr', 'outlook.de',
  'live.com', 'live.fr', 'live.de', 'live.co.uk', 'msn.com',
  'aol.com', 'aol.co.uk',
  'protonmail.com', 'proton.me', 'pm.me',
  'icloud.com', 'me.com',
  'mail.com', 'email.com',
  'yandex.com', 'yandex.ru',
  'gmx.com', 'gmx.de', 'gmx.co.uk', 'gmx.fr',
  'tutanota.com', 'tutanota.de',
  'zoho.com', 'zohomail.com',
  'fastmail.com', 'fastmail.fm',
  'mail.ru', 'bk.ru', 'list.ru', 'inbox.ru',
  'web.de', 'webmail.de',
  'online.de', 'freenet.de', 't-online.de',
  'libero.it', 'virgilio.it', 'tin.it',
  'orange.fr', 'wanadoo.fr', 'sfr.fr', 'free.fr', 'laposte.net',
  'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com',
  'rediffmail.com', 'indiatimes.com',
  'bol.com.br', 'uol.com.br', 'terra.com.br',
  'naver.com', 'daum.net', 'nate.com',
  'wp.pl', 'o2.pl', 'interia.pl', 'onet.pl',
  'seznam.cz', 'atlas.cz',
  'centrum.cz', 'post.cz',
]);

const MAJOR_PROVIDERS: Record<string, string> = {
  'gmail.com': 'Google Gmail',
  'googlemail.com': 'Google Gmail',
  'yahoo.com': 'Yahoo Mail',
  'yahoo.co.uk': 'Yahoo Mail',
  'hotmail.com': 'Microsoft Hotmail/Outlook',
  'hotmail.co.uk': 'Microsoft Hotmail/Outlook',
  'outlook.com': 'Microsoft Outlook',
  'outlook.fr': 'Microsoft Outlook',
  'outlook.de': 'Microsoft Outlook',
  'live.com': 'Microsoft Live',
  'msn.com': 'Microsoft MSN',
  'aol.com': 'AOL Mail',
  'aol.co.uk': 'AOL Mail',
  'protonmail.com': 'Proton Mail',
  'proton.me': 'Proton Mail',
  'pm.me': 'Proton Mail',
  'icloud.com': 'Apple iCloud',
  'me.com': 'Apple iCloud',
  'mail.com': 'Mail.com',
  'yandex.com': 'Yandex Mail',
  'yandex.ru': 'Yandex Mail',
  'gmx.com': 'GMX Mail',
  'gmx.de': 'GMX Mail',
  'gmx.co.uk': 'GMX Mail',
  'tutanota.com': 'Tutanota',
  'zoho.com': 'Zoho Mail',
  'fastmail.com': 'Fastmail',
  'fastmail.fm': 'Fastmail',
  'mail.ru': 'Mail.ru',
  'web.de': 'Web.de',
  'freenet.de': 'Freenet',
  'orange.fr': 'Orange',
  'free.fr': 'Free',
  'laposte.net': 'La Poste',
  'qq.com': 'Tencent QQ Mail',
  '163.com': 'NetEase 163',
  '126.com': 'NetEase 126',
  'sina.com': 'Sina Mail',
  'rediffmail.com': 'Rediffmail',
  'naver.com': 'Naver Mail',
  'daum.net': 'Daum Mail',
  'wp.pl': 'WP Poczta',
  'o2.pl': 'O2 Poczta',
  'seznam.cz': 'Seznam',
};

export function getEmailIntel(email: string): EmailIntel {
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isDisposable: false, isFreeProvider: false, isCustomDomain: false };
  }

  const domain = parts[1].toLowerCase().trim();
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isFreeProvider = FREE_PROVIDERS.has(domain);
  const provider = MAJOR_PROVIDERS[domain] || (isFreeProvider ? domain : undefined);
  const isCustomDomain = !isFreeProvider && !isDisposable;

  let organization: string | undefined;
  if (domain.endsWith('.gov') || domain.endsWith('.gov.uk') || domain.endsWith('.gov.au') ||
      domain.endsWith('.go.ke') || domain.endsWith('.gov.za') || domain.endsWith('.gov.ng')) {
    organization = 'Government';
  } else if (domain.endsWith('.edu') || domain.endsWith('.ac.ke') || domain.endsWith('.ac.za') ||
             domain.endsWith('.ac.ng') || domain.endsWith('.ac.uk') || domain.endsWith('.edu.au')) {
    organization = 'Educational';
  } else if (domain.endsWith('.org') || domain.endsWith('.org.uk') || domain.endsWith('.or.ke')) {
    organization = 'Non-Profit Organization';
  } else if (domain.endsWith('.mil')) {
    organization = 'Military';
  }

  return { provider, isDisposable, isFreeProvider, isCustomDomain, organization };
}
