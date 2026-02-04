# Vercel Usage Optimalisatie

Dit document beschrijft alle optimalisaties die zijn geïmplementeerd om het Vercel-gebruik te minimaliseren.

## ✅ Geïmplementeerde Optimalisaties

### 1. **Caching Headers (vercel.json)**
- **Static Assets** (images, fonts, etc.): `max-age=31536000` (1 jaar)
- **Build Assets** (JS, CSS): `max-age=31536000` (1 jaar) 
- **HTML/XML**: `max-age=3600` (1 uur) met `must-revalidate`

Dit zorgt ervoor dat browsers assets lang cachen en niet telkens opnieuw downloaden.

### 2. **Build Optimalisaties (vite.config.ts)**
- ✅ **Esbuild minification**: Code wordt gecomprimeerd (sneller dan terser)
- ✅ **Console.log removal**: Alle console.logs worden verwijderd in productie
- ✅ **CSS minification**: CSS wordt gecomprimeerd
- ✅ **CSS code splitting**: CSS wordt gesplitst per component
- ✅ **Optimized chunk splitting**: Vendor chunks worden gescheiden
- ✅ **Source maps disabled**: Geen source maps in productie (bespaart ruimte)

### 3. **Image Lazy Loading**
- ✅ Alle images hebben `loading="lazy"` attribuut
- ✅ `decoding="async"` voor betere performance
- Images worden alleen geladen wanneer ze in viewport komen

### 4. **Manual Chunk Splitting**
- Vendor chunks (React, React-DOM)
- Three.js chunks (grote library)
- Motion chunks (Framer Motion)
- i18n chunks (internationalisatie)

Dit zorgt voor betere caching en parallel loading.

## 📦 Image Optimalisatie (Handmatig)

### Huidige Image Sizes:
- `parksports.png`: **2952.96 KB** ⚠️ (moet gecomprimeerd worden!)
- `vijverstofzuigers.png`: **1182.36 KB** ⚠️
- `portfolio.png`: **607.93 KB** ⚠️
- `corridor.png`: **497.73 KB** ⚠️
- `room.png`: **409.93 KB** ⚠️
- `immogen.png`: **372.22 KB** ⚠️
- `Mind_Map-removebg-preview.png`: **115.83 KB**
- `me.jpg`: **22.67 KB** ✅
- `290735.png`: **19.15 KB** ✅

### Aanbevolen Acties:

1. **Comprimeer grote images** met tools zoals:
   - [TinyPNG](https://tinypng.com/) - Gratis online tool
   - [Squoosh](https://squoosh.app/) - Google's image compressor
   - [ImageOptim](https://imageoptim.com/) - Mac app
   - [Sharp](https://sharp.pixelplumbing.com/) - CLI tool

2. **Converteer naar WebP** waar mogelijk:
   ```bash
   # Met Sharp (Node.js)
   npx sharp-cli input.png --output input.webp --webp
   ```

3. **Gebruik responsive images**:
   - Verschillende sizes voor mobile/desktop
   - Gebruik `srcset` attribuut

4. **Target sizes**:
   - Portfolio project images: Max 200-300 KB per image
   - Hero images: Max 500 KB
   - Thumbnails: Max 50-100 KB

### Image Compression Script (Optioneel)

Je kunt een script toevoegen om images automatisch te comprimeren:

```bash
# Install sharp-cli
npm install --save-dev sharp-cli

# Compress alle PNG images
npx sharp-cli public/projects/*.png --output public/projects/ --webp --quality 80
```

## 🚀 Aanvullende Optimalisaties

### CDN & Edge Caching
Vercel gebruikt automatisch:
- ✅ Edge Network (wereldwijde CDN)
- ✅ Automatic compression (gzip/brotli)
- ✅ HTTP/2 & HTTP/3 support

### API Route Caching
Als je API routes hebt, zorg ervoor dat ze caching headers hebben:
```typescript
// Voorbeeld API route
export async function GET(request: Request) {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

### Static Generation
- ✅ Alle pagina's zijn statisch gegenereerd waar mogelijk
- ✅ Geen server-side rendering overhead

## 📊 Monitoring

### Vercel Analytics
Monitor je usage in Vercel Dashboard:
- **Bandwidth**: Totaal data transfer
- **Function Invocations**: Serverless function calls
- **Edge Requests**: CDN requests

### Optimalisatie Checklist
- [x] Caching headers geconfigureerd
- [x] Build optimalisaties geactiveerd
- [x] Image lazy loading geïmplementeerd
- [x] Code minification actief
- [ ] Images gecomprimeerd (handmatig)
- [ ] WebP format gebruikt waar mogelijk
- [ ] Responsive images geïmplementeerd

## 🔧 Volgende Stappen

1. **Comprimeer grote images** (hoogste prioriteit!)
   - Focus op `parksports.png` (3MB → target: <300KB)
   - Comprimeer alle project images

2. **Overweeg WebP format**:
   - Modern browsers ondersteunen WebP
   - 25-35% kleinere file sizes
   - Fallback naar PNG voor oude browsers

3. **Monitor usage**:
   - Check Vercel dashboard wekelijks
   - Identificeer welke assets het meeste bandwidth gebruiken

4. **Overweeg external CDN** (optioneel):
   - Cloudinary voor image optimization
   - Imgix voor advanced image processing

## 💡 Tips

- **Test na compressie**: Zorg dat images nog steeds goed eruit zien
- **Progressive JPEG**: Gebruik progressive JPEG voor grote images
- **SVG waar mogelijk**: Gebruik SVG voor icons en simpele graphics
- **Lazy load everything**: Niet alleen images, maar ook andere heavy assets

## 📝 Notes

- Vercel comprimeert automatisch assets tijdens build
- Edge caching zorgt voor snellere response times
- Bandwidth wordt alleen geteld bij eerste request (daarna cached)
- Static assets worden geserveerd vanaf edge locations
