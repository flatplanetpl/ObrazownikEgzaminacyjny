# Plany funkcjonalności

## Priorytety

1. **Tryb egzaminacyjny** - zamknięta sesja 20/40/60 pytań z limitem czasu, wynikiem końcowym i raportem błędów.
2. **Inteligentne powtórki** - osobny widok wybierający materiał według najsłabszych pól: autor, tytuł, epoka, styl.
3. **Rozpoznawanie po fragmencie obrazu** - pytania na podstawie wykadrowanego detalu dzieła.
4. **Oś czasu / chronologia** - mini-gra w układanie dzieł według daty albo wybór wcześniejszego dzieła.
5. **Najczęściej mylone pary** - wykrywanie dzieł, stylów lub autorów, które użytkownik regularnie myli.
6. **Fiszki dzienne** - krótka codzienna porcja materiału z podsumowaniem.

## Priorytet 1: Tryb egzaminacyjny

Tryb egzaminacyjny powinien działać jako osobna zakładka **Egzamin**, niezależna od obecnej zakładki **Gra**. Obecna gra pozostaje treningiem z natychmiastowym feedbackiem i aktualizacją mastery, a egzamin jest testem kontrolnym.

### Założenia

- Presety: 20 pytań / 20 minut, 40 pytań / 40 minut, 60 pytań / 60 minut.
- Zakres v1: cała baza dzieł i wszystkie typy pytań: autor, tytuł, epoka, styl.
- W trakcie sesji nie pokazywać poprawnej odpowiedzi ani fiszki.
- Po zakończeniu pokazać wynik, czas, liczbę poprawnych, błędnych i nieodpowiedzianych pytań.
- Błędne, udzielone odpowiedzi mają trafiać do obecnego postępu jako pomyłki, żeby zasilały tryb słabszych powtórek.
- Poprawne odpowiedzi egzaminacyjne nie podbijają globalnego mastery.

### Zakres implementacji

- Dodać zakładkę `exam` do routingu aplikacji i paska zakładek.
- Dodać czystą logikę generowania pytań egzaminacyjnych oraz oceniania wyniku.
- Dodać osobny zapis historii egzaminów w localStorage pod kluczem `obrazownik-egzaminy-v1`.
- Ograniczyć historię do ostatnich 20 wyników.
- Dodać ekran startu, ekran trwającej sesji i ekran wyniku.
- Dodać CTA **Powtórz błędy**, które przełącza do zakładki **Gra** i ustawia tryb kolejności na `weak`.

### Weryfikacja

- `npm run lint`
- `npm run build`
- Nie uruchamiać `npm run dev`, `npm run preview` ani aplikacji bez osobnej zgody użytkownika.
