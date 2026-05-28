# KBN Signature Homes — statyczna strona (szablon)

Pliki w katalogu głównym repozytorium: `index.html`, podstrony HTML, `styles.css`, `logo.png`.

## Publikacja na GitHub Pages

1. Wypchnij repozytorium na GitHub (np. `username/kuba-templatka`).
2. W repozytorium: **Settings → Pages**.
3. **Source**: *Deploy from a branch*, wybierz gałąź (np. `main`) i folder **`/ (root)`**, zapisz.
4. Strona będzie pod adresem w stylu **`https://<username>.github.io/<nazwa-repo>/`** — np. jeśli repo nazywa się `kuba-templatka`, pierwszy ekran to `.../kuba-templatka/` lub `.../kuba-templatka/index.html`.

## Warianty kolorystyczne (strona główna)

| Plik | Opis |
|------|------|
| `index.html` | Oryginał — ciemny midnight navy + złoto |
| `index-jasna.html` | Jaśniejszy navy + złoto |
| `index-granat.html` | Granat jak WirtualneMedia.pl (`#041727` / `#092C48`) + złoto |
| `index-redakcyjna.html` | Styl portalu: ciemny hero/stopka, jasne tło `#f2f3f7` w treści + złoto |

Złoto we wszystkich wariantach pozostaje bez zmian.

Linki w szablonie są **względne** (`index.html`, `./#services`, `styles.css`, `logo.png`), więc działają w podkatalogu projektowej strony GitHub Pages bez ustawiania osobnej domeny.

W repozytorium jest **`.nojekyll`**, żeby GitHub Pages nie przetwarzał plików przez Jekyll.

### Strona użytkownika (`username.github.io`)

Jeśli to repozytorium nazwiesz dokładnie **`<twoja-nazwa-użytkownika>.github.io`**, witryna będzie pod **`https://<username>.github.io/`** — te same ścieżki względne nadal są poprawne.

## Logo i assety

Dodaj plik **`logo.png`** obok `index.html` (jeśli jeszcze go nie ma w repo), inaczej w nawigacji i stopce zobaczysz pusty obrazek.

## Lokalny podgląd

Możesz otworzyć `index.html` w przeglądarce albo uruchomić prosty serwer HTTP w tym katalogu, np.:

```bash
python3 -m http.server 8080
```

Następnie wejdź na `http://localhost:8080/`.
