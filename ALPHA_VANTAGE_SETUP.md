# Alpha Vantage API Setup Instructies

## Stap 1: API Key Aanmaken
1. Ga naar [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Vul het formulier in met je naam en email
3. Klik op "GET FREE API KEY"
4. Check je email en bevestig je account
5. Kopieer je **API Key** (ziet eruit als: `ABC123XYZ456`)

## Stap 2: Environment Variable Instellen
Maak een `.env` bestand aan in de root van je project (of voeg toe aan bestaand `.env` bestand):

```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**Belangrijk:** Vervang `your_api_key_here` met je echte API key van Alpha Vantage.

## Stap 3: Development Server Herstarten
Na het toevoegen van de environment variable, herstart je development server:

```bash
npm run dev
```

## Stap 4: Testen
1. Ga naar de `/beleggen` pagina
2. Je zou een loading indicator moeten zien terwijl data wordt opgehaald
3. Na enkele seconden zou je real-time data moeten zien voor:
   - NVIDIA (NVDA)
   - S&P 500 (SPY)
   - Vastgoed REIT (VNQ)
   - Obligaties (BND)
   - Goud (XAU/USD)

## Rate Limiting
Alpha Vantage gratis tier heeft de volgende beperkingen:
- **5 API calls per minuut**
- **500 API calls per dag**

De applicatie respecteert automatisch deze limieten door 12 seconden te wachten tussen elke API call.

## Ondersteunde Investeringen

### Real-time Data (via Alpha Vantage):
- ✅ NVIDIA (NVDA) - Tech aandelen
- ✅ S&P 500 (SPY) - Index ETF
- ✅ Vastgoed REIT (VNQ) - Real Estate Investment Trust
- ✅ Obligaties (BND) - Bond ETF
- ✅ Goud (XAU/USD) - Currency exchange rate

### Mock Data (Alpha Vantage ondersteunt niet):
- ⚠️ Bitcoin (BTC) - Cryptocurrency wordt niet ondersteund door Alpha Vantage

## Troubleshooting

### "Alpha Vantage API Key niet geconfigureerd"
- Controleer of je `.env` bestand bestaat in de root van het project
- Controleer of de variabele naam exact is: `VITE_ALPHA_VANTAGE_API_KEY`
- Herstart je development server na het toevoegen van de variabele
- Zorg ervoor dat er geen spaties zijn rond de `=` in je `.env` bestand

### "API call frequency limit reached"
- Je hebt de rate limit bereikt (5 calls/minuut)
- Wacht 1 minuut en refresh de pagina
- Of upgrade naar een betaald Alpha Vantage plan voor hogere limieten

### "Error Message" in de response
- Controleer of je API key geldig is
- Controleer of het symbool correct is (bijv. 'NVDA' niet 'NVIDIA')
- Sommige symbolen zijn mogelijk niet beschikbaar in Alpha Vantage

### Data wordt niet geladen
- Controleer de browser console voor error messages
- Controleer of je internetverbinding werkt
- Alpha Vantage API kan soms traag zijn, wacht even en refresh

## Alternatieve Data Bronnen

Als Alpha Vantage niet werkt of je wilt andere data bronnen gebruiken:

1. **Yahoo Finance API** (unofficial) - Voor meer symbolen
2. **CoinGecko** - Voor cryptocurrency data (Bitcoin, etc.)
3. **ECB API** - Voor inflatie data
4. **FRED API** - Voor economische data

## Security Note

⚠️ **Belangrijk:** Zorg ervoor dat je `.env` bestand in `.gitignore` staat en niet wordt gecommit naar Git. Je API key is privé en mag niet gedeeld worden.
