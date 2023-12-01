* permette le wildcard per massimizzare l'area
* p.s.: per avere paree max bisogna che i rapport di spazio disponibile
* (lengx-shiftleft-shiftright)/nx*lengy=(lengy-shiftup-shiftdown)/ny*lengx
* ove lengx e lengy sono le dimensioni della finestra (11,8.5)
*
function main(args)
nx=subwrd(args,1)
ny=subwrd(args,2)
i=subwrd(args,3)
shiftup=subwrd(args,4)
shiftdown=subwrd(args,5)
shiftleft=subwrd(args,6)
shiftright=subwrd(args,7)
if(shiftup="");shiftup=0;endif
if(shiftdown="");shiftdown=0;endif
if(shiftleft="");shiftleft=0;endif
if(shiftright="");shiftright=0;endif
if(nx="help")
 say "HELP: setpage nx ny i shiftup shiftdown shiftleft shiftright"
 return
endif

*say ''nx' 'ny' 'i' 'shiftup' 'shiftdown' 'shiftleft' 'shiftright
dummy=setpage(nx,ny,i,shiftup,shiftdown,shiftleft,shiftright)
********** SETPAGE **********************************************************************
 function setpage(nx,ny,i,shiftup,shiftdown,shiftleft,shiftright)
* divide la pagina in nx e ny parti, riempie la numero i (da sinistra a destra
* e dall'alto in basso; orient: landscape o portrait (def.)
* gli shift segnano gli spazi bianchi sopra e sotto (default=0,0)

if(shiftup="shiftup");shiftup=0;endif
if(shiftdown="shiftdown");shiftdown=0;endif
if(shiftleft="shiftleft");shiftleft=0;endif
if(shiftright="shiftright");shiftright=0;endif
orient="landscape"

* individuo la cella
  ok=0
  nn=nx*ny
  if(i<1 | i>nn)
   say 'errore nella dividipage'
   return ok
  endif
  iy=0
  while (iy<ny & ok!=1)
   iy=iy+1
   ix=0
   iysum=(iy-1)*nx
   while (ix<nx & ok!=1)
    ix=ix+1
    if(ix+iysum=i);ok=1;endif
   endwhile
  endwhile

* capisco se sono portrait o landscape
 'set vpage off'
 'q gxinfo'
 linea=sublin(result,2)
 lengx=subwrd(linea,4)
 lengy=subwrd(linea,6)

* (lengx-shiftleft-shiftright)/nx*lengy=(lengy-shiftup-shiftdown)/ny*lengx

* shiftleft,shiftright
if(shiftleft='*' & shiftright='*' & shiftup!='*' & shiftdown!='*')
 shiftleft=0.5*(lengx+(shiftup+shiftdown-lengy)*lengx*nx/(lengy*ny))
 shiftright=shiftleft
endif

* shiftleft
if(shiftleft='*' & shiftright!='*' & shiftup!='*' & shiftdown!='*')
 shiftleft=(lengx+(shiftup+shiftdown-lengy)*lengx*nx/(lengy*ny))-shiftright
endif

* shiftright
if(shiftleft!='*' & shiftright='*' & shiftup!='*' & shiftdown!='*')
 shiftright=(lengx+(shiftup+shiftdown-lengy)*lengx*nx/(lengy*ny))-shiftleft
endif

* shiftleft, shiftright, shiftup
if(shiftleft='*' & shiftright='*' & shiftup='*' & shiftdown!='*')
 shiftup=0
 shiftleft=0.5*(lengx+(shiftup+shiftdown-lengy)*lengx*nx/(lengy*ny))
 shiftright=shiftleft
endif

* shiftleft, shiftright, shiftdown
if(shiftleft='*' & shiftright='*' & shiftup!='*' & shiftdown='*')
 shiftdown=0
 shiftleft=0.5*(lengx+(shiftup+shiftdown-lengy)*lengx*nx/(lengy*ny))
 shiftright=shiftleft
endif

* shiftleft, shiftright, shiftup, shiftdown
if(shiftleft='*' & shiftright='*' & shiftup='*' & shiftdown='*')
 if(lengx/nx<lengy/ny)
  shiftleft=0
  shiftright=0
  shiftup=0.5*(lengy+(shiftleft+shiftright-lengx)*lengy*ny/(lengx*nx))
  shiftdown=shiftup
 else
  shiftup=0
  shiftdown=0
  shiftleft=0.5*(lengx+(shiftup+shiftdown-lengy)*lengx*nx/(lengy*ny))
  shiftright=shiftleft
 endif
endif

* shiftup, shiftdown
if(shiftleft!='*' & shiftright!='*' & shiftup='*' & shiftdown='*')
 shiftup=0.5*(lengy+(shiftleft+shiftright-lengx)*lengy*ny/(lengx*nx))
 shiftdown=shiftup
endif

*say 'left:'shiftleft' right:'shiftright' down:'shiftdown' up:'shiftup
*say 'lengx:'lengx' lengy:'lengy

* setto la pagina
 lx=lengx-(shiftleft+shiftright)
 ly=lengy-(shiftup+shiftdown)
 dx=lx/nx
 dy=ly/ny

 x0=(ix-1)*dx+shiftleft;x1=x0+dx
 y0=(ny-iy)*dy+shiftdown;y1=y0+dy
 'set parea off'
'set vpage 'x0' 'x1' 'y0' 'y1
* say 'vpage: 'x0' 'x1' 'y0' 'y1
 rappx=(x1-x0)/lengx
 rappy=(y1-y0)/lengy
 lengxn=lengx
 lengyn=lengy
 if(rappx>rappy)
  lengxn=lengx
  lengyn=lengy*rappy/rappx
 endif
 if(rappx<rappy)
  lengyn=lengy
  lengxn=lengx*rappx/rappy
 endif

*say 'rapp 'rappx' 'rappy
*say 'old  'lengx' 'lengy
*say 'new  'lengxn' 'lengyn
*'d mslp'
*'q gxinfo'
*say ''sublin(result,2)

 return ok
