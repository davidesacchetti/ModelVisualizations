#!/bin/bash

#-- help on line per scripts di mmm

#------------------------------------------------------------------------------|
case "$1" in
  ensview)
    text="$1 Implementato da Davide nel gennaio 2016
scopo: visualizzare uscite di un ensemble con più membri

WIDGETS (BOTTONI)
i bottoni in alto a sinistra selezionano la variabile da plottare
quelli in alto centrali definiscono il tipo di grafico,
quelli in alto a dx i raggruppamenti.
La riga di bottoni in basso seleziona il tempo a cui fare il plot,
quelli in verticale a sx il membro dell'ensemble.
Questi 5 gruppi di bottoni sono dei radiobox, il primo elemento è il default.

MOUSE
* se clicco su un bottone: qualunque mouse button seleziona quel bottone
* se non clicco su un bottone ma clicco all'interno della PLOT AREA:
** col mouse button centrale sposto il tempo in avanti
** col mouse button sinistro sposto il tempo indietro
** col mouse scroll-up cambio il membro in avanti
** col mouse scroll-down cambio il membro indietro
** col mouse button destro single-click seleziono un punto sul quale parte il grafico a plume
** col mouse button destro drag seleziono un'area per lo zoom, che diventa attivo
   (posso cambiare lo zoom indefinitamente)
* se clicco fuori dai bottoni e fuori dalla plot-area resetto lo zoom
quando sono in modalità plume, se clicco su un'altra variabile ottengo
un nuovo plume sul precedente punto selezionato, per uscire dal plume posso cliccare
su un altro bottone (ex OnePlot)

Nel grafico tipo plume vedo:
* tutti i membri (grigio)
* il run selezionato (blu)
* la fascia 20mo - 80mo percentile (azzurrino)
* la media (rosso)
* la sigma (viola)

Tipo di grafico:
* Single: plotta un solo membro dell'ensemble,
  definito dai numeri verticali a sx
* Anomaly: plotta la differenza tra il membro dell'ensemble definito
  dai numeri verticali a sx e l'Ensemble Mean
  dell'ensemble definito dai numeri verticali a sx
* Max: plotta il max pixel tra i diversi membri
* Min: analogo a Max ma per il Min
* Mean: plotta la media dei membri
* Spread: Max - Min
* Perc80: 80mo percentile
* Sigma: la deviazione standard dei membri

Raggruppamenti:
* OnePlot: una mappa per il solo membro selezionato (o un solo max ecc.)
* AllMem: un multipanel con le mappe di tutti i membri
* AllTime: un multipanel con le mappe di tutti i tempi per il solo membro
  selezionato (o un solo max ecc.)
* Quit: esce dal programma
"
#------------------------------------------------------------------------------|
  ;;
  *)
    echo "FATAL: $0 <$1> non implementato"
    exit
  ;;
esac


cat <<EOF | less
$text
EOF

read ans
exit
