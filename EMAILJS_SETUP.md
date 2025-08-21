# EmailJS Setup Instructies

## Stap 1: Account Aanmaken
1. Ga naar [EmailJS.com](https://www.emailjs.com/)
2. Maak een gratis account aan
3. Log in op je dashboard

## Stap 2: Email Service Instellen
1. Ga naar "Email Services" in je dashboard
2. Klik op "Add New Service"
3. Kies je email provider (Gmail, Outlook, etc.)
4. Volg de authenticatie stappen
5. Kopieer je **Service ID**

## Stap 3: Email Template Maken
1. Ga naar "Email Templates" in je dashboard
2. Klik op "Create New Template"
3. Gebruik deze template variabelen:
   - `{{from_name}}` - Naam van de afzender
   - `{{from_email}}` - Email van de afzender
   - `{{message}}` - Het bericht
   - `{{to_name}}` - Naam van de ontvanger
4. Kopieer je **Template ID**

## Stap 4: Public Key Kopiëren
1. Ga naar "Account" in je dashboard
2. Kopieer je **Public Key**

## Stap 5: Environment Variables Instellen
Maak een `.env` bestand aan in de root van je project:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## Stap 6: Testen
1. Start je development server opnieuw op
2. Test het contact formulier
3. Controleer of je emails ontvangt

## Belangrijke Opmerkingen
- De gratis versie van EmailJS heeft een limiet van 200 emails per maand
- Zorg ervoor dat je `.env` bestand niet in Git wordt gecommit
- Test altijd eerst in development voordat je naar productie gaat

## Troubleshooting
- **"Service not found"**: Controleer je Service ID
- **"Template not found"**: Controleer je Template ID
- **"Invalid public key"**: Controleer je Public Key
- **CORS errors**: Zorg ervoor dat je domain is toegevoegd aan EmailJS
