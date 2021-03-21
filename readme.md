# Vefforritun 2, 2021, hópverkefni 1

Heroku hlekkur: https://vefforritun2-h1.herokuapp.com/

---

Vefþjónusta fyrir sjónvarpsþáttavef:

* Gefin eru gögn fyrir sjónvarpsþætti, season og staka þætti.
* Hægt er að skoða öll gögn um sjónvarpsþætti án innskráningar.
* Notendaumsjón:
  * Stjórnendur geta breytt, bætt við, og eytt sjónvarpsþáttum, seasons og stökum þáttum.
  * Notendur geta skráð sína „stöðu“ fyrir sjónvarpsþátt, season og staka þætti.

## Uppsetning

1. Búa til gagnagrunn, t.d. `createdb vef2-2021-h1`.
2. Búa til Cloudinary aðgang.
3. Afrita `.env.example` í `.env ` og setja réttar upplýsingar fyrir gagnagrunn og Cloudinary.
4. Keyra eftirfarandi skipanir:

```
npm install
npm run test
npm run setup
npm run start
```

## Dæmi um köll í vefþjónustu

### Sjónvarpsþættir

* `/tv`
  * `GET` skilar síðum af sjónvarpsþáttum með grunnupplýsingum
  * `POST` býr til nýjan sjónvarpsþátt, aðeins ef notandi er stjórnandi
    *  `{}`
* `/tv/:id`
  * `GET` skilar stöku sjónvarpsþáttum með grunnupplýsingum, meðal einkunn sjónvarpsþáttar, fjölda einkunna sem hafa verið skráðar fyrir sjónvarpsþátt, fylki af tegundum sjónvarpsþáttar (genres), fylki af seasons, rating notanda, staða notanda
  * `PATCH`, uppfærir sjónvarpsþátt, reit fyrir reit, aðeins ef notandi er stjórnandi
    * `{}`
  * `DELETE` eyðir sjónvarpsþætti, aðeins ef notandi er stjórnandi
* `/tv/:id/season/`
  * `GET` skilar fylki af öllum seasons fyrir sjónvarpsþátt
  * `POST` býr til nýtt í season í sjónvarpþætti, aðeins ef notandi er stjórnandi
    * `{}`
* `/tv/:id/season/:id`
  * `GET` skilar stöku season fyrir þátt með grunnupplýsingum, fylki af þáttum
  * `DELETE` eyðir season, aðeins ef notandi er stjórnandi
* `/tv/:id/season/:id/episode/`
  * `POST` býr til nýjan þátt í season, aðeins ef notandi er stjórnandi
    * `{}`
* `/tv/:id/season/:id/episode/:id`
  * `GET` skilar upplýsingum um þátt
  * `DELETE` eyðir þætti, aðeins ef notandi er stjórnandi
* `/genres`
  * `GET` skilar síðu af tegundum (genres)
  * `POST` býr til tegund, aðeins ef notandi er stjórnandi
    * `{}`

### Notendur

* `/users/`
  * `GET` skilar síðu af notendum, aðeins ef notandi sem framkvæmir er stjórnandi
* `/users/:id`
  * `GET` skilar notanda, aðeins ef notandi sem framkvæmir er stjórnandi
  * `PATCH` breytir hvort notandi sé stjórnandi eða ekki, aðeins ef notandi sem framkvæmir er stjórnandi og er ekki að breyta sér sjálfum
    * `{}`
* `/users/register`
  * `POST` staðfestir og býr til notanda. Skilar auðkenni og netfangi. Notandi sem búinn er til skal aldrei vera stjórnandi
    * `{}`
* `/users/login`
  * `POST` með netfangi og lykilorði skilar token ef gögn rétt
    * `{"email": "notandi@notandi.is", "password": "12345678"}`
* `/users/me`
  * `GET` skilar upplýsingum um notanda sem á token, auðkenni og netfangi, aðeins ef notandi innskráður
  * `PATCH` uppfærir netfang, lykilorð eða bæði ef gögn rétt, aðeins ef notandi innskráður
    * `{}`


### Sjónvarpsþættir og notendur

* `/tv/:id/rate`
  * `POST` skráir einkunn innskráðs notanda á sjónvarpsþætti, aðeins fyrir innskráða notendur
    * `{}`
  * `PATCH` uppfærir einkunn innskráðs notanda á sjónvarpsþætti
    * `{}`
  * `DELETE` eyðir einkunn innskráðs notanda á sjónvarpsþætti
* `/tv/:id/state`
  * `POST` skráir stöðu innskráðs notanda á sjónvarpsþætti, aðeins fyrir innskráða notendur
    * `{}`
  * `PATCH` uppfærir stöðu innskráðs notanda á sjónvarpsþætti
    * `{}`
  * `DELETE` eyðir stöðu innskráðs notanda á sjónvarpsþætti
* `/tv/:id`
  * Ef notandi er innskráður skal sýna einkunn og stöðu viðkomandi á sjónvarpsþætti.


## Innskráning

Til eru tveir fyrirfram skilgreindir notendur:

- Stjórnandi
  - Email: `admin@admin.is`
  - Lykilorð: `12345678`
- Venjulegur notandi
  - Email: `notandi@notandi.is`
  - Lykilorð: `12345678`

Hægt að skrá sig inn með `POST` á `/users/login` með body:

`{"email": "admin@admin.is", "password": "12345678"}`

eða

`{"email": "notandi@notandi.is", "password": "12345678"}`

## Hópur

- Kári Kjærnested, kak25@hi.is, [kak25](https://github.com/kak25)
- Óskar Helgi Berenguer, ohb5@hi.is, [oscar6662](https://github.com/oscar6662)
- Þórður Skúlason, ths261@hi.is, [DoddiSkula](https://github.com/DoddiSkula)
