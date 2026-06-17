import { ShieldAlert, Smartphone, Banknote, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TIPS = [
  {
    icon: Smartphone,
    title: "Easypaisa & JazzCash Scams",
    body: "Never share your mobile wallet PIN or dial codes given by callers claiming to be agents. Banks and telcos never ask for your PIN over a call.",
  },
  {
    icon: Banknote,
    title: "Fake Investment Schemes",
    body: "Guaranteed high returns with no risk don't exist. Verify any investment platform with SECP before sending money.",
  },
  {
    icon: Link2,
    title: "Phishing Links",
    body: "Check URLs carefully — banks use official domains only. Never enter your CVV, OTP, or card number on a link from an SMS.",
  },
  {
    icon: ShieldAlert,
    title: "Pressure Tactics",
    body: "Scammers create urgency ('act within 24 hours') to stop you from thinking clearly. Pause, verify independently, then act.",
  },
];

export function SafetyTips() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <h2 className="mb-6 text-center text-xl font-semibold tracking-tight">
        Pakistan Scam Awareness
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {TIPS.map((tip) => (
          <Card key={tip.title}>
            <CardContent className="flex gap-3.5 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20">
                <tip.icon className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
