# Vefforritun 2, 2021, hópverkefni 1

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

TODO

## Innskráning

Til eru tveir fyrirfram skilgreindir notendur:

- Stjórnandi með email `admin@admin.is` og lykilorð `12345678`.
- Venjulegur notandi með email `notandi@notandi.is` og lykilorð `12345678`.

Hægt að skrá sig inn með POST á `/users/login` með body:

`{"email": "admin@admin.is", "password": "12345678"}`

eða

`{"email": "notandi@notandi.is", "password": "12345678"}`

## Hópur

- Kári Kjærnested, kak25@hi.is, kak25
- Óskar Helgi Berenguer, ohb5@hi.is, [oscar6662](https://github.com/oscar6662)
- Þórður Skúlason, ths261@hi.is, [DoddiSkula](https://github.com/DoddiSkula)
