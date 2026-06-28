declare module 'whois-json' {
  interface WhoisResult {
    domainName?: string;
    registrar?: string;
    creationDate?: string;
    created?: string;
    expirationDate?: string;
    updatedDate?: string;
    country?: string;
    org?: string;
    [key: string]: unknown;
  }

  function whois(domain: string): Promise<WhoisResult>;
  export default whois;
}
