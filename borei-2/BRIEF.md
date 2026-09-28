# Borei OÜ · versioon 2 · täidetud mall

## Ettevõte

* **Nimi:** Borei OÜ (reg. kood 12807446), meeste juuksur / barber, avatud 2015
* **Asukoht:** Keskallee 20, 30322 Kohtla-Järve
* **Keel:** eesti (soovitus: lisada vene keel)
* **Kontakt:** +372 5192 0155 · irinabograya@gmail.com · facebook.com/MJSborei
* **Maine:** Google Maps 4,8 (149 arvustust)

## Stiil

* **Üldmulje:** toimetuslik ja enesekindel. Suur seriifkiri, must ja kreem, üks julge aktsent.
* **Värvid:** kreem #F7F4EC, must #0F0F0F, aktsent punakasoranž #CF3B22 (tumedal taustal #FF7A5C)
* **Kirjad:** Instrument Serif (pealkirjad, kursiivsed rõhud), Hanken Grotesk (tekst, väikesed suurtähtsildid)
* **Mida EI ole:** ümaraid nurki, em dash'e, lillat, gradiente
* **Erinevus versioonist 1:** v1 oli paberjas beež + tumesinine + kitsas groteskkiri + mono-sildid.
  v2 on kreem + must + punane, seriifkiri, täislaiuses tume hero ja kalendriga broneerimine.

### Inspiratsioon ja kust mis pärit on

Otsisin antud galeriidest. **refero.design** (saitide andmebaas, kategooriad Lifestyle / Health & Wellness)
andis enamiku eeskujudest. **godly.design** näitab praegu peamiselt tehnoloogiaettevõtteid ja sealt võtsin ainult
üldise võtte. **lapa.ninja** keelab automaatse ligipääsu (HTTP 403), seda ei saanud läbi vaadata.

| Allikas (refero.design) | Mis võetud |
|---|---|
| AVNIER (avnier.com) | mustvalge täislaiuses hero, nummerdatud slaidid 01–03 edenemisjoontega, pealkiri + loendur „(14)” |
| Volkshotel (volkshotel.nl) | kastis logo „BO\|REI”, kastis „Menüü” nupp, keskel olev lühitekst (Meist-lehel) |
| Fresha (fresha.com) | suur seriifpealkiri ja otsinguriba tüüpi kiirbroneerimine hero all |
| Nudea (nudea.com) | seriifkiri kursiivsete rõhuasetustega |
| Aesop (aesop.com) | kreemjas toon, horisontaalne teenuste rida keskele joondatud pealdiste ja edenemisribaga |
| Prose (prose.com) | sammud „1/ 2/ 3/ 4/” |
| Polaroid (polaroid.com) | punakasoranž aktsent |
| godly.design (üldine) | hiiglaslik sõnamärk jaluses |

**Muudatused kliendi tagasiside põhjal:** eemaldatud jooksev märksõnariba, avalehe manifestiplokk ja kinkekaardi leht.

## Lehed

1. Avaleht (`index.html`)
2. Teenused ja hinnad (`teenused.html`)
3. Broneeri aeg (`broneeri.html`)
4. Tööd (`galerii.html`)
5. Meist + meeskond (`meist.html`)
6. KKK (`kkk.html`)
7. Kontakt (`kontakt.html`)
8. Privaatsus (`privaatsus.html`)

## Funktsioonid

* [x] Broneerimine sammudena: teenus → meister → aeg (kalender + hommik/päev/õhtu) → andmed; allservas püsiv kokkuvõtteriba; lõpus „Lisa kalendrisse” (.ics)
* [x] Kiirbroneerimine avalehe hero all (teenus + päev → avab broneerimise õigest sammust)
* [ ] E-pood ostukorviga (pole vajalik)
* [ ] Kinkekaardid (eemaldatud kliendi soovil)
* [x] Kontaktivorm
* [x] KKK avanevate vastustega + otsing + teemafilter
* [x] Galerii filtritega (loenduritega) + täisekraani vaade
* [x] Muu: hero slaidid, „praegu avatud” olek, tänase päeva esiletõst, mobiilis „☎ / Broneeri” riba

## Sisu

* **Päris andmed:** nimi, reg. kood, aadress, telefon, e-post, Facebook, omanik Irina Oja, asutatud 2015, hinne 4,8 / 149 arvustust
* **Kontrollida:** lahtiolekuajad (E–R 10–19, L–P 10–16), pärit kataloogist
* **Näidised (asenda):** hinnad ja kestused, meistrid Andrei ja Olga, galerii pealdised, KKK tingimused
* **Pildid:** kohatäited, hero-pildid (3 slaidi) tulevad hiljem

## Tehniline

* Staatiline HTML + CSS + JS, ilma raamistiketa
* Testitud 400 px ja 1440 px laiusel, horisontaalset kerimist pole
* Ühtne päis ja jalus kõigil lehtedel (genereeritakse `tools/koosta.py` abil)
* `borei-2-koik-lehed.html`: kõik lehed ühes failis, töötab ka liivakastis (nt vestluse eelvaates)
