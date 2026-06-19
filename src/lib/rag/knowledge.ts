export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: "easypaisa-jazzcash-agent",
    title: "Fake Easypaisa/JazzCash agent scam",
    content:
      "Scammer calls or texts claiming to be an Easypaisa or JazzCash agent and asks the victim to dial a USSD code (like *786#) or share the OTP/PIN sent to their phone, claiming it's needed to 'verify', 'activate', or 'reverse' a transaction. In reality this hands the scammer full control of the wallet. Real telecom/wallet agents never ask for your PIN or OTP over a call.",
  },
  {
    id: "wrong-number-transfer",
    title: "Accidental transfer / wrong number reversal scam",
    content:
      "Victim receives an SMS saying money was 'mistakenly' sent to their Easypaisa/JazzCash/bank account, followed by a call asking them to send it back to a different number or dial a reversal code. The original 'transfer' never happened — it's a fake notification designed to trick the victim into voluntarily sending their own real money.",
  },
  {
    id: "fake-prize-lottery",
    title: "Fake prize / lottery winner scam",
    content:
      "Message claims the recipient has won a lottery, prize draw, SIM/lucky draw, or has been 'selected' for a reward, and asks them to pay a 'processing fee', 'tax', or 'release charge' before receiving it, or to click a link to claim it. Legitimate prizes never require upfront payment to release winnings.",
  },
  {
    id: "investment-guaranteed-returns",
    title: "Fake investment scheme with guaranteed returns",
    content:
      "Offer promises guaranteed, risk-free, or unusually high returns (e.g. double your money, 300% profit) on an investment, often via WhatsApp groups or unregistered platforms. All real investments carry risk; guaranteed high returns with no risk is a hallmark of Ponzi/investment fraud. Victims should verify the platform is registered with SECP (Securities and Exchange Commission of Pakistan) before sending any money.",
  },
  {
    id: "bank-phishing-sms",
    title: "Bank/card phishing SMS",
    content:
      "SMS impersonates a bank (HBL, UBL, Meezan, etc.) claiming the account is suspended, blocked, or needs urgent 'verification', with a link to a fake login page that steals card number, CVV, or online banking credentials. Look-alike domains (e.g. 'hbl-verify.com', shortened links like bit.ly) are red flags. Banks never ask for CVV, OTP, or full card number via SMS link.",
  },
  {
    id: "job-offer-advance-fee",
    title: "Fake job offer / advance fee scam",
    content:
      "Victim is offered a job (often abroad or remote/work-from-home) and asked to pay an 'advance fee', 'visa processing charge', or 'training fee' before starting. Legitimate employers do not require candidates to pay money to get hired.",
  },
  {
    id: "otp-pin-harvesting",
    title: "OTP/PIN harvesting via social engineering",
    content:
      "Caller poses as a bank, telecom, or government representative and creates urgency (account will be blocked, SIM will be deactivated) to pressure the victim into reading out an OTP or PIN that was just sent to their phone. The OTP is then used to authorize a transaction or account takeover in real time. No legitimate organization ever needs you to read an OTP back to them.",
  },
  {
    id: "online-marketplace-scam",
    title: "Online marketplace / OLX advance payment scam",
    content:
      "Buyer or seller on an online marketplace (OLX, Facebook Marketplace) asks the other party to pay an advance via Easypaisa/JazzCash 'to confirm the deal' or to share a code received via SMS to 'complete the courier/payment'. Sharing that code (often a refund/cash-out PIN) lets the scammer withdraw money rather than send it.",
  },
  {
    id: "sim-swap-deactivation",
    title: "SIM deactivation / re-verification threat",
    content:
      "Message or call claims the recipient's SIM card will be deactivated within 24 hours unless they share personal details, CNIC, or call a number to 're-verify' via PTA (Pakistan Telecommunication Authority). This is used to harvest CNIC and personal data or to manipulate the victim into a SIM-swap-enabling action. PTA does not deactivate SIMs via SMS link or demand verification calls like this.",
  },
  {
    id: "donation-charity-scam",
    title: "Fake charity/donation scam",
    content:
      "Message asks for urgent donations for a disaster, medical emergency, or religious cause, directing funds to a personal mobile wallet number rather than a verified charity account. Legitimate charities provide registered bank details and receipts, not personal wallet numbers with urgency pressure.",
  },
  {
    id: "pressure-urgency-tactics",
    title: "General pressure and urgency tactics",
    content:
      "Common scam pattern: creating time pressure ('act within 24 hours', 'limited slots', 'before it's too late') to prevent the victim from thinking clearly, verifying independently, or consulting someone else before acting. Genuine offers and institutions rarely require irreversible action within minutes or hours.",
  },
  {
    id: "courier-customs-fee",
    title: "Fake courier/customs fee scam",
    content:
      "Message claims a package is held at customs or with a courier (TCS, Leopards, international post) and a small 'clearance fee' or 'customs duty' must be paid via mobile wallet to release it, often with a link to a fake tracking/payment page. Real customs/courier fees are paid through official, verifiable channels, not personal wallet transfers from a link in an SMS.",
  },
];
