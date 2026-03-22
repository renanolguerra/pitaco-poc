import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend();
  return resend.emails.send({
    from: "Pitaco <noreply@pitaco.app>",
    to: email,
    subject: "Bem-vindo ao Pitaco! 🎉",
    html: `<h1>Olá, ${name}!</h1><p>Seu trial de 14 dias começou. Explore o Pitaco e dê seu pitaco nos roadmaps!</p>`,
  });
}
