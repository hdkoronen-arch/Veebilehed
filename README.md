# Salong Siid — veebileht

Staatiline mitmeleheline veebileht ilusalongile (HTML + CSS + JS, ilma raamistiketa).
Ava `index.html` otse brauseris või laadi kaust üles mis tahes staatilisse hostingusse
(Netlify, GitHub Pages, Vercel, Zone jne).

## Lehed
| Fail | Leht |
|---|---|
| `index.html` | Avaleht |
| `teenused.html` | Teenused ja hinnakiri |
| `meist.html` | Meist |
| `meeskond.html` | Meeskond |
| `galerii.html` | Galerii / Tööd |
| `broneeri.html` | Broneeri aeg |
| `kontakt.html` | Kontakt |
| `e-pood.html` | Tooted / E-pood |
| `arvustused.html` | Arvustused |
| `kinkekaardid.html` | Kinkekaardid |
| `kkk.html` | KKK |
| `blogi.html` | Blogi / Nõuanded |
| `pakkumised.html` | Pakkumised |
| `karjaar.html` | Karjäär |
| `privaatsus.html` | Privaatsuspoliitika |
| `tingimused.html` | Tingimused |

## Pildid
Kõik pildid on praegu kohatäited (`<div class="ph" data-label="...">`).
Pildi lisamiseks pane fail kausta `assets/img/` ja lisa `<img>` kohatäite sisse:

```html
<div class="ph arch" data-label="Hero pilt"><img src="assets/img/hero.jpg" alt="Salongi klient"></div>
```

Silt kaob automaatselt, kui kohatäite sees on pilt.

## Enne avaldamist
- Salongi nimi, aadress, telefon, e-post, hinnad, meeskond ja arvustused on **näidissisu** — asenda päris andmetega.
- Vormid (broneering, kontakt, kinkekaart, karjäär, uudiskiri) näitavad praegu ainult kinnitust.
  Päris saatmiseks ühenda need broneerimissüsteemi / vormiteenusega (nt Formspree, Netlify Forms) ja e-pood makselahendusega.
- `privaatsus.html` ja `tingimused.html` on näidistekstid — lase juristil üle vaadata.
- Päis ja jalus on igas HTML-failis korratud; menüü muutmisel uuenda kõiki faile.

## Teised saidid selles repos
| Kaust | Ettevõte |
|---|---|
| `terav/` | Salong Siid, terav ja minimalistlik variant |
| `borei/` | Borei OÜ, meeste juuksur Kohtla-Järvel (vt `borei/BRIEF.md`) |
