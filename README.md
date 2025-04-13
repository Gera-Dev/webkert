# Gázóra Leolvasás Alkalmazás

## Telepítési útmutató

Az alkalmazás telepítéséhez és futtatásához kövesd az alábbi lépéseket:

1. Klónozd a repozitóriumot a helyi gépedre
2. Navigálj a projekt könyvtárába: `cd webkert`
3. Telepítsd a függőségeket: `npm install`
4. Indítsd el a fejlesztői szervert: `ng serve`
5. Nyisd meg a böngészőben: `http://localhost:4200/`

## Feladatkritériumok teljesítése

### Fordítási hiba nincs
- Az alkalmazás az `ng serve` parancs kiadásakor hiba nélkül fordul.

### Futtatási hiba nincs
- A böngésző konzol részében nem jelennek meg hibák használat közben.

### Adatmodell definiálása
A következő TypeScript interfészek találhatók az alkalmazásban:
1. **User** - `/src/app/shared/models/user.model.ts` (1-11. sor)
2. **GasMeter** - `/src/app/shared/models/gas-meter.model.ts` (1-11. sor)
3. **MeterReading** - `/src/app/shared/models/meter-reading.model.ts` (1-12. sor)
4. **Billing** - `/src/app/shared/models/billing.model.ts` (1-14. sor)

### Alkalmazás felbontása megfelelő számú komponensre
Az alkalmazás a következő komponensekre van felosztva, amelyek egyike sem haladja meg a 250 sort TS és HTML kódban, valamint a 400 karaktert soronként:
- `app.component.ts/html`
- `home.component.ts/html`
- `meter-reading.component.ts/html`
- `profile.component.ts/html`
- `reading-list.component.ts/html`
- `statistics.component.ts/html`
- `consumption-summary.component.ts/html`
- `login.component.ts/html`
- `register.component.ts/html`

### Reszponzív, mobile-first felület
- A profile.component.css fájlban (82-104. sor) található media query-k biztosítják a reszponzív megjelenést:
```css
@media (min-width: 768px) {
  .meters-list {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: min-content;
  }
}

@media (min-width: 1024px) {
  .meters-list {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: min-content;
  }
}
```

### Attribútum direktívák használata
- `[formGroup]="readingForm"` - meter-reading.component.html (21. sor)
- `[disabled]="submitting"` - meter-reading.component.html (67. sor)
- `[routerLink]="['/']"` - meter-reading.component.html (66. sor)
- `[value]="meter.id"` - meter-reading.component.html (26. sor)
- `[matDatepicker]="picker"` - meter-reading.component.html (47. sor)

### Beépített vezérlési folyamatok használata
- `@if (loading)` - meter-reading.component.html (3. sor)
- `@if (!loading)` - meter-reading.component.html (9. sor)
- `@for (meter of gasMeters; track meter.id)` - home.component.html (24. sor)
- `@if (meter.lastReadingDate)` - home.component.html (30. sor)
- `@else` - home.component.html (34. sor)
- `@if (readings.length === 0)` - reading-list.component.html (53. sor)

### Adatátadás szülő és gyermek komponensek között
A projekten belül a **StatisticsComponent** (szülő komponens) és a **ConsumptionSummaryComponent** (gyermek komponens) között történik adatátadás:

#### @Input dekorátorok a gyermek komponensben
**Fájl:** `/src/app/components/statistics/consumption-summary/consumption-summary.component.ts` (21-23. sor)
```typescript
@Input() data: { month: string, consumption: number }[] = [];
@Input() title: string = 'Fogyasztási adatok';
```

#### @Output dekorátorok a gyermek komponensben
**Fájl:** `/src/app/components/statistics/consumption-summary/consumption-summary.component.ts` (26-27. sor)
```typescript
@Output() exportData = new EventEmitter<string>();
@Output() detailView = new EventEmitter<string>();
```

#### A komponensek összekapcsolása a szülő komponens HTML-ben
**Fájl:** `/src/app/components/statistics/statistics.component.html` (33-38. sor)
```html
<app-consumption-summary 
  [data]="monthlySummary"
  [title]="'Havi fogyasztás összesítő'"
  (exportData)="onExportData($event)"
  (detailView)="onDetailView($event)">
</app-consumption-summary>
```

#### Eseménykezelő metódusok a szülő komponensben
**Fájl:** `/src/app/components/statistics/statistics.component.ts`

**onExportData metódus** (174-207. sor)
- CSV fájl exportálása a mérőállás adatokból
- Az adatok előkészítése, fejléc és sorok generálása
- Fájl létrehozása és letöltése a felhasználó számára

```typescript
onExportData(format: string): void {
  this.snackBar.open(
    `Az adatok exportálása ${format} formátumban elkezdődött...`, 
    'Bezárás', 
    { duration: 3000 }
  );

  try {
    const exportData = this.prepareExportData();
    this.exportAsCSV(exportData);
  } catch (error) {
    this.snackBar.open(
      'Hiba történt az adatok exportálása közben!', 
      'Bezárás'
    );
  }
}
```

#### Az adatáramlás folyamata:
1. A `statistics.component.ts` elkészíti a `monthlySummary` adatot
2. Ezt az adatot átadja a gyermek komponensnek a `[data]` inputon keresztül
3. A felhasználó a gyermek komponens UI-ján interaktál (pl. exportálás gomb)
4. A gyermek komponens a `this.exportData.emit('csv')` segítségével értesíti a szülőt
5. A szülő komponens kezeli az eseményt a fent bemutatott `onExportData()` metódussal
6. A művelet eredményéről a felhasználó visszajelzést kap a felületen

### Material elemek használata
A meter-reading.component.html fájlban található Material elemek:
1. `<mat-icon>` (5, 67, 91. sor)
2. `<mat-card>` (10, 79. sor)
3. `<mat-card-header>` (11, 80. sor)
4. `<mat-card-title>` (12, 81. sor)
5. `<mat-card-subtitle>` (13. sor)
6. `<mat-card-content>` (18, 83. sor)
7. `<mat-form-field>` (22, 36, 46, 56. sor)
8. `<mat-label>` (23, 37, 47, 57. sor)
9. `<mat-select>` (24. sor)
10. `<mat-option>` (25. sor)
11. `<mat-error>` (28, 38, 41, 49. sor)
12. `<mat-datepicker>` (49. sor)
13. `<mat-datepicker-toggle>` (48. sor)
14. `<mat-button>` és `<mat-raised-button>` (66, 67. sor)

### Adatbeviteli Angular formok
1. `readingForm` a meter-reading.component.ts-ben
2. `profileForm` a profile.component.ts-ben
3. `loginForm` a login.component.ts-ben
4. `registerForm` a register.component.ts-ben

### Saját Pipe osztály
- `HungarianDatePipe` - `/src/app/shared/pipes/hungarian-date.pipe.ts` (3-24. sor)
- A pipe a dátumokat magyar formátumban jeleníti meg (ÉÉÉÉ. HH. NN.)
