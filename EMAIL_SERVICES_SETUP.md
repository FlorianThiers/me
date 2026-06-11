# Email Services Setup - Alternatieven voor Resend

Omdat Resend max domains heeft bereikt, zijn hier alternatieven die je kunt gebruiken:

## 🚀 Aanbevolen: Web3Forms (Geen SMS nodig!)

**Perfect voor jouw situatie - geen SMS verificatie!**
- ✅ **Gratis** - geen limiet op aantal emails
- ✅ **Geen SMS verificatie** - alleen email nodig
- ✅ **Geen domain verificatie nodig**
- ✅ **Super simpel** - alleen een access key nodig
- ✅ Perfect voor portfolio sites

### Stap 1: Access Key Aanmaken

1. Ga naar [Web3Forms.com](https://web3forms.com)
2. Voer je email adres in (bijv. `florthiers@gmail.com`)
3. Klik op "Get Access Key"
4. Check je email en kopieer de access key (geen SMS nodig!)

### Stap 2: Environment Variables Toevoegen

Voeg toe aan je `.env` bestand:

```env
# Email Service Configuration
VITE_EMAIL_SERVICE=web3forms

# Web3Forms Configuration
VITE_WEB3FORMS_ACCESS_KEY=your-access-key-here
VITE_WEB3FORMS_TO_EMAIL=florthiers@gmail.com  # Optioneel, defaults naar je account email
```

**Klaar!** Web3Forms is de simpelste optie en werkt perfect zonder SMS.

---

## 📝 Alternatief 1: Formspree (Ook geen SMS!)

**Waarom Formspree?**
- ✅ **50 submissions/maand** gratis
- ✅ **Geen SMS verificatie** - alleen email
- ✅ Zeer simpel setup
- ✅ Goede spam protection

### Stap 1: Formspree Account Aanmaken

1. Ga naar [Formspree.io](https://formspree.io)
2. Klik op "Sign Up Free"
3. Maak een account aan (alleen email, geen SMS!)
4. Verifieer je email adres

### Stap 2: Nieuw Formulier Aanmaken

1. Klik op "New Form"
2. Geef het een naam (bijv. "Portfolio Contact")
3. Kopieer je Form ID (bijv. `xvgkqjpn`)

### Stap 3: Environment Variables Toevoegen

```env
# Email Service Configuration
VITE_EMAIL_SERVICE=formspree

# Formspree Configuration
VITE_FORMSPREE_FORM_ID=xvgkqjpn
```

**Klaar!** Formspree werkt ook zonder SMS.

---

## ⭐ Productie: Brevo (Sendinblue) — standaard op florian-tau.vercel.app

**Waarom Brevo?**
- ✅ **300 emails/dag** gratis
- ✅ **Geen domain limiet** op gratis tier
- ✅ API key blijft **server-side** via `/api/contact` (niet in de browser)

Account bestaat al (welcome-mails feb/mrt 2026 op `florthiers@gmail.com`).

### Stap 1: API key (als je die nog niet hebt)

1. [Brevo API Keys](https://app.brevo.com/settings/keys/api) → **Generate a new API key**
2. Naam: `portfolio-mandelbrot-contact`
3. Key kopiëren (één keer zichtbaar)

### Stap 2: Sender verifiëren

1. [Brevo Senders](https://app.brevo.com/settings/senders)
2. `florthiers@gmail.com` als sender — verifieer via de mail als dat nog niet gebeurd is

### Stap 3: Vercel environment variables

In het Vercel-project **florian-tau** (Production + Preview):

```env
VITE_EMAIL_SERVICE=brevo
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=florthiers@gmail.com
BREVO_TO_EMAIL=florthiers@gmail.com
```

`BREVO_*` zonder `VITE_` prefix — alleen de serverless route `/api/contact` leest die.

### `.env` en tokens die eindigen op `==`

Brevo MCP-tokens zijn base64 en eindigen vaak op `==`. Zet die **altijd tussen dubbele quotes**:

```env
BREVO_MCP_TOKEN="eyJhcGlfa2V5IjoiLi4uIn0=="
```

Zonder quotes kan een editor of parser de trailing `=` weglaten.

**Contactform** gebruikt de gewone REST-key (`xkeysib-...`), niet de MCP-wrapper — die heeft geen `==`:

```env
BREVO_API_KEY="xkeysib-..."
```

### Stap 4: Lokaal testen

```powershell
cd C:\Users\flort\MySpace\me
copy .env.example .env
# vul BREVO_API_KEY in .env
npx vercel dev
```

`npm run dev` alleen draait Vite; contactform test je best met `vercel dev` zodat `/api/contact` meedraait.

**Klaar!** Contactform op de site gebruikt Brevo via `/api/contact`.

---

## 📧 Alternatief 3: SendGrid - Vereist mogelijk SMS

**Waarom SendGrid?**
- ✅ **100 emails/dag** gratis
- ✅ Geen domain limiet
- ✅ Zeer betrouwbaar
- ✅ Goede documentatie

### Stap 1: SendGrid Account Aanmaken

1. Ga naar [SendGrid.com](https://sendgrid.com)
2. Klik op "Start for Free"
3. Maak een account aan
4. Verifieer je email adres

### Stap 2: API Key Aanmaken

1. Ga naar [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
2. Klik op "Create API Key"
3. Geef het een naam (bijv. "Portfolio Contact Form")
4. Kies "Full Access" of "Restricted Access" (alleen Mail Send)
5. Kopieer de API key (je ziet hem maar één keer!)

### Stap 3: Sender Email Verifiëren

1. Ga naar [SendGrid Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Klik op "Verify a Single Sender"
3. Vul je gegevens in en verifieer je email

### Stap 4: Environment Variables Toevoegen

```env
# Email Service Configuration
VITE_EMAIL_SERVICE=sendgrid

# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_SENDGRID_FROM_EMAIL=florthiers@gmail.com
VITE_SENDGRID_TO_EMAIL=florthiers@gmail.com
```

---

## 📊 Vergelijking

| Service | Gratis Tier | SMS Vereist? | Domain Limiet | Setup Moeilijkheid |
|---------|-------------|--------------|---------------|-------------------|
| **Web3Forms** ⭐ | Onbeperkt | ❌ Nee | Geen | ⭐ Zeer simpel |
| **Formspree** | 50/maand | ❌ Nee | Geen | ⭐ Zeer simpel |
| **Brevo** | 300/dag | ✅ Ja | Geen | ⭐⭐ Gemiddeld |
| **SendGrid** | 100/dag | ⚠️ Mogelijk | Geen | ⭐⭐ Gemiddeld |
| Resend | 3,000/maand | ❌ Nee | Max bereikt | ⭐⭐ Gemiddeld |

## 🎯 Mijn Aanbeveling (Zonder SMS)

Voor jouw situatie in Argentinië:
1. **Web3Forms** ⭐ - **Beste keuze!** Geen SMS, onbeperkt gratis, super simpel
2. **Formspree** - Ook geen SMS, maar 50/maand limiet (meer dan genoeg voor portfolio)
3. **Brevo** - Vereist SMS, skip deze als je geen SMS kunt ontvangen
4. **SendGrid** - Mogelijk SMS vereist, check eerst of het werkt

## 🔧 Service Wisselen

Je kunt eenvoudig wisselen tussen services door de `VITE_EMAIL_SERVICE` variabele te veranderen:

```env
VITE_EMAIL_SERVICE=web3forms    # Gebruik Web3Forms (aanbevolen, geen SMS!)
VITE_EMAIL_SERVICE=formspree    # Gebruik Formspree (ook geen SMS!)
VITE_EMAIL_SERVICE=brevo        # Gebruik Brevo (vereist SMS)
VITE_EMAIL_SERVICE=sendgrid    # Gebruik SendGrid (mogelijk SMS)
VITE_EMAIL_SERVICE=resend       # Gebruik Resend (als je nieuwe domain toevoegt)
```

## ⚠️ Belangrijk

- **API Keys zijn gevoelig** - voeg ze nooit toe aan git!
- Zorg dat je `.env` bestand in `.gitignore` staat
- Voor productie: overweeg een backend endpoint voor extra beveiliging

## 🐛 Troubleshooting

### "API key is not configured"
- Controleer of de variabele naam exact klopt (hoofdletters!)
- Herstart je development server na het toevoegen van environment variables

### "Failed to send email"
- Controleer of je account actief is
- Verifieer dat je sender email geverifieerd is
- Check de browser console (F12) voor meer details

### Emails komen niet aan
- Check je spam folder
- Verifieer dat je sender email correct is ingesteld
- Controleer de service dashboard voor delivery status
