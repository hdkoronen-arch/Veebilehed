# Borei · versioon 2

Teine, täiesti eraldi stiil Borei meeste juuksurisalongile (HTML + CSS + JS, ilma raamistiketa).
Esimene versioon asub kaustas `../borei/`.

- **Eraldi lehed:** ava `index.html`.
- **Üks fail:** `borei-2-koik-lehed.html` sisaldab kõiki lehti, CSS-i ja JS-i; lehtede vahel liigutakse `#`-linkidega.
- **Mall, inspiratsioon ja andmete päritolu:** [`BRIEF.md`](BRIEF.md).

## Muutmine
Lehtede sisu, päis ja jalus on failis `tools/koosta.py`. Pärast muutmist käivita:

```
python3 borei-2/tools/koosta.py
```

See kirjutab üle kõik `*.html` failid ja ühe faili versiooni. CSS on `assets/css/style.css`, JS `assets/js/main.js`.

## Netlifysse demoks
Lohista Netlify Dropi (app.netlify.com/drop) ainult avalikud failid: 8 `*.html` lehte ja kaust `assets/`.
Ära lae üles `README.md`, `BRIEF.md` ega `tools/`, sest need oleksid kõigile loetavad.
Demo lehtedel on `noindex`, et Google ei näitaks väljamõeldud hindadega lehte.
Päris avaldamisel pane `tools/koosta.py` failis `DEMO = False` ja käivita skript uuesti.

## Pildid
Kohatäited on kujul `<span class="ph"><i>Silt</i></span>`. Pildi lisamiseks pane `<img>` kohatäite sisse:

```html
<span class="ph"><i>Fade</i><img src="assets/img/fade.jpg" alt="Fade lõikus"></span>
```

## Enne avaldamist
- Asenda näidised: hinnad, kestused, meistrid Andrei ja Olga, galerii pealdised, KKK tingimused.
- Kontrolli lahtiolekuaegu (HTML-is ja `main.js` objektis `HOURS`).
- E-post `irinabograya@gmail.com` on omaniku isiklik aadress: küsi luba või kasuta salongi aadressi.
- Vormid näitavad praegu ainult kinnitust. Ühenda broneerimissüsteem või vormiteenus.
