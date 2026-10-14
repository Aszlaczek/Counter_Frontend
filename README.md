# Counter — ewidencja wyjść i nadgodzin

Panel React + TypeScript do zarządzania osobami, wyjściami i nadgodzinami. Dane są przechowywane przez osobny projekt FastAPI `Counter_Backend`. Frontend zawiera logowanie, rejestrację, odświeżanie sesji, zarządzanie osobami, dashboard i eksport Excel.

## Uruchomienie

```bash
npm install
npm run dev
```

Uruchom również backend zgodnie z jego README. Vite przekazuje `/api/*` do `http://127.0.0.1:8000` w trybie dev i preview. W środowisku produkcyjnym skonfiguruj analogiczne przekazywanie żądań na serwerze hostingowym.

```bash
npm run build
npm run preview
npm run lint
npm test
npm run test:watch
```

## Wprowadzanie czasu

1. Otwórz **Ewidencja czasu → Dodaj wpis** albo przycisk na dashboardzie lub karcie osoby.
2. Wybierz osobę. Przycisk **Dodaj nową osobę tutaj** otwiera dodatkowy formularz bez utraty wpisanej daty, czasu i opisu. Po zapisaniu nowa osoba zostaje wybrana automatycznie.
3. Wybierz **Wyjście (−)** lub **Nadgodziny (+)**.
4. Podaj dodatnią liczbę godzin i minut (0–59), datę i opcjonalny opis. Łączny czas musi być większy od zera.
5. Zapisz. W tabeli zobaczysz rodzaj wpisu oraz czas ze znakiem. Edycja pozwala także zmienić rodzaj wpisu.

Osobę można dodać z listy osób, z ewidencji czasu i bezpośrednio podczas dodawania wpisu. Wejście z karty osoby wstępnie ją wybiera, ale nie blokuje zmiany wyboru.

### Model danych i zgodność backendu

Zachowano istniejące pola `hours`, `minutes`, `person_id`, `date`, `description`. Podstawą obliczeń jest całkowita liczba minut:

```text
czas_min = hours * 60 + minutes
saldo_h = suma(czas_min) / 60
```

| Rodzaj | Czas formularza | hours w API | minutes w API | Czas w minutach |
| --- | --- | ---: | ---: | ---: |
| Nadgodziny | 1 h 30 min | 1 | 30 | 90 |
| Wyjście | 1 h 30 min | -1 | -30 | -90 |
| Wyjście | 0 h 30 min | 0 | -30 | -30 |

W `Counter_Backend/Models/schemas.py` rozszerzono walidację tworzenia i edycji: godziny mogą być ujemne, minuty mają zakres −59–59. Istniejące kolumny bazy i sumowanie obsługują ten zapis, więc migracja bazy nie jest potrzebna. **Wdrożenie wymaga obu zmian: frontendu i backendu**; starszy backend odrzuci wyjścia kodem 422. Po aktualizacji uruchom ponownie backend.

Historyczne dodatnie rekordy pozostają nadgodzinami. Aplikacja nie może odgadnąć, czy wcześniej oznaczały wyjście. Takie rekordy należy świadomie poprawić w formularzu edycji. Typ jest wyznaczany ze znaku całkowitego czasu, bez dodatkowego pola w bazie. Historyczne rekordy zerowe są nadal widoczne; formularz nie tworzy nowych zerowych wpisów.

## Filtrowanie i porównanie osób

Na stronie `/extra-hours` można łączyć:

- jedną lub wiele osób (Ctrl/Cmd przy wyborze kilku; brak wyboru oznacza wszystkich),
- rok i kwartał kalendarzowy: I = styczeń–marzec, II = kwiecień–czerwiec, III = lipiec–wrzesień, IV = październik–grudzień,
- zakres dat **Od–Do**, z obydwoma dniami włącznie,
- rodzaj wpisu: wyjścia lub nadgodziny.

Filtry działają łącznie. Kwartał bez roku obejmuje ten kwartał we wszystkich latach. Aby uzyskać jeden raport kwartalny, wybierz rok i kwartał. Odwrócony zakres dat jest sygnalizowany i blokuje eksport. Przycisk **Wyczyść filtry** przywraca cały zbiór.

Tabela pokazuje po 10 wpisów. Podsumowanie, porównanie osób i eksport obejmują **wszystkie pasujące wpisy**. Frontend pobiera kolejne strony API aż do pustej strony, również dla baz powyżej 500 rekordów. Błąd pobierania blokuje prezentację raportu i eksport częściowych danych. Rekordy są uporządkowane według daty, ID osoby i ID wpisu.

Na karcie osoby link **Filtruj i eksportuj czas tej osoby** otwiera ewidencję z ustawionym filtrem.

## Eksport do Excela

Przycisk **Eksportuj Excel (.xlsx)** zapisuje prawdziwy plik XLSX odpowiadający bieżącym filtrom. XLSX jest współczesnym formatem Excela; plik nie jest tekstem CSV ze zmienionym rozszerzeniem.

| Arkusz | Zawartość |
| --- | --- |
| Rekordy | Jeden wpis w każdym wierszu; tabela `RekordyCzasu`, filtry nagłówków, zamrożony nagłówek. |
| Podsumowanie | Jeden wiersz na ID osoby: dodatnie nadgodziny, ujemne wyjścia, saldo w minutach i godzinach, liczba wpisów. |
| Instrukcja | Wybrane filtry, opis jednostek, znaków i zasad obliczeń. |

Kolumny arkusza **Rekordy**: ID wpisu, ID osoby, imię, nazwisko, wydział, data, rok, kwartał, rodzaj, czas w minutach, godziny dziesiętne, opis.

Czas jest liczbą, data jest datą Excela, a rok i kwartał są liczbami. Oddzielne identyfikatory pozwalają rozróżniać osoby o tym samym imieniu i nazwisku. Dla obliczeń używaj kolumny **Czas w minutach**, następnie dziel sumę przez 60. Godziny dziesiętne mają format dwóch miejsc po przecinku, ale zachowują pełną wartość. Nie zapisujemy czasu jako tekstu „1 h 30 min”.

Przykład w polskim Excelu: `=SUMA(RekordyCzasu[Czas w minutach])/60`. Można również użyć tabeli przestawnej grupującej dane po ID osoby, roku i kwartale. Opisy i nazwiska są zapisywane jako tekst, także gdy zaczynają się od znaku `=`.

Arkusz **Podsumowanie** jest migawką w chwili eksportu. Po ręcznej zmianie danych w arkuszu Rekordy należy ponownie obliczyć podsumowanie. Nie ma scalonych komórek ani wierszy sum pomiędzy rekordami, co ułatwia dalsze obliczenia i import.

## Struktura i testy

- `src/pages/` — ekrany aplikacji i filtry ewidencji.
- `src/components/PersonForm.tsx` — wspólny formularz osoby.
- `src/components/EntryKindSelect.tsx` — wybór rodzaju czasu.
- `src/services/pagination.ts` — pobieranie wszystkich stron API.
- `src/utils/timeRecords.ts` — obliczenia czasu, filtry i agregacje.
- `src/utils/exportRecords.ts` — budowanie i pobieranie XLSX; ładowane dopiero przy eksporcie.
- `tests/` — testy logiki, formularzy, listy, eksportu i integracji API.
- [agents/DONE.md](agents/DONE.md) — wykonane zmiany i wyniki sprawdzeń.
- [agents/TODO.md](agents/TODO.md) — przeniesiona lista prac i dalsze usprawnienia.

Testy frontendu uruchamia `npm test`. Nie wymagają działającego serwera. Test eksportu zapisuje i ponownie odczytuje XLSX. Testy formularzy używają React Testing Library.

Test integracyjny wymaga sąsiedniego backendu z jego zależnościami testowymi:

```bash
../Counter_Backend/env/bin/python tests/backend_signed_time.py
PYTHONDONTWRITEBYTECODE=1 ../Counter_Backend/env/bin/python ../Counter_Backend/test_api.py
```

Oba polecenia używają izolowanej bazy testowej, bez modyfikowania bazy użytkownika.

## Ograniczenia

Filtrowanie i eksport odbywają się w przeglądarce po pobraniu całego zbioru. Dla dużych baz warto przenieść je do API. Eksport odzwierciedla dane ostatnio pobrane na stronę; nie zapewnia transakcyjnej migawki przy równoczesnej pracy kilku administratorów. ExcelJS jest dużą zależnością, dlatego ma oddzielny moduł ładowany przy eksporcie. Pozostałe prace są opisane w `agents/TODO.md`.
