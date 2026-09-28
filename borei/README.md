# Borei · meeste juuksur, Kohtla-Järve

Staatiline mitmeleheline veebileht (HTML + CSS + JS, ilma raamistiketa).
Ava `index.html` brauseris või laadi kaust `borei/` üles mis tahes staatilisse hostingusse.

Täidetud mall, disainiallikad ja andmete päritolu: [`BRIEF.md`](BRIEF.md).

## Lehed
| Fail | Leht |
|---|---|
| `index.html` | Avaleht |
| `teenused.html` | Teenused ja hinnad |
| `broneeri.html` | Broneeri aeg (4 sammu) |
| `galerii.html` | Tööd (filtrid + suurendus) |
| `meist.html` | Meist ja meeskond |
| `kinkekaart.html` | Kinkekaart eelvaatega |
| `kkk.html` | KKK |
| `kontakt.html` | Kontakt, vorm ja kaart |
| `privaatsus.html` | Privaatsus |

## Pildid
Kõik pildid on kohatäited (`<div class="ph"><span>Silt</span></div>`).
Pildi lisamiseks pane fail kausta `assets/img/` ja lisa `<img>` kohatäite sisse:

```html
<div class="ph"><span>Hero pilt</span><img src="assets/img/hero.jpg" alt="Meister lõikab kliendi juukseid"></div>
```

## Enne avaldamist
- **Asenda näidised:** hinnad ja kestused (`teenused.html`, `index.html`, `broneeri.html` JSON-plokk `#services-data`),
  meistrid Andrei ja Olga (`meist.html`, `#masters-data`), galerii pealdised, KKK tingimused.
- **Kontrolli lahtiolekuaegu** (praegu E–R 10–19, L–P 10–16). Muuda neid HTML-is ja `assets/js/main.js` objektis `HOURS`.
- E-post `irinabograya@gmail.com` on omaniku isiklik aadress: küsi luba või kasuta salongi aadressi.
- Broneering, kinkekaart ja kontaktivorm näitavad praegu ainult kinnitust. Päris kasutuseks ühenda
  broneerimissüsteem (nt Fresha, Booksy, Salonized) või vormiteenus (Formspree, Netlify Forms).
- Broneerimise hõivatud ajad on näidis (genereeritakse kuupäeva järgi).
- Päis ja jalus on igas HTML-failis korratud; menüü muutmisel uuenda kõiki faile.
