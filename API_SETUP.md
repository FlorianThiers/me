# API Setup Instructies - Beleggingspagina

De beleggingspagina gebruikt meerdere gratis API's voor real-time financiële data. Hieronder vind je instructies voor elke API.

## 1. Alpha Vantage (Aandelen & Goud)

**Status:** Vereist API key

### Setup:
1. Ga naar [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Maak een gratis account aan
3. Kopieer je API key
4. Voeg toe aan `.env`:
   ```env
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

### Rate Limits:
- **Gratis tier:** 5 calls/minuut, 25 calls/dag
- **Ondersteunt:** Aandelen, ETFs, valuta (goud XAU/USD)

### Gebruikt voor:
- NVIDIA, S&P 500, Nasdaq 100, en alle andere ETFs
- Goud prijs (XAU/USD)

---

## 2. CoinGecko (Cryptocurrency)

**Status:** Geen API key nodig (gratis tier)

### Setup:
- Geen setup nodig! Werkt direct zonder API key.

### Rate Limits:
- **Gratis tier:** 10-50 calls/minuut
- **Geen dagelijkse limiet** voor basis endpoints

### Gebruikt voor:
- Bitcoin (BTC) - real-time prijs en 24h verandering

### Voordelen:
- Geen API key nodig
- Betrouwbare cryptocurrency data
- Kan uitgebreid worden naar andere crypto's (Ethereum, etc.)

---

## 3. FRED API (Inflatie Data)

**Status:** Optioneel - API key vereist

### Setup:
1. Ga naar [FRED API Key](https://fred.stlouisfed.org/docs/api/api_key.html)
2. Maak een gratis account aan
3. Kopieer je API key
4. Voeg toe aan `.env`:
   ```env
   VITE_FRED_API_KEY=your_fred_api_key_here
   ```

### Rate Limits:
- **Gratis tier:** Onbeperkt (geen limiet!)

### Gebruikt voor:
- Real-time inflatie percentages
- Historische inflatie data

### Voordelen:
- Onbeperkte calls
- Officiële data van Federal Reserve
- Zeer betrouwbaar

---

## 4. ExchangeRate-API (Valuta)

**Status:** Geen API key nodig (gratis tier)

### Setup:
- Geen setup nodig! Werkt direct zonder API key.

### Rate Limits:
- **Gratis tier:** 1,500 requests/maand
- **Geen API key nodig**

### Gebruikt voor:
- Valuta wisselkoersen (momenteel niet actief gebruikt, maar beschikbaar)

### Toekomstige toepassingen:
- Andere valuta's toevoegen
- Multi-currency support

---

## Overzicht API's

| API | API Key | Rate Limit | Gebruikt Voor |
|-----|---------|------------|---------------|
| **Alpha Vantage** | ✅ Vereist | 25/dag | Aandelen, ETFs, Goud |
| **CoinGecko** | ❌ Niet nodig | 10-50/min | Bitcoin/Crypto |
| **FRED** | ✅ Optioneel | Onbeperkt | Inflatie data |
| **ExchangeRate-API** | ❌ Niet nodig | 1500/maand | Valuta (toekomst) |

---

## Aanbevolen Setup

### Minimale Setup (werkt direct):
- ✅ CoinGecko - Bitcoin data (geen setup)
- ✅ ExchangeRate-API - Valuta (geen setup, toekomstig)

### Aanbevolen Setup (meeste data):
- ✅ Alpha Vantage API key - Voor alle aandelen/ETFs
- ✅ CoinGecko - Bitcoin (automatisch)
- ✅ FRED API key - Voor real-time inflatie (optioneel maar aanbevolen)

---

## Cache Gedrag

- **Cache duur:** 1 uur
- **Auto-fetch:** Uitgeschakeld (alleen bij handmatige refresh)
- **Cache locatie:** localStorage
- **Cache versie:** Automatisch gewist bij code updates

---

## Troubleshooting

### Alpha Vantage "25 requests per day"
- Gebruik de cache (1 uur)
- Klik alleen op "Ververs Data" wanneer nodig
- Overweeg premium plan voor meer calls

### CoinGecko werkt niet
- Check internetverbinding
- CoinGecko heeft soms downtime, gebruik dan mock data

### FRED API werkt niet
- Controleer of API key correct is geconfigureerd
- Zonder API key wordt default inflatie gebruikt (2.5%)

---

## Toekomstige Uitbreidingen

Mogelijke API's om toe te voegen:
- **Yahoo Finance (unofficial)** - Meer symbolen
- **Twelve Data** - Gratis tier beschikbaar
- **Polygon.io** - Gratis tier voor historische data
- **Finnhub** - Gratis tier voor real-time data
