#!/usr/bin/env python3
"""Borei v2: genereerib lehed ühisest päisest/jalusest ja paneb kokku ka ühe faili versiooni.

Kasutus:  python3 borei-2/tools/koosta.py
Tulemus:  borei-2/*.html  ja  borei-2/borei-2-koik-lehed.html
"""
import collections, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PHONE = "+372 5192 0155"
TEL = "tel:+37251920155"
EMAIL = "irinabograya@gmail.com"
FB = "https://www.facebook.com/MJSborei/"
MAPS = "https://www.google.com/maps/search/?api=1&query=Borei+Keskallee+20+Kohtla-J%C3%A4rve"
EMBED = "https://www.google.com/maps?q=Keskallee%2020%2C%2030322%20Kohtla-J%C3%A4rve&output=embed"
CUR = ' aria-current="page"'

NAV = [("index.html", "Avaleht"), ("teenused.html", "Teenused"), ("galerii.html", "Tööd"), ("meist.html", "Meist"),
       ("kkk.html", "KKK"), ("kontakt.html", "Kontakt")]

# Hinnad, kestused ja kirjeldused on näidised: asenda salongi päris hinnakirjaga.
SERVICES = [
    ("Juukselõikus", "loikus", "Meeste juukselõikus", 45, 15, "Käärid ja masin, pesu, viimistlus ja soeng."),
    ("Juukselõikus", "fade", "Fade", 45, 18, "Sujuv üleminek nullist, skin fade või taper. Pealt kääridega."),
    ("Juukselõikus", "masin", "Masinlõikus", 20, 10, "Üks või kaks otsikut, kontuur ja kael puhtaks."),
    ("Juukselõikus", "pikk", "Pikkade juuste lõikus", 60, 20, "Õlgadeni või pikemad juuksed, kihid ja kuju."),
    ("Habe ja raseerimine", "kombo", "Lõikus + habe", 75, 25, "Juukselõikus ja habeme kujundamine ühe korraga."),
    ("Habe ja raseerimine", "habe", "Habeme kujundamine", 30, 12, "Pikkus, kuju ja kontuur, lõpus õli või palsam."),
    ("Habe ja raseerimine", "raseerimine", "Kuuma rätikuga raseerimine", 30, 15, "Klassikaline raseerimine habemenoaga."),
    ("Habe ja raseerimine", "pea", "Pea raseerimine", 30, 14, "Pea siledaks habemenoaga, jahutav palsam."),
    ("Lapsed", "poisid", "Poiste lõikus", 30, 12, "Kuni 12-aastastele. Rahulik tempo, lühike ooteaeg."),
    ("Lapsed", "isa-poeg", "Isa + poeg", 75, 25, "Kaks lõikust järjest, istute kõrvuti."),
    ("Lisateenused", "kontuur", "Kontuuri värskendus", 15, 7, "Kõrvade ja kaela piirid korda lõikuste vahel."),
    ("Lisateenused", "kulmud", "Kulmude korrigeerimine", 10, 5, "Kulmud korda kääride ja masinaga."),
    ("Lisateenused", "toon", "Halli toonimine", 30, 15, "Loomulik toon, mis katab halli osaliselt."),
    ("Lisateenused", "pesu", "Pesu ja soeng", 15, 6, "Pesu, peamassaaž ja stiilimine tootega."),
]
GROUP_INFO = {
    "Juukselõikus": "Kõik lõikused sisaldavad konsultatsiooni, pesu ja viimistlust.",
    "Habe ja raseerimine": "Kuum rätik, habemenuga ja rahulik tempo.",
    "Lapsed": "Lastega võtame aega. Vanem võib olla kõrval.",
    "Lisateenused": "Lisa lõikusele või tule eraldi.",
}
SVC_JSON = [dict(group=g, id=i, name=n, dur=d, price=p, desc=ds) for g, i, n, d, p, ds in SERVICES]
# Irina Oja on omanik. Andrei ja Olga on näidisnimed.
MASTERS = [dict(id="any", name="Esimene vaba", role="Kiireim aeg"), dict(id="irina", name="Irina", role="Omanik · meister"),
           dict(id="andrei", name="Andrei", role="Meister"), dict(id="olga", name="Olga", role="Meister")]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">')
ICON = ("<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230f0f0f'/%3E"
        "%3Ctext x='16' y='24' font-family='Georgia' font-style='italic' font-size='22' fill='%23f7f4ec' text-anchor='middle'%3EB%3C/text%3E%3C/svg%3E\">")


def svc(i): return next(s for s in SERVICES if s[1] == i)


def ph(label, cls="", ar=None):
    st = f' style="--ar:{ar}"' if ar else ""
    return f'<span class="ph {cls}"{st}><i>{label}</i></span>'


def hours():
    return '''<table class="hours"><caption class="sr-only">Lahtiolekuajad</caption><tbody>
  <tr data-day="1,2,3,4,5"><th scope="row">Esmaspäev–reede</th><td>10:00–19:00</td></tr>
  <tr data-day="6"><th scope="row">Laupäev</th><td>10:00–16:00</td></tr>
  <tr data-day="0"><th scope="row">Pühapäev</th><td>10:00–16:00</td></tr>
</tbody></table>'''


def header(active):
    nav = "\n".join(f'      <li><a href="{h}"{CUR if h == active else ""}>{t}</a></li>' for h, t in NAV)
    mob = "\n".join(f'    <li><a href="{h}"{CUR if h == active else ""}>{t}</a></li>' for h, t in NAV + [("broneeri.html", "Broneeri aeg")])
    return f'''<a class="skip" href="#sisu">Liigu sisu juurde</a>
<header class="hdr">
  <div class="wrap bar">
    <a class="logo" href="index.html" aria-label="Borei avaleht"><b><span>BO</span><span>REI</span></b><small>Meeste juuksur<br>Kohtla-Järve</small></a>
    <nav class="nav" aria-label="Peamenüü"><ul>
{nav}
    </ul></nav>
    <a class="btn btn--red hdr-book" href="broneeri.html">Broneeri <span class="ar">→</span></a>
    <button class="menu-btn" type="button" data-open-menu aria-expanded="false" aria-controls="menu"><i></i>Menüü</button>
  </div>
</header>
<div class="overlay" id="menu" aria-hidden="true">
  <div class="top"><span class="logo"><b><span>BO</span><span>REI</span></b></span><button class="close" type="button" data-close-menu>Sulge ×</button></div>
  <nav aria-label="Mobiilimenüü"><ol>
{mob}
  </ol></nav>
  <div class="foot"><a href="{TEL}">{PHONE}</a><span>Keskallee 20, Kohtla-Järve · E–R 10–19 · L–P 10–16</span></div>
</div>'''


def footer():
    links = "\n".join(f'          <li><a href="{h}">{t}</a></li>' for h, t in NAV[1:])
    return f'''<footer class="ftr">
  <div class="wrap">
    <div class="cols">
      <div><p class="lead">Lõikus, mida <em>märgatakse.</em> Keskallee 20, aastast 2015.</p></div>
      <div><h4>Kontakt</h4><ul>
        <li><a href="{TEL}">{PHONE}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li><a href="{MAPS}" target="_blank" rel="noopener">Keskallee 20, 30322 Kohtla-Järve</a></li>
        <li><a href="{FB}" target="_blank" rel="noopener">Facebook</a></li>
      </ul></div>
      <div><h4>Lahti</h4>{hours()}</div>
      <div><h4>Lehed</h4><ul>
          <li><a href="broneeri.html">Broneeri aeg</a></li>
{links}
      </ul></div>
    </div>
    <div class="word" aria-hidden="true">Bor<em>e</em>i</div>
    <div class="legal"><span>© <span data-year>2026</span> Borei OÜ · registrikood 12807446</span><span><a href="privaatsus.html">Privaatsus</a> · <a href="{FB}" target="_blank" rel="noopener">Facebook</a></span></div>
  </div>
</footer>
<div class="mbar"><a href="{TEL}" aria-label="Helista {PHONE}">☎</a><a href="broneeri.html">Broneeri aeg →</a></div>'''


PAGES = collections.OrderedDict()


def page(fname, title, desc, body, body_class=""):
    PAGES[fname] = dict(title=title, desc=desc, body=body, cls=body_class)


def phead(crumb, h1, intro):
    return f'''<section class="phead">
  <div class="wrap">
    <div class="crumb"><a href="index.html">Avaleht</a> / {crumb}</div>
    <h1>{h1}</h1>
    <p class="intro">{intro}</p>
  </div>
</section>'''


def cta(h2, dark=True):
    return f'''<section class="sec {"sec--dark " if dark else ""}cta">
  <div class="wrap">
    <h2>{h2}</h2>
    <a class="btn btn--red" href="broneeri.html">Broneeri aeg <span class="ar">→</span></a>
  </div>
</section>'''


def visit():
    return f'''<section class="sec sec--dark">
  <div class="wrap visit">
    <div class="rise">
      <span class="eyebrow">Asukoht</span>
      <p class="addr">Keskallee <em>20</em></p>
      <p style="color:var(--muted-d)">30322 Kohtla-Järve, Ida-Viru maakond. Parkimine maja ees.</p>
      {hours()}
      <div class="btns"><a class="btn btn--cream" href="{TEL}">Helista <span class="ar">→</span></a><a class="btn btn--ghost-d" href="{MAPS}" target="_blank" rel="noopener">Teejuhised <span class="ar">↗</span></a></div>
    </div>
    <div class="map"><iframe src="{EMBED}" title="Borei asukoht kaardil: Keskallee 20, Kohtla-Järve" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
  </div>
</section>'''


# ------------------------------------------------------------ AVALEHT
rail_ids = ["loikus", "fade", "kombo", "habe", "raseerimine", "masin", "poisid", "isa-poeg"]
rail = "\n".join(f'''      <a class="svc" href="broneeri.html?teenus={i}">{ph(svc(i)[2])}<h3>{svc(i)[2]}</h3><p>{svc(i)[5]}</p><span class="pr">{svc(i)[3]} min · {svc(i)[4]} €</span></a>''' for i in rail_ids)
svc_opts = "\n".join(f'          <option value="{i}">{n}</option>' for g, i, n, d, p, ds in SERVICES)
page("index.html", "Borei · meeste juuksur Kohtla-Järvel",
     "Borei on meeste juuksurisalong Kohtla-Järvel, Keskallee 20. Lõikus, fade, habe ja raseerimine. Broneeri aeg veebis.", f'''<section class="hero">
  <div class="slides" aria-hidden="true">
    <div class="slide on">{ph("Hero pilt 1 · meister tööl", "ph--dark ph--fill")}</div>
    <div class="slide">{ph("Hero pilt 2 · fade lähivaates", "ph--dark ph--fill")}</div>
    <div class="slide">{ph("Hero pilt 3 · salong õhtul", "ph--dark ph--fill")}</div>
    <div class="shade"></div>
  </div>
  <span class="status" data-status>Keskallee 20</span>
  <div class="content wrap">
    <span class="eyebrow">Meeste juuksur · Kohtla-Järve · aastast 2015</span>
    <h1>Lõikus, mida <em>märgatakse.</em></h1>
    <p class="intro">Klassikaline lõikus, fade, habe ja kuuma rätikuga raseerimine. Keskallee 20, iga päev lahti.</p>
    <div class="dots" role="group" aria-label="Slaidid">
      <button type="button" aria-label="Slaid 1">01<span></span></button>
      <button type="button" aria-label="Slaid 2">02<span></span></button>
      <button type="button" aria-label="Slaid 3">03<span></span></button>
    </div>
  </div>
  <form class="quick" id="quick" action="broneeri.html" aria-label="Kiirbroneering">
    <label><span>Teenus</span><select id="q-svc">
          <option value="">Kõik teenused</option>
{svc_opts}
        </select></label>
    <label><span>Päev</span><select id="q-day"></select></label>
    <button class="btn btn--red" type="submit">Leia aeg <span class="ar">→</span></button>
  </form>
</section>


<section class="sec sec--alt" data-rail>
  <div class="wrap">
    <div class="head">
      <div><span class="eyebrow">Hinnakiri</span><h2 style="margin-top:12px">Teenused<span class="count">({len(SERVICES)})</span></h2></div>
      <div class="rail-nav"><button type="button" data-rail-go="-1" aria-label="Eelmised">←</button><button type="button" data-rail-go="1" aria-label="Järgmised">→</button></div>
    </div>
    <div class="rail">
{rail}
    </div>
    <div class="rail-bar"><span></span></div>
    <p style="margin-top:36px;text-align:center"><a class="txt-link" href="teenused.html">Kogu hinnakiri <span>→</span></a></p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="head"><div><span class="eyebrow">Broneerimine</span><h2 style="margin-top:12px">Toolini <em>nelja</em> sammuga</h2></div><p>Kinnitus tuleb SMS-iga. Tasud salongis kaardi või sularahaga.</p></div>
    <div class="steps4 rise">
      <div class="step4"><span class="n">1/</span><h3>Teenus</h3><p>Lõikus, habe või mõlemad. Hind ja kestus on kohe näha.</p></div>
      <div class="step4"><span class="n">2/</span><h3>Meister</h3><p>Oma meister või esimene vaba, kui on kiire.</p></div>
      <div class="step4"><span class="n">3/</span><h3>Aeg</h3><p>Kalendrist kaks nädalat ette, ka nädalavahetusel.</p></div>
      <div class="step4"><span class="n">4/</span><h3>Kinnitus</h3><p>Nimi ja telefon. Lisa aeg soovi korral oma kalendrisse.</p></div>
    </div>
    <p style="margin-top:36px"><a class="btn btn--red" href="broneeri.html">Alusta broneeringut <span class="ar">→</span></a></p>
  </div>
</section>

<section class="sec sec--dark">
  <div class="wrap">
    <span class="eyebrow" style="color:var(--muted-d)">Google Maps</span>
    <div class="score rise" style="margin-top:20px">
      <div class="big">4<em>,</em>8</div>
      <p class="t">149 arvustust. Aitäh kõigile, kes on aja võtnud ja kirjutanud.</p>
      <a class="btn btn--cream" href="{MAPS}" target="_blank" rel="noopener">Loe arvustusi <span class="ar">↗</span></a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="head"><div><span class="eyebrow">Galerii</span><h2 style="margin-top:12px">Tööd<span class="count">(16)</span></h2></div><a class="txt-link" href="galerii.html">Kõik tööd <span>→</span></a></div>
    <div class="mosaic rise">
      {ph("Fade")}
      {ph("Klassika", ar="4/3")}
      {ph("Habe", ar="4/3")}
      {ph("Poiste lõikus", ar="4/3")}
      {ph("Pea raseerimine", ar="4/3")}
    </div>
  </div>
</section>
{visit()}''')

# ------------------------------------------------------------ TEENUSED
groups = []
for g in dict.fromkeys(s[0] for s in SERVICES):
    items = "\n".join(f'''        <a class="item" href="broneeri.html?teenus={i}"><h3>{n}</h3><span class="price">{p} €</span><p>{ds}</p><span class="meta"><span>{d} min</span><b>Broneeri →</b></span></a>'''
                      for gg, i, n, d, p, ds in SERVICES if gg == g)
    cnt = sum(1 for s in SERVICES if s[0] == g)
    groups.append(f'''    <div class="menu-group">
      <header><h2>{g}<span class="count">({cnt})</span></h2><p>{GROUP_INFO[g]}</p></header>
      <div>
{items}
      </div>
    </div>''')
page("teenused.html", "Teenused ja hinnad · Borei", "Borei hinnakiri: meeste juukselõikus, fade, masinlõikus, habe, raseerimine ja poiste lõikus Kohtla-Järvel.",
     phead("Teenused", "Teenused <em>& hinnad</em>", "Vajuta teenusele ja broneeri kohe. Hind sisaldab konsultatsiooni ja viimistlust.") + f'''
<section class="sec">
  <div class="wrap">
{chr(10).join(groups)}
  </div>
</section>
<section class="sec sec--dark">
  <div class="wrap">
    <div class="head"><div><span class="eyebrow">Hea teada</span><h2 style="margin-top:12px">Enne <em>tulekut</em></h2></div></div>
    <div class="notes">
      <div class="note-card"><span class="n">1/</span><h3>Tasumine</h3><p>Pangakaart või sularaha salongis pärast teenust.</p></div>
      <div class="note-card"><span class="n">2/</span><h3>Hilinemine</h3><p>Kui jääd üle 15 minuti hiljaks, helista. Vajadusel lühendame teenust või leiame uue aja.</p></div>
      <div class="note-card"><span class="n">3/</span><h3>Tühistamine</h3><p>Anna teada vähemalt 3 tundi ette, siis saab aja võtta keegi teine.</p></div>
    </div>
  </div>
</section>
{cta("Valmis <em>uueks</em> lõikuseks?", dark=False)}''')

# ------------------------------------------------------------ GALERII
GAL = [("fade", "Skin fade", "Fade", True), ("klassika", "Külje peale kammitud", "Klassika", False), ("habe", "Täishabe", "Habe", False),
       ("fade", "Mid fade", "Fade", False), ("poisid", "Poiste lõikus", "Poisid", False), ("klassika", "Pompadour", "Klassika", False),
       ("habe", "Lühike habe", "Habe", False), ("lyhike", "Crew cut", "Lühike", True), ("fade", "Taper fade", "Fade", False),
       ("klassika", "Pikem pealt", "Klassika", False), ("lyhike", "Buzz cut", "Lühike", False), ("poisid", "Fade lapsele", "Poisid", False),
       ("habe", "Raseerimine", "Habe", False), ("fade", "Low fade + habe", "Fade", False), ("lyhike", "Masinlõikus 6 mm", "Lühike", False),
       ("klassika", "Ärisoeng", "Klassika", False)]
figs = "\n".join(f'''      <figure data-cat="{c}"{' data-big class="big"' if big else ""}><button type="button" aria-label="Ava pilt: {t}">{ph(t)}</button><figcaption><em>{t}</em><span>{k}</span></figcaption></figure>''' for c, t, k, big in GAL)
page("galerii.html", "Tööd · Borei", "Borei tööd: fade, klassikalised lõikused, habemed ja poiste lõikused. Filtreeri stiili järgi.",
     phead("Tööd", "Tööd", "Valik lõikusi ja habemeid salongist. Rohkem leiad Facebookist.") + f'''
<section class="sec sec--tight">
  <div class="wrap">
    <div class="tabs" role="group" aria-label="Filtreeri töid">
      <button class="tab" type="button" data-f="all" aria-pressed="true">Kõik</button>
      <button class="tab" type="button" data-f="fade" aria-pressed="false">Fade</button>
      <button class="tab" type="button" data-f="klassika" aria-pressed="false">Klassika</button>
      <button class="tab" type="button" data-f="lyhike" aria-pressed="false">Lühike</button>
      <button class="tab" type="button" data-f="habe" aria-pressed="false">Habe</button>
      <button class="tab" type="button" data-f="poisid" aria-pressed="false">Poisid</button>
    </div>
    <div class="works">
{figs}
    </div>
    <p style="margin-top:40px"><a class="txt-link" href="{FB}" target="_blank" rel="noopener">Rohkem töid Facebookis <span>↗</span></a></p>
  </div>
</section>
<div class="lb" role="dialog" aria-modal="true" aria-label="Pildi vaade" aria-hidden="true">
  <div class="lb-top"><span class="lb-count">01 / 16</span><button class="lb-close" type="button">Sulge ×</button></div>
  <div class="lb-img"></div>
  <div class="lb-bot"><div><em></em><br><span class="eyebrow lb-cat" style="color:var(--muted-d)"></span></div><div class="arrows"><button class="lb-prev" type="button" aria-label="Eelmine">←</button><button class="lb-next" type="button" aria-label="Järgmine">→</button></div></div>
</div>
{cta("Sama lõikus <em>sulle?</em>")}''')

# ------------------------------------------------------------ MEIST
page("meist.html", "Meist · Borei", "Borei lugu: meeste juuksurisalong Kohtla-Järvel aastast 2015. Omanik Irina Oja ja meistrid.",
     phead("Meist", "Meist", "Meeste juuksurisalong Keskallee ääres aastast 2015. Väike meeskond ja palju püsikliente.") + f'''
<section class="sec">
  <div class="wrap split">
    {ph("Irina tööl", ar="4/5")}
    <div class="rise">
      <span class="eyebrow eyebrow--muted">Lugu</span>
      <h2 style="margin:14px 0 24px">Alustasime <em>ühe</em> tooliga</h2>
      <p class="intro">Irina Oja avas Borei 2015. aastal. Mõte oli lihtne: mehel peab olema koht, kus saab kiiresti ja korralikult lõigatud.</p>
      <p>Aastatega on toole juurde tulnud, aga põhimõte on sama. Meil käivad isad koos poegadega ja kliendid, kes tulid esimest korda juba avamise aastal.</p>
    </div>
  </div>
</section>
<section class="sec sec--tight">
  <div class="wrap facts rise">
    <div><b>2015</b><span>avatud aastast</span></div>
    <div><b>4,8</b><span>Google'i hinne</span></div>
    <div><b>149</b><span>arvustust</span></div>
    <div><b>7/7</b><span>päeva nädalas lahti</span></div>
  </div>
</section>
<section class="sec sec--alt">
  <div class="wrap manifest rise">
    <div class="mark" aria-hidden="true">B</div>
    <p>Täpne kontuur. <em>Aus hind.</em> Broneeritud aeg tähendab, et sa ei istu ootetoolis.</p>
    <div class="sign">Kolm asja, mida hoiame</div>
  </div>
</section>
<section class="sec" id="meeskond">
  <div class="wrap">
    <div class="head"><div><span class="eyebrow">Meeskond</span><h2 style="margin-top:12px">Meistrid<span class="count">(3)</span></h2></div><p>Broneerides saad valida oma meistri või esimese vaba.</p></div>
    <div class="team">
      <article class="member rise">{ph("Portree · Irina")}<h3>Irina Oja</h3><span class="role">Omanik · meister</span><p>Asutas Borei 2015. Klassikalised lõikused, habe ja kuuma rätikuga raseerimine.</p></article>
      <article class="member rise">{ph("Portree · Andrei")}<h3>Andrei</h3><span class="role">Meister</span><p>Fade'id ja tekstuurid. Täpne üleminek ja puhas kontuur.</p></article>
      <article class="member rise">{ph("Portree · Olga")}<h3>Olga</h3><span class="role">Meister</span><p>Poiste lõikused ja pikemad juuksed. Ka halli toonimine.</p></article>
    </div>
  </div>
</section>
<section class="sec sec--alt">
  <div class="wrap">
    <div class="head"><div><span class="eyebrow">Salong</span><h2 style="margin-top:12px">Keskallee <em>20</em></h2></div><p>Borei OÜ · registrikood 12807446 · 30322 Kohtla-Järve</p></div>
    <div class="mosaic">
      {ph("Salong · toolid")}
      {ph("Salong · ootenurk", ar="4/3")}
      {ph("Salong · tööriistad", ar="4/3")}
      {ph("Salong · aken", ar="4/3")}
      {ph("Salong · peegel", ar="4/3")}
    </div>
  </div>
</section>
{cta("Tule <em>tutvuma.</em>")}''')

# ------------------------------------------------------------ BRONEERI
page("broneeri.html", "Broneeri aeg · Borei", "Broneeri aeg Borei meeste juuksurisalongi Kohtla-Järvel: teenus, meister, aeg ja kinnitus.",
     phead("Broneeri aeg", "Broneeri <em>aeg</em>", "Neli sammu. Tasumine salongis, kinnitus SMS-iga.") + f'''
<section class="sec sec--tight">
  <div class="wrap" id="bk">
    <div id="bk-flow">
      <ol class="bk-progress">
        <li class="cur"><b>1/</b><span>Teenus</span></li>
        <li><b>2/</b><span>Meister</span></li>
        <li><b>3/</b><span>Aeg</span></li>
        <li><b>4/</b><span>Kinnitus</span></li>
      </ol>
      <div class="bk-step" data-step="1">
        <h2>Mida <em>teeme?</em></h2>
        <p>Vali üks teenus. Kombinatsioonid on eraldi välja toodud.</p>
        <fieldset style="border:0;margin:0;padding:0"><legend class="sr-only">Teenus</legend><div class="cards" id="bk-svcs"></div></fieldset>
      </div>
      <div class="bk-step" data-step="2" hidden>
        <h2>Kes <em>lõikab?</em></h2>
        <p>„Esimene vaba” annab kõige rohkem aegu.</p>
        <fieldset style="border:0;margin:0;padding:0"><legend class="sr-only">Meister</legend><div class="people" id="bk-people"></div></fieldset>
      </div>
      <div class="bk-step" data-step="3" hidden>
        <h2>Millal <em>sobib?</em></h2>
        <p>Kaks nädalat ette. Läbikriipsutatud ajad on võetud.</p>
        <div class="cal" id="bk-cal" role="group" aria-label="Päev"></div>
        <div class="slots-wrap" id="bk-slots" aria-live="polite"></div>
      </div>
      <div class="bk-step" data-step="4" hidden>
        <h2>Peaaegu <em>valmis</em></h2>
        <p>Kontrolli üle ja lisa oma andmed.</p>
        <dl class="recap">
          <div><dt>Teenus</dt><dd id="r-svc"></dd></div>
          <div><dt>Meister</dt><dd id="r-mst"></dd></div>
          <div><dt>Päev</dt><dd id="r-day"></dd></div>
          <div><dt>Kell</dt><dd id="r-time"></dd></div>
          <div><dt>Kokku</dt><dd id="r-sum"></dd></div>
        </dl>
        <form class="form" id="bk-form" novalidate>
          <div class="two">
            <div class="fld"><label for="b-name">Nimi</label><input id="b-name" type="text" autocomplete="name" required><span class="err">Kirjuta oma nimi.</span></div>
            <div class="fld"><label for="b-phone">Telefon</label><input id="b-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+372" required><span class="err">Kontrolli numbrit.</span></div>
          </div>
          <div class="fld"><label for="b-note">Lisainfo <span class="opt">(soovi korral)</span></label><textarea id="b-note" placeholder="Nt sama lõikus nagu eelmine kord"></textarea></div>
          <label class="chk"><input type="checkbox" required><span>Olen nõus, et Borei kasutab minu andmeid broneeringu haldamiseks. <a href="privaatsus.html">Privaatsus</a></span></label>
        </form>
      </div>
      <div class="bk-bar">
        <div class="sum"><b id="bar-t">Vali teenus</b><small id="bar-s">Samm 1 / 4</small></div>
        <button class="btn btn--line" type="button" id="bk-back"><span class="ar">←</span><span class="t">Tagasi</span></button>
        <button class="btn btn--red" type="button" id="bk-next" disabled>Edasi <span class="ar">→</span></button>
      </div>
    </div>
    <div class="done" id="bk-done" hidden>
      <span class="eyebrow eyebrow--muted">Broneering vastu võetud</span>
      <h2>Aitäh, <em id="done-name"></em>.</h2>
      <p class="intro" id="done-txt"></p>
      <p class="muted">Kinnitus tuleb SMS-iga. Kui aeg ei sobi enam, helista <a href="{TEL}">{PHONE}</a>.</p>
      <div class="btns" style="margin-top:26px"><a class="btn btn--red" id="done-ics" download="borei-broneering.ics" href="#">Lisa kalendrisse <span class="ar">↓</span></a><a class="btn btn--line" href="index.html">Avalehele <span class="ar">→</span></a></div>
    </div>
  </div>
</section>
<script type="application/json" id="svc-json">{json.dumps(SVC_JSON, ensure_ascii=False)}</script>
<script type="application/json" id="mst-json">{json.dumps(MASTERS, ensure_ascii=False)}</script>''', body_class="no-mbar")

# ------------------------------------------------------------ KKK
FAQ = [
    ("broneerimine", "Broneerimine", [
        ("Kas saab tulla ka ilma broneeringuta?", f"Jah, kui meistril on vaba aeg. Kindlam on enne helistada ({PHONE}) või broneerida veebis, eriti reedel ja laupäeval."),
        ("Kuidas broneeringut muuta või tühistada?", f"Helista või saada SMS numbrile {PHONE}. Palume teada anda vähemalt 3 tundi ette."),
        ("Mis saab, kui jään hiljaks?", "Kuni 15 minutit mahub tavaliselt ära. Kui jääd rohkem hiljaks, helista: vajadusel lühendame teenust või pakume uut aega."),
        ("Kui kaugele ette saab aega võtta?", "Veebis näed vabu aegu kaks nädalat ette. Kaugemaks ajaks helista."),
    ]),
    ("teenused", "Teenused", [
        ("Mis vahe on masinlõikusel ja tavalisel lõikusel?", "Masinlõikus tehakse ühe või kahe otsikuga ühtlaseks. Tavalises lõikuses kasutame kääre ja masinat, teeme üleminekud ja kujundame soengu."),
        ("Mis on fade?", "Sujuv üleminek lühikesest pikemaks külgedel ja kuklas. Võib alata nullist (skin fade) või jätta natuke pikkust (taper)."),
        ("Kas lõikate ka naisi?", "Oleme meeste salong, aga lühikesed masinlõikused teeme kõigile. Küsi telefoni teel."),
        ("Kas pean enne juuksed pesema?", "Ei pea. Vajadusel peseme juuksed enne lõikust ja see sisaldub hinnas."),
    ]),
    ("tasumine", "Tasumine", [
        ("Kuidas saab maksta?", "Pangakaardi või sularahaga salongis pärast teenust."),
    ]),
    ("lapsed", "Lapsed", [
        ("Mis vanusest lõikate lapsi?", "Umbes 3. eluaastast. Poiste lõikuse hind kehtib kuni 12-aastastele."),
        ("Kas lapsevanem võib juures olla?", "Muidugi. Väiksemad lapsed võivad istuda ka vanema süles."),
        ("Mis on Isa + poeg?", "Kaks lõikust järjest. Broneeri üks aeg ja kirjuta lisainfosse lapse vanus."),
    ]),
]
cats = "\n".join(f'        <button type="button" data-cat="{k}" aria-pressed="false">{t}</button>' for k, t, q in FAQ)
qas = "\n".join(f'''      <details data-cat="{k}"><summary>{q}</summary><div class="a"><span class="cat">{t}</span><p>{a}</p></div></details>''' for k, t, qs in FAQ for q, a in qs)
page("kkk.html", "KKK · Borei", "Korduma kippuvad küsimused: broneerimine, hilinemine, tasumine ja laste lõikused Boreis.",
     phead("KKK", "Küsimused <em>& vastused</em>", "Otsi märksõnaga või vali teema. Ei leidnud? Helista.") + f'''
<section class="sec">
  <div class="wrap faq-grid">
    <aside class="faq-side">
      <div class="fld search"><label for="faq-q">Otsi</label><input id="faq-q" type="search" placeholder="nt hilinemine"></div>
      <div class="faq-cats" role="group" aria-label="Teemad">
        <button type="button" data-cat="all" aria-pressed="true">Kõik</button>
{cats}
      </div>
      <p style="margin-top:30px"><a class="btn btn--line" href="{TEL}">Helista {PHONE} <span class="ar">→</span></a></p>
    </aside>
    <div>
      <div class="qa">
{qas}
      </div>
      <p class="empty" id="faq-none" hidden style="margin-top:24px">Sellist küsimust ei leidnud. Helista {PHONE}, vastame kohe.</p>
    </div>
  </div>
</section>''')

# ------------------------------------------------------------ KONTAKT
page("kontakt.html", "Kontakt · Borei", "Borei kontakt: Keskallee 20, Kohtla-Järve. Telefon +372 5192 0155. Lahti iga päev.", f'''<section class="sec sec--dark">
  <div class="wrap">
    <span class="eyebrow" style="color:var(--muted-d)">Kiireim on helistada</span>
    <a class="phone-xl" href="{TEL}" style="margin-top:18px">{PHONE}</a>
    <div class="clist">
      <div><span class="eyebrow">E-post</span><a href="mailto:{EMAIL}">{EMAIL}</a></div>
      <div><span class="eyebrow">Aadress</span><a href="{MAPS}" target="_blank" rel="noopener">Keskallee 20, Kohtla-Järve ↗</a></div>
      <div><span class="eyebrow">Sotsiaalmeedia</span><a href="{FB}" target="_blank" rel="noopener">Facebook ↗</a></div>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap split" style="align-items:start">
    <div>
      <form class="form" data-done="c-done" novalidate>
        <h2 style="margin-bottom:8px">Kirjuta <em>meile</em></h2>
        <div class="two">
          <div class="fld"><label for="c-name">Nimi</label><input id="c-name" type="text" autocomplete="name" required><span class="err">Kirjuta oma nimi.</span></div>
          <div class="fld"><label for="c-phone">Telefon</label><input id="c-phone" type="tel" autocomplete="tel" required><span class="err">Kontrolli numbrit.</span></div>
        </div>
        <div class="fld"><label for="c-topic">Teema</label><select id="c-topic"><option>Üldine küsimus</option><option>Broneering</option><option>Grupiaeg (pulm, sünnipäev)</option><option>Tagasiside</option></select></div>
        <div class="fld"><label for="c-msg">Sõnum</label><textarea id="c-msg" required></textarea><span class="err">Kirjuta sõnum.</span></div>
        <label class="chk"><input type="checkbox" required><span>Olen nõus, et Borei kasutab minu andmeid vastamiseks. <a href="privaatsus.html">Privaatsus</a></span></label>
        <button class="btn btn--red" type="submit">Saada <span class="ar">→</span></button>
      </form>
      <div class="done" id="c-done" hidden><span class="eyebrow eyebrow--muted">Saadetud</span><h2>Aitäh!</h2><p class="intro">Vastame tavaliselt samal päeval. Kiire küsimuse korral helista.</p></div>
    </div>
    <div>
      <span class="eyebrow eyebrow--muted">Lahtiolekuajad</span>
      <h2 style="margin:12px 0 18px">Iga <em>päev</em></h2>
      {hours()}
      <p class="muted">Riigipühadel võivad ajad erineda. Kontrolli Facebookist või helista.</p>
    </div>
  </div>
</section>
{visit()}''')

# ------------------------------------------------------------ PRIVAATSUS
page("privaatsus.html", "Privaatsus · Borei", "Borei OÜ privaatsuspoliitika: millised andmed kogume broneerimisel ja kuidas neid kasutame.",
     phead("Privaatsus", "Privaatsus", "Kuidas Borei OÜ kasutab broneerimisel ja vormides antud andmeid.") + f'''
<section class="sec">
  <div class="wrap prose">
    <p><b>Vastutav töötleja:</b> Borei OÜ (registrikood 12807446), Keskallee 20, 30322 Kohtla-Järve. Kontakt: {PHONE}, {EMAIL}.</p>
    <h2>Milliseid andmeid kogume</h2>
    <ul><li>Nimi ja telefon, kui broneerid aja või kirjutad meile.</li><li>Broneeringu andmed: teenus, meister, kuupäev ja kellaaeg.</li><li>Lisainfo, mille ise vormi kirjutad.</li></ul>
    <h2>Milleks neid kasutame</h2>
    <ul><li>Broneeringu kinnitamiseks ja meeldetuletuseks.</li><li>Sinu küsimusele vastamiseks.</li></ul>
    <p>Me ei müü ega jaga andmeid kolmandatele isikutele turunduseks.</p>
    <h2>Kui kaua hoiame</h2>
    <p>Broneeringu andmeid kuni 12 kuud ja raamatupidamise dokumente seadusega nõutud aja.</p>
    <h2>Sinu õigused</h2>
    <p>Võid küsida, milliseid andmeid sinu kohta hoiame, neid parandada või lasta kustutada. Kirjuta {EMAIL}. Kaebuse saad esitada Andmekaitse Inspektsioonile (www.aki.ee).</p>
    <h2>Küpsised ja kaart</h2>
    <p>Sait ei kasuta jälgimisküpsiseid. Avalehel ja kontaktilehel on Google Mapsi kaart, millele kehtivad Google'i tingimused.</p>
  </div>
</section>''')


# ------------------------------------------------------------ KIRJUTAMINE
def write_pages():
    for fname, p in PAGES.items():
        active = fname if fname in dict(NAV) else ""
        cls = f' class="{p["cls"]}"' if p["cls"] else ""
        html = f'''<!doctype html>
<html lang="et">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{p["title"]}</title>
<meta name="description" content="{p["desc"]}">
<meta name="theme-color" content="#f7f4ec">
{ICON}
{FONTS}
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body{cls}>
{header(active)}
<main id="sisu">
{p["body"]}
</main>
{footer()}
<script src="assets/js/main.js"></script>
</body>
</html>
'''
        with open(os.path.join(ROOT, fname), "w", encoding="utf-8") as f:
            f.write(html)


def slug(fname): return "avaleht" if fname == "index.html" else fname[:-5]


def relink(s):
    s = re.sub(r'(href|action)="(index|teenused|broneeri|galerii|meist|kkk|kontakt|privaatsus)\.html(\?[^"#]*)?"',
               lambda m: f'{m.group(1)}="#{slug(m.group(2) + ".html")}{m.group(3) or ""}"', s)
    return s.replace(CUR, "")


ROUTER = r'''
/* Ühe faili ruuter: #leht ja #leht?param=vaartus */
(function () {
  "use strict";
  var META = __META__;
  var pages = [].slice.call(document.querySelectorAll(".page[data-page]")), current = null;
  function route(hash) {
    var h = decodeURIComponent(String(hash == null ? location.hash : hash).replace(/^#/, ""));
    var m = h.match(/^([a-z-]+)(?:\?(.*))?$/), name = m && META[m[1]] ? m[1] : null;
    if (!name) {
      var el = h && document.getElementById(h);
      if (el) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); el.scrollIntoView(); return; }
      if (current) return;
      name = "avaleht";
    }
    var changed = name !== current; current = name;
    pages.forEach(function (p) { p.hidden = p.getAttribute("data-page") !== name; });
    document.querySelectorAll(".nav a, .overlay a").forEach(function (a) {
      if (a.getAttribute("href") === "#" + name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.body.classList.toggle("no-mbar", name === "broneeri");
    document.title = META[name][0];
    var d = document.querySelector('meta[name="description"]'); if (d) d.setAttribute("content", META[name][1]);
    if (window.boreiCloseMenu) window.boreiCloseMenu();
    if (name === "broneeri" && m && m[2] && window.boreiBooking) window.boreiBooking(new URLSearchParams(m[2]));
    if (changed) window.scrollTo(0, 0);
    if (window.boreiRails) window.boreiRails();
    document.querySelectorAll('.page:not([hidden]) .rise').forEach(function (r) { if (r.getBoundingClientRect().top < innerHeight) r.classList.add("in"); });
  }
  window.boreiGo = function (href) { try { history.pushState(null, "", href); } catch (e) {} route(href); };
  window.addEventListener("hashchange", function () { route(); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); window.boreiGo(a.getAttribute("href"));
  });
  route();
})();
'''


def write_single():
    blocks = []
    for fname, p in PAGES.items():
        blocks.append(f'<div class="page" data-page="{slug(fname)}"{"" if fname == "index.html" else " hidden"}>\n{p["body"]}\n</div>')
    body = relink(header("") + '\n<main id="sisu">\n' + "\n".join(blocks) + "\n</main>\n" + footer())
    assert ".html" not in re.sub(r'https?://[^"]+', "", body), "jäi .html link"
    dup = [k for k, v in collections.Counter(re.findall(r'\sid="([^"]+)"', body)).items() if v > 1]
    assert not dup, dup
    css = open(os.path.join(ROOT, "assets/css/style.css"), encoding="utf-8").read()
    js = open(os.path.join(ROOT, "assets/js/main.js"), encoding="utf-8").read()
    meta = {slug(f): [p["title"], p["desc"]] for f, p in PAGES.items()}
    router = ROUTER.replace("__META__", json.dumps(meta, ensure_ascii=False))
    first = PAGES["index.html"]
    html = f'''<!doctype html>
<html lang="et">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{first["title"]}</title>
<meta name="description" content="{first["desc"]}">
<meta name="theme-color" content="#f7f4ec">
{ICON}
{FONTS}
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
{router}</script>
</body>
</html>
'''
    out = os.path.join(ROOT, "borei-2-koik-lehed.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    return out, len(html) // 1024


if __name__ == "__main__":
    write_pages()
    out, kb = write_single()
    print(f"{len(PAGES)} lehte + {os.path.basename(out)} ({kb} KB)")
