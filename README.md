# Gázóra Leolvasás Alkalmazás
## Telepítési útmutató
Az alkalmazás telepítéséhez és futtatásához kövesd az alábbi lépéseket:
1. Klónozd a repozitóriumot a helyi gépedre
2. Navigálj a projekt könyvtárába: `cd webkert`
3. Telepítsd a függőségeket: `npm install`
4. Indítsd el a fejlesztői szervert: `ng serve`
5. Nyisd meg a böngészőben: `http://localhost:4200/`
## Feladatkritériumok teljesítése
## 2. mérföldkő
### Fordítási hiba nincs
- Az alkalmazás az `ng serve` parancs kiadásakor hiba nélkül fordul.
### Futtatási hiba nincs
- A böngésző konzol részében nem jelennek meg hibák használat közben.
### Adatmodell definiálása
Az alkalmazás 4 fő TypeScript interfészt használ a Firebase adatmodellezéshez:
1. **User** - `/src/app/shared/models/user.model.ts`
2. **GasMeter** - `/src/app/shared/models/gas-meter.model.ts`
3. **MeterReading** - `/src/app/shared/models/meter-reading.model.ts`
4. **Billing** - `/src/app/shared/models/billing.model.ts`
5. **GasMeterStatistics** és **MeterStatisticsSummary** - `/src/app/shared/models/gas-meter-statistics.model.ts`
### Reszponzív, mobile-first felület
- Az alkalmazás Mobile-first megközelítéssel lett fejlesztve
- Minden komponens reszponzív és megfelelően jelenik meg mobilon és asztali nézetben is
- A CSS media query-k biztosítják a különböző képernyőméretekhez való alkalmazkodást
### Attribútum direktívák használata
- `[formGroup]`, `[formControlName]` - Űrlapok kezeléséhez
- `[disabled]`, `[hidden]` - Gombok és elemek állapotának beállításához
- `[routerLink]` - Angular navigációhoz
- `[value]` - Értékek beállításához a form elemekben
- `[matDatepicker]` - Dátumválasztók kezeléséhez
### Beépített vezérlési folyamatok használata
- `@if`, `@else` - Feltételes megjelenítéshez
- `@for` - Listák és gyűjtemények megjelenítéséhez
- `@switch`, `@case` - Állapotok szerinti megjelenítéshez
### Adatátadás szülő és gyermek komponensek között
- **@Input dekorátorok:** `data`, `title` továbbítása a gyermek komponensnek
- **@Output dekorátorok:** `exportData`, `detailView` események továbbítása a szülő komponenseknek
- Például a **StatisticsComponent** és **ConsumptionSummaryComponent** közötti adatáramlás
### Material elemek használata
Az alkalmazásban több mint 10 különböző Material elem található:
1. `mat-icon` - Ikonok
2. `mat-card`, `mat-card-header`, `mat-card-title`, `mat-card-content` - Kártyák
3. `mat-form-field`, `mat-label` - Űrlap elemek
4. `mat-select`, `mat-option` - Legördülő választók
5. `mat-datepicker`, `mat-datepicker-toggle` - Dátumválasztók
6. `mat-button`, `mat-raised-button` - Gombok
7. `mat-error` - Hibaüzenetek megjelenítése
8. `mat-toolbar` - Fejléc
9. `mat-table` - Adattáblázatok
10. `mat-progress-spinner`, `mat-progress-bar` - Betöltési állapot jelzése
### Saját Pipe osztályok
1. `HungarianDatePipe` - `/src/app/shared/pipes/hungarian-date.pipe.ts`
   - A dátumokat magyar formátumban jeleníti meg
2. `ConsumptionFormatPipe` - `/src/app/shared/pipes/consumption-format.pipe.ts`
   - A fogyasztási adatokat megfelelő formátumban jeleníti meg
3. `TranslatePipe` - `/src/app/shared/pipes/translate.pipe.ts`
   - Fordítási funkciókat biztosít az alkalmazáson belül
### Adatbevitel Angular form-ok segítségével
Az alkalmazás több reaktív formot használ:
1. `readingForm` - Mérőállás rögzítéséhez a meter-reading komponensben
2. `profileForm` - Felhasználói profil szerkesztéséhez
3. `loginForm` és `registerForm` - Bejelentkezéshez és regisztrációhoz
4. Beépített form validációk és egyedi validátorok használata
### Lifecycle Hook-ok használata
- `ngOnInit()` - Számos komponensben használva az inicializáláshoz (pl. home.component.ts, meter-reading.component.ts)
- `ngOnDestroy()` - Feliratkozások megszüntetéséhez és erőforrások felszabadításához (pl. statistics.component.ts, profile.component.ts)
### CRUD műveletek
Az összes CRUD művelet megvalósult az alkalmazás fő entitásaihoz:
- **Create**: Új mérőállás rögzítése, új gázmérő létrehozása
- **Read**: Mérőállások listázása, gázmérő adatok lekérdezése
- **Update**: Mérőállások és gázmérő adatok frissítése
- **Delete**: Mérőállások és gázmérők törlése
### Service-ekbe kiszervezett CRUD műveletek
- `GasMeterService` - Gázmérők kezeléséhez
- `MeterReadingService` - Mérőállások kezeléséhez
- `BillingService` - Számlázási adatok kezeléséhez
- `AuthService` - Felhasználói hitelesítéshez
### Komplex Firestore lekérdezések
Az alkalmazás több komplexebb Firestore lekérdezést is használ:
1. **where feltétel**: Felhasználóhoz tartozó gázmérők szűrése
2. **orderBy**: Mérőállások rendezése dátum szerint
3. **limit**: Csak a legfrissebb adatok megjelenítése
4. **startAfter**: Lapozás megvalósítása a mérőállások listában
### Route-ok különböző oldalakhoz
Az alkalmazás 8 különböző route-ot definiál:
- `/` - Főoldal
- `/meter-reading` - Mérőállás rögzítése
- `/reading-list` - Mérőállások listázása
- `/statistics` - Statisztikai adatok megjelenítése
- `/profile` - Felhasználói profil
- `/settings` - Beállítások
- `/login` - Bejelentkezés
- `/register` - Regisztráció
### AuthGuard implementációja
- A `auth.guard.ts` fájlban implementált AuthGuard
- Bejelentkezés nélkül nem elérhetők a védett oldalak
- Sikertelen hitelesítés esetén átirányítás a login oldalra
### Route-ok levédése azonosítással
A legtöbb route védett AuthGuard segítségével:
- Főoldal
- Mérőállás rögzítése oldal
- Statisztikák oldal
- Profil oldal
- Beállítások oldal
Csak a bejelentkezés és regisztráció oldalak érhetők el hitelesítés nélkül.
## 1. mérföldkő
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
- Az alkalmazás Mobile-first megközelítéssel lett fejlesztve, ezt garantálják a Material elemek, illetve a manuális CSS felülírások (media query, stb.)
Például: A profile.component.css fájlban (82-104. sor) található media query-k biztosítják a reszponzív megjelenést:
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
