# Borei OÜ · täidetud mall

## Ettevõte

* **Nimi:** Borei OÜ (reg. kood 12807446, staatus aktiivne)
* **Valdkond:** meeste juuksur / barber (kataloogides „Meeste juuksurisalong Borei”, avatud 2015)
* **Asukoht:** Keskallee 20, 30322 Kohtla-Järve, Ida-Viru maakond
* **Keel:** eesti (soovitus: lisada vene keel, sest Kohtla-Järvel on suur venekeelne kliendibaas)
* **Omanik:** Irina Oja
* **Kontakt:** +372 5192 0155 · irinabograya@gmail.com · facebook.com/MJSborei
* **Maine:** Google Maps 4,8 (149 arvustust)

## Stiil

* **Üldmulje:** terav, tõsine ja puhas. Meeste salong, kuid soe, mitte külm.
* **Värvid:** soe paberjas hall-beež (#EBE7DF), grafiitmust (#161616), üks aktsent: tumesinine (#0C3E65)
* **Mida EI ole:** ümaraid nurki, em dash'e, lillat värvi, gradiente, „AI-välimusega” leiutatud efekte
* **Kirjad:** Barlow Condensed (pealkirjad, suurtähed), Barlow (sisu), IBM Plex Mono (sildid, hinnad, kellaajad)

### Inspiratsioon ja kust mis pärit on

Lingid: lapa.ninja (beauty), godly.design, refero.design. Lapa.ninja keelas automaatse ligipääsu (HTTP 403)
ja godly/refero valikus olid peamiselt tehnoloogiaettevõtted, seega võtsin võrdluseks tuntud barbershop'ide
päris saidid (sellised, mida need galeriid koguvad) ja lugesin nende CSS-ist välja värvid ja kirjad:

| Allikas | Mis võetud |
|---|---|
| Fellow Barber (fellowbarber.com) | soe paberjas taust #EBE7DF ja grafiit tekst |
| Ruffians (ruffians.co.uk) | tumesinine aktsent #0C3E65, broneerimisnupp päises, asukohaplokk koos lahtiolekuaegadega |
| Blind Barber (blindbarber.com) | suured groteskpealkirjad + mono-kirjas väikesed sildid (Monument Grotesk / Semi-Mono loogika) |
| Murdock London (murdocklondon.com) | suurtähtedes menüü, range ruudustik, #303030 tekstitoon |
| Schorem (schorembarbier.nl) | hinnakiri nagu salongi seinatahvel (tume plokk, read joontega) |
| godly.design (üldine) | peenikesed jooned (hairline) sektsioonide vahel, numbritega sammud 01–04 |

## Lehed

1. Avaleht (`index.html`)
2. Teenused ja hinnad (`teenused.html`)
3. Broneeri aeg (`broneeri.html`)
4. Tööd / galerii (`galerii.html`)
5. Meist + meeskond (`meist.html`)
6. Kinkekaart (`kinkekaart.html`)
7. KKK (`kkk.html`)
8. Kontakt (`kontakt.html`)
9. Privaatsus (`privaatsus.html`)

## Funktsioonid

* [x] Broneerimine sammudena: teenus → meister → aeg → andmed (kokkuvõte kõrval, `?teenus=` eelvalik hinnakirjast)
* [ ] E-pood ostukorviga (pole väikesele barbershop'ile vajalik)
* [x] Kinkekaardid eelvaatega (summa või teenus, 3 värvi, saaja/saatja/soov, kood)
* [x] Kontaktivorm (valideerimisega)
* [x] KKK avanevate vastustega (4 teemat, sisukord)
* [x] Galerii filtritega (Fade, Klassika, Lühike, Habe, Poisid) + suurendatud vaade
* [x] Muu: „Täna avatud / suletud” riba, tänase päeva esiletõst lahtiolekuaegades, Google Maps kaart, mobiilis püsiv „Helista / Broneeri” riba

## Sisu

* **Päris andmed:** nimi, reg. kood, aadress, telefon, e-post, Facebook, omaniku nimi, asutamisaasta 2015, hinne 4,8 / 149 arvustust
* **Kontrollida:** lahtiolekuajad (E–R 10–19, L–P 10–16) on võetud kataloogist beautynailhairsalons.com
* **Näidised (asenda):** hinnad ja kestused, meistrid Andrei ja Olga, galerii pealdised, KKK vastuste tingimused (tühistamine 3 h, hilinemine 15 min, kinkekaart 12 kuud)
* **Pildid:** kohatäited, hero-pilt tuleb hiljem

## Tehniline

* Staatiline HTML + CSS + JS, ilma raamistiketa
* Testitud 400 px, 820 px ja 1440 px laiusel, horisontaalset kerimist pole
* Ühtne päis ja jalus kõigil lehtedel
