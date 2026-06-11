/**
 * @file PlanView.tsx
 * @description Statyczny opis planu i pętli nauki w grze.
 * @dependencies brak
 */

export function PlanView() {
  return (
    <div className="glass-strong space-y-5 rounded-3xl p-5 leading-relaxed sm:p-7">
      <div>
        <h2 className="text-xl font-extrabold">Plan gry</h2>
        <p className="mt-2 text-sm text-ink/90 sm:text-base">
          <strong className="text-accent-soft">Cel:</strong> połączyć rozpoznawanie obrazu z aktywnym przypominaniem
          autora i tytułu dzieła.
        </p>
      </div>

      <div>
        <h3 className="text-base font-extrabold text-accent-soft">Pętla nauki</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink/90 sm:text-base">
          <li>Gra pokazuje sam obraz bez podpisu.</li>
          <li>Losuje pytanie o autora albo tytuł.</li>
          <li>Po odpowiedzi pokazuje pełną fiszkę z rokiem, epoką, stylem, typem dzieła i ewentualną notatką.</li>
          <li>Błędne odpowiedzi dostają większą wagę w kolejnych losowaniach.</li>
        </ol>
      </div>

      <div>
        <h3 className="text-base font-extrabold text-accent-soft">Tryby</h3>
        <p className="mt-2 text-sm text-ink/90 sm:text-base">
          <strong>Gra</strong> służy do treningu wielokrotnego wyboru. <strong>Egzamin</strong> sprawdza gotowość bez
          natychmiastowych podpowiedzi. <strong>Fiszki</strong> są do spokojnego powtarzania. <strong>Galeria</strong>{' '}
          pozwala szybko sprawdzić cały materiał. <strong>Postęp</strong> pokazuje, co trzeba powtórzyć.
        </p>
      </div>

      <div>
        <h3 className="text-base font-extrabold text-accent-soft">Zakres</h3>
        <p className="mt-2 text-sm text-ink/90 sm:text-base">
          W zestawie są wszystkie slajdy z dziełami: od Goi i romantyzmu po sztukę współczesną, architekturę, fotografię,
          performance, wideo i instalacje.
        </p>
        <p className="mt-2 text-sm text-muted">
          Uwaga dydaktyczna: „epoka” jest uproszczoną ramą chronologiczną, a „styl” oznacza dominujący kierunek. Niektóre
          dzieła graniczne mają szerokie etykiety, bo w historii sztuki bywają klasyfikowane na kilka sposobów. Domyślnie
          gra pyta tylko o autora i tytuł - epokę i styl można włączyć w panelu ustawień trybu Gra.
        </p>
      </div>
    </div>
  );
}
