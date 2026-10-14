# Wykonane zmiany — 2026-10-14

## Rozpoznanie projektu

Przejrzano routing, modele TypeScript, serwisy REST, formularze, dashboard, istniejący eksport w starszym komponencie Table oraz schematy, agregacje i testy sąsiedniego Counter_Backend. Dotychczas aktywna ewidencja nie miała eksportu, listy pomocnicze kończyły się na 500 rekordach, a API odrzucało ujemny czas.

## Funkcje

- Ewidencja obsługuje nadgodziny dodatnie i wyjścia ujemne, w tym wyjścia krótsze niż godzina. Wybór rodzaju jest widoczny w tworzeniu i edycji; tabela pokazuje rodzaj i podpisany czas.
- Obliczenia opierają się na całkowitych minutach `hours * 60 + minutes`. Formularz przyjmuje dodatnią wielkość czasu, waliduje całkowite liczby i odrzuca czas zerowy. Podczas edycji puste pole godzin zapisuje zero, zamiast pozostawiać poprzednią wartość.
- Ponownie wykorzystany formularz osoby działa na osobnej stronie i przy dodawaniu czasu. Nowa osoba jest automatycznie wybrana, a szkic wpisu pozostaje zachowany. Dodano wejście do tworzenia osoby z listy ewidencji.
- Filtry wielu osób, rodzaju wpisu, roku, kwartału i dat działają łącznie. Granice dat są włączne. Niepoprawny zakres blokuje eksport. Link z karty osoby ustawia filtr osoby.
- Porównanie osób obejmuje osobno nadgodziny, wyjścia, saldo i liczbę wpisów.
- Pobieranie API obejmuje wszystkie strony; błąd lub powtarzające się rekordy uniemożliwiają eksport niepełnego zbioru. Dashboard także korzysta z pełnych danych, bez osobnego zapytania o saldo każdej osoby.
- Eksport XLSX obejmuje pełny wynik filtrów, niezależnie od paginacji tabeli. Zawiera arkusze Rekordy, Podsumowanie i Instrukcja. Daty i wartości liczbowe zachowują typy, identyfikatory rozróżniają osoby o tych samych nazwiskach, a opisy pozostają tekstem. Szczegóły kolumn i przykład formuły znajdują się w README.
- Rozdzielono stan usuwania osoby od usuwania wpisu na karcie osoby, aby zbieżne identyfikatory nie otwierały niewłaściwego potwierdzenia.
- Poprawiono zastane błędy lintowania i zależności hooków w starszych komponentach.

## Backend

Za zgodą na zapis poza workspace zmieniono sąsiedni projekt:

- `Counter_Backend/Models/schemas.py`: godziny ze znakiem, minuty −59–59, dla POST i PUT.
- `Counter_Backend/test_api.py`: przypadek niedozwolonych ujemnych godzin zastąpiono minutami −60, zgodnie z nowym kontraktem.

Nie zmieniano bazy użytkownika. Obecne kolumny i sumowanie wspierają liczby ze znakiem. Wdrożenie musi obejmować również backend; starsze API zwraca 422 dla wyjść. Nie przeprowadzono automatycznej zmiany znaczenia historycznych dodatnich wpisów.

## Weryfikacja

- `npm test`: **15/15** testów w 4 plikach.
- `npm run build`: **OK**, TypeScript i produkcyjny build Vite.
- `npm run lint`: **OK**, bez błędów i ostrzeżeń.
- `../Counter_Backend/env/bin/python tests/backend_signed_time.py`: **1/1** test integracyjny. Sprawdza POST, PUT, odczyt, saldo osoby, podsumowanie oraz odrzucanie minut poza zakresem.
- `PYTHONDONTWRITEBYTECODE=1 ../Counter_Backend/env/bin/python ../Counter_Backend/test_api.py`: **11/11** dotychczasowych testów API.

Testy frontendu obejmują ujemne minuty, zerowy i niepoprawny czas, granice kwartałów i rok przestępny, zakres dat, filtrowanie osób i rodzaju, dokładne salda, pobranie ponad 500 rekordów, błąd kolejnej strony, ponowny odczyt XLSX, tekst zaczynający się od `=`, dodawanie osoby bez utraty szkicu, zmianę rodzaju przy edycji, eksport wszystkich stron wybranego kwartału i blokadę eksportu przy błędzie pobrania.

Testy API działają na izolowanej tymczasowej bazie. Nie wykonano ręcznej akceptacji w przeglądarce na środowisku wdrożeniowym. Build zgłasza ostrzeżenia istniejącej biblioteki ExcelJS 3.x: użycie eval w zależności i duży moduł eksportu. Biblioteka ładuje się dopiero po kliknięciu eksportu. npm po instalacji narzędzi testowych zgłosił 23 podatności zależności; aktualizację wydzielono w TODO.

## Dokumentacja

README opisuje obsługę, znaki czasu, wymagania backendu, filtry kwartalne, model arkusza i uruchamianie testów. Główny TODO.md przeniesiono do agents/TODO.md, zachowując wcześniejszą listę wykonanych prac i aktualizując dalsze zadania.
