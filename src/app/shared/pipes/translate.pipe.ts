import { Pipe, PipeTransform } from '@angular/core';
interface Translations {
  [key: string]: string;
}
@Pipe({
  name: 'translate',
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  
  private translations: Translations = {
    
    'yes': 'Igen',
    'no': 'Nem',
    'save': 'Mentés',
    'cancel': 'Mégsem',
    'edit': 'Szerkesztés',
    'delete': 'Törlés',
    'back': 'Vissza',
    'next': 'Tovább',
    'loading': 'Betöltés...',
    'error': 'Hiba',
    'success': 'Sikeres',
    
    
    'login': 'Bejelentkezés',
    'logout': 'Kijelentkezés',
    'register': 'Regisztráció',
    'profile': 'Profil',
    'settings': 'Beállítások',
    'dashboard': 'Irányítópult',
    'home': 'Főoldal',
    'welcome': 'Üdvözöljük',
    
    
    'email': 'Email',
    'password': 'Jelszó',
    'name': 'Név',
    'address': 'Cím',
    'phone': 'Telefonszám',
    'date': 'Dátum',
    'time': 'Idő',
    'description': 'Leírás',
    'notes': 'Jegyzetek',
      
    'meter reading': 'Mérőóra leolvasás',
    'reading list': 'Leolvasások listája',
    'statistics': 'Statisztikák',
    'consumption': 'Fogyasztás',
    'bill': 'Számla',
    'meter': 'Mérőóra',
    'serial number': 'Gyári szám',
    'reading value': 'Mérőállás',
    'reading date': 'Leolvasás dátuma',
    'previous reading': 'Előző mérőállás',
    
    
    'required field': 'Kötelező mező',
    'invalid value': 'Érvénytelen érték',
    'save successful': 'Sikeres mentés',
    'delete successful': 'Sikeres törlés',
    'operation failed': 'A művelet sikertelen',
    'confirm delete': 'Biztosan törli?',
    'no data': 'Nincs megjeleníthető adat'
  };
  /**
   * Fordítási kulcszó alapján visszaadja a magyar megfelelőt.
   * Ha nincs fordítás, akkor visszaadja az eredeti kulcsszót.
   * 
   * @param key Fordítandó angol kulcsszó
   * @param params Opcionális paraméterek a fordításhoz
   * @returns Magyar fordítás vagy az eredeti kulcsszó
   */
  transform(key: string, params?: { [key: string]: string | number }): string {
    if (!key) return '';
    
    
    const lowerKey = key.toLowerCase();
    let translation = this.translations[lowerKey] || key;
    
    
    if (params) {
      Object.keys(params).forEach(param => {
        const placeholder = new RegExp(`\\{\\{\\s*${param}\\s*\\}\\}`, 'g');
        translation = translation.replace(placeholder, String(params[param]));
      });
    }
    
    return translation;
  }
}
