# Lana stuudio: veebileht

Staatiline mitmeleheline veebileht (HTML + CSS + JS, ilma raamistiketa) eesti ja vene keeles.
Ava `index.html` brauseris või laadi kogu kaust üles mis tahes staatilisse hostingusse.

## Lehed

| Eesti | Vene | Leht |
|---|---|---|
| `index.html` | `ru/index.html` | Avaleht |
| `teenused.html` | `ru/teenused.html` | Teenused ja hinnad (kategooriamenüüga) |
| `broneeri.html` | `ru/broneeri.html` | Broneeri aeg (3 sammu + kokkuvõte) |
| `galerii.html` | `ru/galerii.html` | Galerii (filtriga) |
| `arvustused.html` | `ru/arvustused.html` | Arvustused |
| `meist.html` | `ru/meist.html` | Meist |
| `kkk.html` | `ru/kkk.html` | KKK |
| `kontakt.html` | `ru/kontakt.html` | Kontakt |
| `privaatsuspoliitika.html` | `ru/privaatsuspoliitika.html` | Privaatsuspoliitika |

Igal lehel on ET/RU lüliti, mis viib sama lehe teise keele versioonile.

## Disain ja inspiratsioon

Disain on kokku pandud päris lehtede elementidest, mis leiti etteantud galeriidest:

- **Eclo** (lapa.ninja, ilu): kreemjas taust, tume espressopruun tekst, tume ülemine riba,
  väikesed trükitähtedega monospace-menüüd ja suur hinde number („4,8/5“) tumedal taustal.
- **TrueKind** (lapa.ninja, ilu): sirge pealkirja ja kursiivse serifi paar („Hoolitsetud välimus, *ilma kiirustamata.*“)
  ning peened eraldusjooned.
- **Salon Bon Vivant** (lapa.ninja, salong): lai, harvendatud sõnamärk (LANA) ja peened jooned.
- **850 Salon** ja **Hershesons** (salongilehed): suur sõnamärk jaluses, allajoonitud trükitähtedega lingid,
  aadress serifkirjas ja hinnakiri ridadena.
- **Refero** (web-apps): broneerimine sammudena koos kõrvalt näha oleva kokkuvõttega.

Fondid (kõigil on kirillitsa tugi): Noto Serif Display (pealkirjad), Inter Tight (tekst),
IBM Plex Mono (sildid). Värvid: kreem `#f3eee7`, espresso `#27201b`, terrakota `#9f4527`.
Ümaraid nurki, lillat värvi, gradiente ega mõttekriipse (em dash) ei kasutata.

## Mis on päris ja mis on näidis

**Päris andmed:** nimi, telefon +372 5559 9159, e-post, Facebook (facebook.com/lanastuudio),
linn Kohtla-Järve ning Google'i hinne 4,8 / 114 arvustust.

**Näidised, asenda enne avaldamist:**
- aadress (`Näidise 1, 30328 Kohtla-Järve`) ja kaardi asukoht `kontakt.html` failis (`q=` väärtus);
- lahtiolekuajad, teenused, kestused ja hinnad;
- arvustuste tekstid ja nimed (asenda päris Google'i arvustustega), hinnete jaotus;
- meistri lugu `meist.html` lehel, stuudio omaniku nimi ja numbrid (10+ aastat jne);
- soodustused, parkimise info ja KKK vastused;
- domeen `lanastuudio.ee` failide `hreflang` linkides.

**Kontrolli e-posti aadress üle:** `lanastuudio@gmail.ee` on kirjutatud nii, nagu see oli antud,
kuid Gmaili aadressid lõpevad tavaliselt `@gmail.com`-iga.

## Pildid

Kõik pildid on kohatäited (`<div class="ph" data-label="...">`). Pildi lisamiseks pane fail
kausta `assets/img/` ja lisa `<img>` kohatäite sisse:

```html
<div class="ph" data-label="Hero pilt 4:5"><img src="assets/img/hero.jpg" alt="Lana stuudio"></div>
```

Vene lehtedel on tee `../assets/img/...`. Silt kaob automaatselt, kui kohatäite sees on pilt.

## Vormid

Broneerimise ja kontakti vormid näitavad praegu ainult kinnitust (demo).
Vabad kellaajad broneerimisel on näidis. Päris kasutuseks ühenda vorm vormiteenusega
(nt Formspree või Netlify Forms) või asenda broneerimisvorm broneerimissüsteemi lingiga
(nt Fresha, Booksy).

## Netlify ja otsingumootorid

`robots.txt` ja `_headers` keelavad Google'il lehte indekseerida, sest tegu on näidisega.
Kui leht läheb päris kasutusse (päris arvustuste ja andmetega), kustuta need kaks faili.

Netlify Drop: pakkige kausta **sisu** (mitte kausta ennast) zip-faili ja lohistage see aadressile
https://app.netlify.com/drop. `index.html` peab olema zip-faili juurtasemel.

## Muutmine

Päis ja jalus korduvad igas HTML-failis. Menüü muutmisel uuenda kõiki 18 faili.
