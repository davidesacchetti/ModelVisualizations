# Modifica del 2023.11.10 - Alessio - 1.4
# * introdotta la lettura del file zsfc per avere lo zero termico riferito al livello del mare.
#   adesso richiede in input due ctl, il primo (file 1) template degli ENS members, il secondo (file 2)
#   contentente la zsfc per 1 tempo 1 membro stessa area e risoluzione.
#
# Modifica del 2023.11.17 - Davide - 1.4.1
# * lo zero termico viene riferito al livello del mare sse come terzo parametro (_AddOroDeg0) viene passato 1
# * inseriti controlli sulla valorizzazione di fctl e foro
# * introdotto file di opzioni ensviewOpts.gsf
#
# Modifica del 2023.11.21 - Davide - 1.5.0
# * sostituiti i parametri a linea posizionali con quelli sotto forma di key=value
# * introdotta la funzione giveHelp()
#
# Modifica del 2023.11.30 - Davide - 1.5.1
# * eliminato baco: quando si vuole selezionare un punto e erroneamente si seleziona un area con un solo punto griglia non si riesce
#   piu' a fare unzoom: adesso se l'area rband selezionata ha un lato < 0.1" si intende che l'utente voleva selezionare un punto solo
# * corretta la dicitura dei gradi celsius °C
# * scorporate le linlen ecc: usa libString.gsf
#
#-----------------------------------------------------------------
#-- _IENS	widget appartenente al radiobox EENS (compreso tra _MENU.EENS.0 e .1), il membro associato e' _ENS=_MENU._IENS
#-- _IVAR	widget appartenente al radiobox VARS (compreso tra _MENU.VARS.0 e .1), il membro associato e' _VAR=_MENU._IVAR
#-- _ITIME	widget appartenente al radiobox TIME (compreso tra _MENU.TIME.0 e .1), il membro associato e' _IST=_MENU._ITIME
#-- _ICMD	widget appartenente al radiobox CMD (compreso tra _MENU.CMD.0 e .1), il membro associato e' _CMD=_MENU._ICMD
function main(args)
 rc = gsfallow("on")
 'reinit'
#-- libs
 libString()
#-- settings
 ensviewOpts()
#-- input parameters
 addO=0
 i=0;while(i<linlen(args));i=i+1
  word=subwrd(args,i)
  if(word='help');giveHelp();endif
  if(substr(word,1,5)="fctl=");nf=wrdlen(word)-5;fctl=substr(word,6,nf);endif
  if(substr(word,1,5)="foro=");nf=wrdlen(word)-5;foro=substr(word,6,nf);endif
  if(substr(word,1,5)="addO=");nf=wrdlen(word)-5;addO=substr(word,6,nf);endif
 endwhile
 if(fctl='fctl' | fctl='');giveHelp();endif
 if(foro='foro' | foro='');_AddOroDeg0=0;else;_AddOroDeg0=addO;endif
 init(fctl,foro)
 disfirst(fctl)
 drawButt()

* main loop
 while(1)
  say
  say 'mainLoop ivar:'_IVAR' ist:'_IST' ens:'_ENS
  drawButt()
  setButt()
  'q bpos'
  ret=parseres(result)
  ret=parse1(ret)
  if(!ret);break;endif
 endwhile
* 'quit'
return

#-----------------------------------------------------------------
function giveHelp()
 say 'uso: ensview fctl=fctl [foro=foro] [addO=addO]'
 say '  fctl -> il ctl dello ensemble'
 say '  foro -> il ctl del file contenente la orografia'
 say '  addO -> logical: aggiunge (1) o non (0) la orografia alla variabile dello zero termico'
 '!sleep 2'
return 'quit'

#-----------------------------------------------------------------
function init(fctl,foro)
 say 'init opens ctl ens:'fctl' oro:'foro
 _version='1.4.1'
 _datavers=20231117
 _XP1=1.5
 _XP2=10.0
 _SHIFT.UP=0.4
 _SHIFT.DOWN=0.4
 _SHIFT.LEFT=0
 _SHIFT.RIGHT=0
 'reset'
 'open 'fctl
 line=sublin(result,2)
 say 'init: 'line
 if(subwrd(line,2)='Error:')
  say '!!! File:'fctl' NOT Found !!!'
  '!sleep 2'
  'quit'
 endif 
 global()
 _x1=1;_x2=_NLON
 _y1=1;_y2=_NLAT
 _t1=2;_t2=_NTIME
 dummy=getNxNy(_NENS)
 _SHIFT.EENS.NX=subwrd(dummy,1)
 _SHIFT.EENS.NY=subwrd(dummy,2)
* _SHIFT.EENS.NX=math_int(math_sqrt(_NENS)+0.99)
* _SHIFT.EENS.NY=math_int(_NENS/_SHIFT.EENS.NX+0.99)
 _SHIFT.TIME.NX=math_int(math_sqrt(_t2-_t1+1)+0.99)
 _SHIFT.TIME.NY=math_int((_t2-_t1+1)/_SHIFT.TIME.NX+0.99)
#-- apro il file orografico
 if(foro!='foro' & foro!='')
  'open 'foro 
  line=sublin(result,2)
  say 'init: 'line
  if(subwrd(line,2)='Error:')
   say '!!! File:'foro' NOT Found !!!'
   '!sleep 2'
   'quit'
  endif 
 endif 
 'setta.gs'
 'set map 1 1 6'
 'set parea '_XP1' '_XP2' 1 7.5' 
 defButt()
return

#-----------------------------------------------------------------
#-- capisce dove clicco: fa le azioni conseguenti
#-- torna 0 (Quit), 1 (altrimenti)
function parse1(res)
 res=sublin(res,1)
 say 'ensview::parse1('res')'
 ret=1
 notFound=1

#-- parsifico res
#-- xpos' 'ypos' 'ibut' 'type' 'menu' 'imenu' 'res8' 'res9
#--  1      2      3      4      5      6       7      8
 xpos=subwrd(res,1)
 ypos=subwrd(res,2)
 ibut=subwrd(res,3)
 type=subwrd(res,4)
 menu=subwrd(res,5)
 imenu=subwrd(res,6)
 res8=subwrd(res,7)
 res9=subwrd(res,8)
 if(type='rband')
  xpos2=res8
  ypos2=res9
 endif
 if(type='dropmenu')
  cascMenu=res8
  cascItem=res9
 endif
 name=_MENU.imenu

#-- VARS button
 if(menu='VARS' & notFound)
  notFound=0
  setVar(imenu)
 endif

#-- GRAPH button
 if(menu='GRAPH' & notFound)
  notFound=0
  setGraph(imenu)
 endif

#-- COMMAND button
 if(menu='CMD' & notFound)
  notFound=0
  setCmd(imenu)
  if(name='Quit');ret=0;endif
 endif

#-- time button
 if(menu='TIME' & notFound)
  notFound=0
  if(valnum(name)=1)
   setTime(imenu)
  endif
 endif

#-- ens button
 if(menu='EENS' & notFound)
  notFound=0
  name=_MENU.imenu
  if(valnum(name)=1)
   setEns(imenu)
  endif
 endif

#-- ho cliccato nella plot area
 if(insideParea(xpos,ypos))

#-- rband zoom (se ho xpos2 e ypos2 diversi da xpos e ypos) altrimenti selpoint: la considero solo se ho cliccato col bottone 3, altrimenti come da none
  if(menu='rband' & notFound)
   notFound=0
   if(imenu=1 & ibut=3)
#-- ho xpos2 e ypos2 = xpos e ypos: plotEnvlp
#    if(xpos2=xpos & ypos2=ypos)
    if(math_abs(xpos2-xpos)<0.1 | math_abs(ypos2-ypos)<0.1)
     dummy=Cxy2w(xpos,ypos)
     _xlonSel=subwrd(dummy,1)
     _xlatSel=subwrd(dummy,2)
     'set line 2'
     'draw mark 1 'xpos' 'ypos' 0.1'
     '!sleep 0.5'
     plotEnvlp()
#-- ho xpos2 e ypos2 != xpos e ypos: setZoom
    else
     setZoom(xpos,ypos,xpos2,ypos2)
    endif
   else
#-- gestisco tempo e membri
    dummy=setIncr(ibut)
   endif
#-- sono dentro la parea ma non ci sono rband: sono in una Envelope
  else
#-- gestisco tempo e membri
   dummy=setIncr(ibut)
  endif
 endif

#-- ho cliccato sulla finestra senza avere schiacciato alcun oggetto
 if(menu='none' & notFound)
  notFound=0
#-- bottone 3: annullo lo zoom
  if(ibut=3)
   _x1=1;_x2=_NLON
   _y1=1;_y2=_NLAT
   'set x '_x1' '_x2
   'set y '_y1' '_y2
  endif
 endif

return(ret)

#-----------------------------------------------------------------
#-- capisce dove clicco
#-- torna 0 (Quit), 1 (altrimenti)
function parseres(res)
 res=sublin(res,1)
 say 'ensview::parseres('res')'
 ret=1

#-- parsifico res
#--  1       2  3    4    5    6     7       8      9
#-- Position = xpos ypos ibut class widget# xpos2 ypos2
 xpos=subwrd(res,3)
 ypos=subwrd(res,4)
 ibut=subwrd(res,5)
 class=subwrd(res,6)
 res8=subwrd(res,8)
 res9=subwrd(res,9)
 if(class=0)
  type='none'
 else
  imenu=subwrd(res,7)
  name=_MENU.imenu
 endif
 if(class=1)
  type='button'
  istatus=subwrd(res,8)
 endif
 if(class=2)
  type='rband'
  xpos2=subwrd(res,8)
  ypos2=subwrd(res,9)
 endif
 if(class=3)
  type='dropmenu'
  cascMenu=subwrd(res,8)
  cascItem=subwrd(res,9)
 endif

#-- ho cliccato su un bottone
 if(type='button')
#-- variable button
  if(imenu>=_MENU.VARS.0 & imenu<=_MENU.VARS.1)
   menu='VARS'
  endif
#-- graph button
  if(imenu>=_MENU.GRAPH.0 & imenu<=_MENU.GRAPH.1)
   menu='GRAPH'
  endif
#-- command button
  if(imenu>=_MENU.CMD.0 & imenu<=_MENU.CMD.1)
   menu='CMD'
  endif
#-- time button
  if(imenu>=_MENU.TIME.0 & imenu<=_MENU.TIME.1)
   menu='TIME'
  endif
#-- ens button
  if(imenu>=_MENU.EENS.0 & imenu<=_MENU.EENS.1)
   menu='EENS'
  endif
 endif

#-- ho cliccato sulla finestra senza avere schiacciato alcun oggetto
 if(type='none')
  menu=type
 endif

#-- ho cliccato su una rband
 if(type='rband')
  menu=type
 endif

#-- log
 say 'ensview::parseres INFO ho cliccato su: widget:'menu' imeni:'imenu' name:'name' ibut:'ibut

#-- return
 ret=xpos' 'ypos' 'ibut' 'type' 'menu' 'imenu' 'res8' 'res9
return(ret)

#-----------------------------------------------------------------
#-- impartisco i comandi di sposta il tempo o il membro a seconda di cosa pigio nel mouse
function setIncr(ibut)
 say 'ensview::setIncr('ibut')'
#-- vado indietro nel tempo se ho schiacciato mouse button sx nella plot area
 if(ibut=1)
  setTime('-1')
 endif
#-- vado avanti nel tempo se ho schiacciato mouse button dx nella plot area
 if(ibut=2)
  setTime('+1')
 endif
#-- vado indietro nei membri se ho schiacciato mouse scroll down nella plot area
 if(ibut=4)
  setEns('-1')
 endif
#-- vado avanti nei membri se ho schiacciato mouse scroll up nella plot area
 if(ibut=5)
  setEns('+1')
 endif
 if(_ITIME<_MENU.TIME.0);_ITIME=_MENU.TIME.0;endif
 if(_ITIME>_MENU.TIME.1);_ITIME=_MENU.TIME.1;endif
 if(_IENS<_MENU.EENS.0);_IENS=_MENU.EENS.0;endif
 if(_IENS>_MENU.EENS.1);_IENS=_MENU.EENS.1;endif
 _IST=_MENU._ITIME
 _ENS=_MENU._IENS
 say 'ensview::setIncr _ITIME:'_ITIME' _MENU._ITIME:'_MENU._ITIME' _IENS:'_IENS' _MENU._IENS:'_MENU._IENS
return

#-----------------------------------------------------------------
#-- gestisce il plot generico
function Plot
 say '>>> ensview::Plot _CMD:'_CMD' _GRAPH:'_GRAPH
 setIncr()
 'set z 1'

#-- ambiente: caso plot singolo
 if(_CMD='OnePlot')
  'set x '_x1' '_x2
  'set y '_y1' '_y2
  'set t '_IST
  if(_GRAPH='Single' | _GRAPH='Anom')
   if(_GRAPH='Single')
    'set e '_ENS
   else
    'set e 1 '_NENS
   endif
   enstit=_ENS
  else
   'set e 1 '_NENS
   enstit='1-'_NENS
  endif
  'define varDum='_MENU._IVAR.FLD
  'clear'
  'set e '_ENS
  _LAST='Map'
  plotMaps(enstit)
  drawRband()
 endif

#-- ambiente: caso plot AllMem
 if(_CMD='AllMem' & (_GRAPH='Single' | _GRAPH='Anom'))
  'set x '_x1' '_x2
  'set y '_y1' '_y2
  'set t '_IST
  'set e 1 '_NENS
  'define varDum='_MENU._IVAR.FLD
  'clear'
  _LAST='MultiMap'
  ens=0;while(ens<_NENS);ens=ens+1
   'setpage '_SHIFT.EENS.NX' '_SHIFT.EENS.NY' 'ens' '_SHIFT.UP' '_SHIFT.DOWN' '_SHIFT.LEFT' '_SHIFT.RIGHT
   'set e 'ens
   plotMaps(ens)
  endwhile
  'set vpage off'
 endif

#-- ambiente: caso plot AllTime
 if(_CMD='AllTime')
  'set x '_x1' '_x2
  'set y '_y1' '_y2
  'set t 1 '_NTIME
  _LAST='MultiMap'
  if(_GRAPH='Single' | _GRAPH='Anom')
   'set e '_ENS
   ens=_ENS
  else
   'set e 1 '_NENS
   ens='1-'_NENS
  endif
  'define varDum='_MENU._IVAR.FLD
  'clear'
  'set e '_ENS
  iel=0;while(iel<(_t2-_t1+1));iel=iel+1
   'setpage '_SHIFT.TIME.NX' '_SHIFT.TIME.NY' 'iel' '_SHIFT.UP' '_SHIFT.DOWN' '_SHIFT.LEFT' '_SHIFT.RIGHT
   ist=iel+_t1-1
*   'set t '_IST
   'set t 'ist
   plotMaps(ens)
  endwhile
  'set vpage off'
 endif

#-- ambiente: Help
 if(_CMD='Help')
*  '!roxterm -e ./grads/giveHelp.sh ensview'
*  '!xterm -e ./grads/giveHelp.sh ensview'
  '!./giveHelp.sh ensview'
 endif

return

#-----------------------------------------------------------------
#-- tratta la sequenza dei bottoni da imStart a imEnd come un radiobox: attiva solo imenu
function radioBox(imStart,imEnd,imenu,label)
 say 'ensview::radioBox(start='imStart',end='imEnd',imenu='imenu',label='label')'
 found=0
 im=imStart-1;while(im<imEnd);im=im+1
  if(im!=imenu)
   status=0
  else
   status=1
   found=1
  endif
  'redraw button 'im' 'status
 endwhile
 if(!found);say '!!! radioBox('imStart','imEnd','imenu') - NOT INSIDE found='found' !!!';endif
return

#-----------------------------------------------------------------
function setButt
 say 'ensview::setButt'
 setVar()
 setGraph()
 setTime()
 setEns()
 setCmd()
return

#-----------------------------------------------------------------
function setVar(imenu)
 say 'ensview::setVar('imenu') _IVAR:'_IVAR
 draw=1
#-- se _IVAR non e' definito prendo il primo elemento del menu VARS
 if(_IVAR='_IVAR');_IVAR=_MENU.VARS.0;endif
 if(imenu='imenu')
  imenu=_IVAR
  draw=0
  say 'disegno solo i bottoni'
 endif
#-- menu VARS a radiobox
 radioBox(_MENU.VARS.0,_MENU.VARS.1,imenu,'VARS')
#-- definisco la variabile da plottare
 _IVAR=imenu
 _VAR=_MENU.imenu.FLD
 if(draw)
  if(_LAST='Envelope')
   plotEnvlp(1)
  else
   Plot()
  endif
 endif
return

#-----------------------------------------------------------------
function setGraph(imenu)
 say 'ensview::setGraph('imenu') _IGRAPH:'_IGRAPH
 draw=1
#-- se _IGRAPH non e' definito prendo il primo elemento del menu GRAPH
 if(_IGRAPH='_IGRAPH');_IGRAPH=_MENU.GRAPH.0;endif
 if(imenu='imenu')
  imenu=_IGRAPH
  draw=0
  say 'disegno solo i bottoni'
 endif
#-- menu GRAPH a radiobox
 radioBox(_MENU.GRAPH.0,_MENU.GRAPH.1,imenu,'GRAPH')
#-- definisco la variabile da plottare
 _IGRAPH=imenu
 _GRAPH=_MENU.imenu
 if(draw)
  Plot()
 endif
return

#-----------------------------------------------------------------
function setTime(imenu)
 say 'ensview::setTime('imenu') _ITIME:'_ITIME
#-- se _ITIME non e' definito prendo il primo elemento del menu TIME
 draw=1
 if(_ITIME='_ITIME');_ITIME=_MENU.TIME.0;endif
 if(imenu='imenu')
  imenu=_ITIME
  draw=0
  say 'disegno solo i bottoni'
 endif
 if(imenu='+1')
  imenu=_ITIME+1
 endif
 if(imenu='-1')
  imenu=_ITIME-1
 endif
#-- menu TIME a radiobox
 radioBox(_MENU.TIME.0,_MENU.TIME.1,imenu,'TIME')
#-- definisco il tempo da plottare
 _ITIME=imenu
 _TIME=_MENU.imenu
 if(draw)
  Plot()
 endif
return

#-----------------------------------------------------------------
function setEns(imenu)
 say 'ensview::setEns('imenu') _IENS:'_IENS
#-- se _IENS non e' definito prendo il primo elemento del menu EENS
 draw=1
 if(_IENS='_IENS');_IENS=_MENU.EENS.0;endif
 if(imenu='imenu')
  imenu=_IENS
  draw=0
  say 'disegno solo i bottoni'
 endif
 if(imenu='+1')
  if(_IENS!=_MENU.EENS.1);imenu=_IENS+1;else;imenu=_IENS;endif
 endif
 if(imenu='-1')
  if(_IENS!=_MENU.EENS.0);imenu=_IENS-1;else;imenu=_IENS;endif
 endif
#-- menu EENS a radiobox
 radioBox(_MENU.EENS.0,_MENU.EENS.1,imenu,'EENS')
#-- definisco il membro da plottare
 _IENS=imenu
 _ENS=_MENU.imenu
 if(draw)
  if(_LAST='Envelope')
   plotEnvlp(0)
  else
   Plot()
  endif
 endif
return

#-----------------------------------------------------------------
function setCmd(imenu)
 say 'ensview::setCmd('imenu') _ICMD:'_ICMD
#-- se _ICMD non e' definito prendo il primo elemento del menu CMD
 draw=1
 if(_ICMD='_ICMD');_ICMD=_MENU.CMD.0;endif
 if(imenu='imenu')
  imenu=_ICMD
  draw=0
  say 'disegno solo i bottoni'
 endif
#-- se clicco Quit non plotto
 if(_MENU.imenu='Quit')
  draw=0
 endif
#-- menu CMD a radiobox
 radioBox(_MENU.CMD.0,_MENU.CMD.1,imenu,'CMD')
#-- definisco il tempo da plottare
 _ICMD=imenu
 _CMD=_MENU.imenu
 if(draw)
  Plot()
 endif
return

#-----------------------------------------------------------------
#-- definisce tutti i widget, chiamata solo all'inizio
function defButt
 say 'ensview::defButt'
#-- Draw upper buttons
* x0=0.4;width=0.46;sep=0.04
* x0=0.4;width=0.44;sep=0.04
 x0=0.2;width=0.41;sep=0.02
 y0=8.35;dy=0.3
 im=0;xm=x0-width-sep
#--  variable buttons
 implus=im+1
 _MENU.VARS.0=implus
 _MENU.implus.SET='set button 1 0 12 8  1 12 12 8  6'

#-- check on _VAR
 mslp_ok=0
 t2_ok=0
 t850_ok=0
 deg0l_ok=0
 td2_ok=0
 tp_ok=0
 tp1_ok=0
 fg10_ok=0
 u10_ok=0
 v10_ok=0
 z500_ok=0
 iv=0;while(iv<_NVAR);iv=iv+1
  say _'<'_VAR.iv'>'
  if(_VAR.iv='mslp');mslp_ok=1;endif
  if(_VAR.iv='t2');t2_ok=1;endif
  if(_VAR.iv='t');t850_ok=1;endif
  if(_VAR.iv='deg0l');deg0l_ok=1;endif
  if(_VAR.iv='td2');td2_ok=1;endif
  if(_VAR.iv='tp');tp_ok=1;endif
  if(_VAR.iv='tp1');tp1_ok=1;endif
  if(_VAR.iv='fg10');fg10_ok=1;endif
  if(_VAR.iv='u10');u10_ok=1;endif
  if(_VAR.iv='v10');v10_ok=1;endif
  if(_VAR.iv='gh');z500_ok=1;endif
 endwhile
 if(u10_ok & v10_ok);wind_ok=1;else;wind_ok=0;endif
 if(tp1_ok);fact=getFactor('tp1');endif
 if(tp_ok);fact=getFactor('tp');endif

say '>>> 'tp_ok' '_DTIMEHR

#-- MSLP
 if(mslp_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='MSLP'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=1
   _MENU.im.NAM='Mean Sea Level Pressure'
   _MENU.im.FLD='(mslp/100)'
 endif
#-- T2
 if(t2_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='T2'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=1
   _MENU.im.NAM='Temperature [C]'
   _MENU.im.FLD='(t2-273.16)'
 endif
#-- T850
 if(t850_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='T850'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=1
   _MENU.im.NAM='850 hPa Temperature [C]'
   _MENU.im.FLD='(t(lev=850)-273.16)'
 endif
#-- DEG0L
 if(deg0l_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='DEG0'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=1
   _MENU.im.NAM='0`a0`nC Temperature Level a.s.l. [m]'
   if(_AddOroDeg0)
    _MENU.im.FLD='zsfc.2(t=1,e=1)/9.81+deg0l'
*    _MENU.im.FLD='deg0l+zsfc.2(t=1,e=1)/9.81'
   else
    _MENU.im.FLD='deg0l'
   endif
 endif
#-- Z500
 if(z500_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='Z500'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=1
   _MENU.im.NAM='500 hPa Geop. Height [m]'
   _MENU.im.FLD='gh(lev=500)'
 endif
#-- R2
 if(td2_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='R2'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=1
   _MENU.im.NAM='Relative Humidity at 2m [%]'
   _MENU.im.FLD='(100*exp((17.2693882*(td2-273.15))/(td2-273.15+237.3)-(17.2693882*(t2-273.15))/(t2-273.15+237.3)))'
 endif
#-- WIND
 if(wind_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='WIND'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=2
   _MENU.im.NAM='Wind [m/s]'
   _MENU.im.FLD='(mag(u10,v10))'
 endif
#-- GUST
 if(fg10_ok)
  im=im+1;xm=xm+width+sep
   _MENU.im='GUST'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
   _MENU.im.IST=2
   _MENU.im.NAM='Wind Gust [m/s]'
   _MENU.im.FLD='(fg10)'
 endif
#-- TP cumulata
 if(tp1_ok)
#-- TP1
  if(_DTIMEHR=1)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP1'
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=1
    _MENU.im.NAM='1HR Precipitation [mm/hr]'
    _MENU.im.FLD='tp1'fact
  endif
#-- TP3
  tim=3
  if(_DTIMEHR<=tim)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP'tim
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=tim
    _MENU.im.NAM=tim'HR Precipitation [mm/'tim'hr]'
    t_tmp=tim/_DTIMEHR-1;_MENU.im.FLD='(sum(tp1,t-'t_tmp',t+0))'fact
  endif
#-- TP6
  tim=6
  if(_DTIMEHR<=tim)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP'tim
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=tim
    _MENU.im.NAM=tim'HR Precipitation [mm/'tim'hr]'
    t_tmp=tim/_DTIMEHR-1;_MENU.im.FLD='(sum(tp1,t-'t_tmp',t+0))'fact
  endif
#-- TP12
  tim=12
  if(_DTIMEHR<=tim)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP'tim
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=tim
    _MENU.im.NAM=tim'HR Precipitation [mm/'tim'hr]'
    t_tmp=tim/_DTIMEHR-1;_MENU.im.FLD='(sum(tp1,t-'t_tmp',t+0))'fact
  endif
#-- TP24
  tim=24
  if(_DTIMEHR<=tim)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP'tim
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=tim
    _MENU.im.NAM=tim'HR Precipitation [mm/'tim'hr]'
    t_tmp=tim/_DTIMEHR-1;_MENU.im.FLD='(sum(tp1,t-'t_tmp',t+0))'fact
  endif
 endif
#-- TP integrata
 if(tp_ok)
#-- TP6
  if(_DTIMEHR<=6)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP6'
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=2
    _MENU.im.NAM='6HR Precipitation [mm/6hr]'
    t_tmp=6/_DTIMEHR;_MENU.im.FLD='(tp-const(tp(t-'t_tmp'),0,-u))'fact
  endif
#-- TP12
  if(_DTIMEHR<=12)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP12'
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=3
    _MENU.im.NAM='12HR Precipitation [mm/12hr]'
    t_tmp=12/_DTIMEHR;_MENU.im.FLD='(tp-const(tp(t-'t_tmp'),0,-u))'fact
  endif
#-- TP24
  if(_DTIMEHR<=24)
   im=im+1;xm=xm+width+sep
    _MENU.im='TP24'
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=5
    _MENU.im.NAM='24HR Precipitation [mm/24hr]'
    t_tmp=24/_DTIMEHR;_MENU.im.INT=10;_MENU.im.FLD='(tp-const(tp(t-'t_tmp'),0,-u))'fact
  endif
#-- TP24>10mm
  if(_DTIMEHR<=24)
   im=im+1;xm=xm+width+sep
    _MENU.im='TTP10'
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
    _MENU.im.IST=5
    thr=10
    if(fact!='');thrfact=thr'/(1'fact')';endif
    _MENU.im.NAM='24HR Precipitation > 10 mm PROBABILITY [%]'
    t_tmp=24/_DTIMEHR;_MENU.im.INT=10;_MENU.im.FLD='sum(const(maskout(const(lon,1),tp-const(tp(t-'t_tmp'),0,-u)-'thrfact'),0,-u),e=1,e='_NENS')*100/'_NENS
  endif
 endif
 _MENU.VARS.1=im

#--  graph buttons
 implus=im+1
* per proseguire sulla stessa linea
 xm=xm+2*sep
* per tornare a capo
*y0=y0-dy-sep
*xm=x0-width-sep
 _MENU.GRAPH.0=implus
 _MENU.implus.SET='set button 1 0 7 10  1 10 7 10  6'
  im=im+1;xm=xm+width+sep
   _MENU.im='Single'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Anom'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Max'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Min'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Mean'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Spread'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  if(checkUdx('percentile'))
   im=im+1;xm=xm+width+sep
    _MENU.im='Perc80'
    _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  endif
  im=im+1;xm=xm+width+sep
   _MENU.im='Sigma'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
 _MENU.GRAPH.1=im

#--  command buttons
 xm=xm+2*sep
 implus=im+1
 _MENU.CMD.0=implus
 _MENU.implus.SET='set button 1 0 13 11  1 11 13 11  6'
  im=im+1;xm=xm+width+sep
   _MENU.im='OnePlot'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='AllMem'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='AllTime'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Help'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
  im=im+1;xm=xm+width+sep
   _MENU.im='Quit'
   _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
 _MENU.CMD.1=im

#-- Draw botton buttons (time)
 x0=_XP1;x1=_XP2;width=(x1-x0)/(_NTIME-1)
 y0=0.2;dy=0.3
 implus=im+1
 _MENU.TIME.0=implus
 _MENU.implus.SET='set button 1 0 8 7  1 7 7 8  1'
* 'draw string '%(x0-width*0.6)%' 'y0' T'
 i=0;while(i<_NTIME);i=i+1
  im=im+1;xm=x0+(i-1)*width
  _MENU.im=i
  _MENU.im.DRAW='draw button 'im' 'xm' 'y0' 'width' 'dy' '_MENU.im
 endwhile
 _MENU.TIME.1=im

#-- Draw left buttons (ens)
 widx=0.30
 x0=0.15
 y0=7.6;y1=0.8;width=(y0-y1)/(_NENS-1)
 implus=im+1
 _MENU.EENS.0=implus
 _MENU.implus.SET='set button 1 0 8 7  1 7 7 8  1'
* 'draw string '%(x0+0.06)%' '%(y0+width*0.7)%' `3e`0'
 i=0;while(i<_NENS);i=i+1
  im=im+1;ym=y0-(i-1)*width
  _MENU.im=i
  _MENU.im.DRAW='draw button 'im' 'x0' 'ym' 'widx' 'width' '_MENU.im
 endwhile
 _MENU.EENS.1=im

#-- quanti windget ho?
 _MENU.0=im

#-- return
return

#-----------------------------------------------------------------
#-- disegna tutti i widget
function drawButt
 say 'ensview::drawButt'
 im=0;while(im<_MENU.0);im=im+1
  if(_MENU.im.SET!='_MENU.'im'.SET');_MENU.im.SET;endif
  _MENU.im.DRAW
 endwhile
return

#-----------------------------------------------------------------
* FUNCTION PLOTROSE per plottare la rosa dei venti
function plotrose(ist)
 say 'ensview::plotrose('ist')'
 'set grid off'
 'set lon '_xlonSel
 'set lat '_xlatSel
 'set z 1'
 'set t 'ist
 'set e 1 '_NENS
 'clear events'
 'run ./grads/drawrose1 -e u10 v10  0.5 20  5 22  11 35  17 96  24 44'
 dummy=getgx()
 xsiz=subwrd(dummy,1)
 ysiz=subwrd(dummy,2)
 x1=subwrd(dummy,3)
 x2=subwrd(dummy,4)
 y1=subwrd(dummy,5)
 y2=subwrd(dummy,6)
 xtyp=subwrd(dummy,7)
 ytyp=subwrd(dummy,8)
 'set string 1 bl'
 'set strsiz 0.13'
 'q time'
* 'draw string 0.2 '%(y2+0.15)%' 'subwrd(result,6)' 'subwrd(result,3)
 dateC=subwrd(result,3)
 'draw string 0.2 '%(y2+0.15)%' 'zellerday(dateC)' 'dateC
 'draw string 0.2 '%(y2+0.40)%' '_MENU._IVAR.NAM
 'draw string 0.2 '%(y2-0.10)%' (tau: '%(ist-1)*_DTIMEHR%')'
return

#-----------------------------------------------------------------
* FUNCTION PLOTHISTO per plottare l'istogramma di tutti gli eps ad un tempo (e un xsel) prefissato
function plothisto(ist)
 say 'ensview::plothisto('ist')'
 'set grid horizontal'
 'set lon '_xlonSel
 'set lat '_xlatSel
 'set z 1'
 'set t 'ist
 'set e 1 '_NENS
 'run ./grads/histo '_MENU._IVAR.FLD
 dummy=getgx()
 xsiz=subwrd(dummy,1)
 ysiz=subwrd(dummy,2)
 x1=subwrd(dummy,3)
 x2=subwrd(dummy,4)
 y1=subwrd(dummy,5)
 y2=subwrd(dummy,6)
 xtyp=subwrd(dummy,7)
 ytyp=subwrd(dummy,8)
 'set string 1 bl'
 'set strsiz 0.13'
 'q time'
* 'draw string 0.2 '%(y2+0.15)%' 'subwrd(result,6)' 'subwrd(result,3)
 dateC=subwrd(result,3)
 'draw string 0.2 '%(y2+0.15)%' 'zellerday(dateC)' 'dateC
 'draw string 0.2 '%(y2+0.40)%' '_MENU._IVAR.NAM
 'draw string 0.2 '%(y2-0.10)%' (tau: '%(ist-1)*_DTIMEHR%')'
return

#-----------------------------------------------------------------
#-- prende l'istante fissato e torna la data nel formato wday' 'hour'Z'day''month''yr (toglie le prime du cifre dell'anno)
function getDate(ist)
 'q time'
 dateC=subwrd(result,3)
* wday=subwrd(result,6)
 wday=zellerday(dateC)
 dummy=wrdsep(dateC,'Z')
 hour=subwrd(dummy,1)
 date=subwrd(dummy,2)
 day=substr(date,1,2)
 month=substr(date,3,3)
 year=substr(date,6,4)
 yr=substr(date,8,2)
 ret=wday' 'hour'Z'day''month''yr
 if(ist!='ist')
  ret=ret' `3t`0:'%(ist-1)*_DTIMEHR
 endif
return ret

#-----------------------------------------------------------------
* PLOTMAPS per plottare le mappe ad un tempo prefissato
function plotMaps(enstit)
 say 'ensview::plotMaps('enstit') _MENU._IVAR:'_MENU._IVAR' _GRAPH:'_GRAPH

 name=_MENU._IVAR
 tit=_MENU._IVAR.NAM
 PALETTE=1
 if(_GRAPH='Min');_ACT3='Envelp';field='min(varDum,e=1,e='_NENS')';endif
 if(_GRAPH='Max');_ACT3='Envelp';field='max(varDum,e=1,e='_NENS')';endif
 if(_GRAPH='Mean');_ACT3='Envelp';field='mean(varDum,e=1,e='_NENS')';endif
 if(_GRAPH='Spread');_ACT3='Envelp';field='max(varDum,e=1,e='_NENS')-min(varDum,e=1,e='_NENS')';PALETTE=0;endif
 if(_GRAPH='Sigma');_ACT3='Envelp';field='sqrt((mean(varDum*varDum,e=1,e='_NENS')-mean(varDum,e=1,e='_NENS')*mean(varDum,e=1,e='_NENS'))*'_NENS'/('_NENS'-1))';PALETTE=0;endif
 if(_GRAPH='Perc80');_ACT3='Envelp';field='percentile(varDum,e=1,e='_NENS',80)';endif
 if(_GRAPH='All');_ACT3='Select';field='varDum';SETPAGE=1;endif
 if(_GRAPH='Single');_ACT3='Envelp';field='varDum';endif
 if(_GRAPH='Anom');_ACT3='Envelp';field='varDum-mean(varDum,e=1,e='_NENS')';PALETTE=0;endif

#-- trovo il tempo a cui sono
 date=getDate(_IST)
 title=''_GRAPH'('_MENU._IVAR') 'date' `3e`0:'enstit

#-- palette
 if(PALETTE)
  setPal(name)
 else
  'set ccolor rainbow'
  'set black -1 1'
 endif
 'set gxout shaded'
 if(PALETTE & _CLEVS!='' & _CCOLS!='')
  'set clevs '_CLEVS
  'set ccols '_CCOLS
 endif
 say 'ensview::plotMaps plotting '_MENU._IVAR.FLD
 'd 'field
 'cbarn 1 1'
 if(_GRAPH='Single')
  if(name='GUST' | name='WIND')
   'set gxout stream'
   'd u10;v10'
  endif
  'draw title 'title
 else
  if(name='GUST' | name='WIND')
   'set gxout stream'
   'd mean(u10,e=1,e='_NENS');mean(v10,e=1,e='_NENS')'
  endif
  'draw title 'title
 endif

return

#-----------------------------------------------------------------
function setPal(name)
 say 'ensview::setPal('name')'
 if(name='name' | name='');name=_MENU._IVAR;endif
 subnam=substr(name,1,2)
#-- _VRANGE: min max spread (null means missing)
 _CLEVS=''
 _CCOLS=''
 _VRANGE=''
 if(name='TP1')
  _CLEVS='   1   2   5  15  20  25  30  35  40  45  50  55  60  65  70  75  80  85  90 100'
  _VRANGE='0 100 null'
 endif
 if(name='TP3')
  _CLEVS='   1   5  10  20  30  40  50  60  70  80  90 100 110 120 130 140 150 160 180 200'
  _VRANGE='0 150 null'
 endif
 if(name='TP6')
  _CLEVS='   1   5  10  20  30  40  50  60  70  80 100 120 140 160 180 200 220 240 270 300'
  _VRANGE='0 150 null'
 endif
 if(name='TP12')
  _CLEVS='   1   5  10  20  30  40  60  80 100 120 140 160 180 200 225 250 275 300 325 350'
  _VRANGE='0 200 null'
 endif
 if(name='TP24')
  _CLEVS='   1   5  10  20  40  60  80 100 125 150 175 200 225 250 275 300 325 350 375 400'
  _VRANGE='0 300 null'
 endif
 if(name='TTP10')
  _CLEVS=' 10  30 50 70 80 90 95'
  _VRANGE='0 100 null'
  _CCOLS='0  21 22  28 30 31 33 35'
  pal='andrea'
 endif
 if(subnam='TP')
  _CCOLS='20  21  22  23  24  25  26  27  29  30  31  32  34  35  36  37  38  39  40  41  42'
  pal='andrea'
 endif
 if(name='R2')
  _CCOLS='33  32  31  30  29  28  27  26  25  24  23  22  21'
  _CLEVS='  20  30  40  50  60  70  75  80  85  90  95  98'
  _VRANGE='20 110 null'
  pal='andrea'
 endif
 if(name='T2' | name='T850')
  _CCOLS='41  42 43  44  45  46  47  48  49  50  51  52  53  54  55  56  57  58  59  60  61  62  63  64  65  66  67  68  69  70  71  72'
  _CLEVS=' -20 -18 -16 -14 -12 -10  -8  -6  -4  -2   0   2   4   6   8  10  12  14  16  18  20  22  24  26  28  30  32  34  36  38  40'
  _VRANGE='null null 20'
  pal='standard'
 endif
 if(name='GUST' | name='WIND')
  _CLEVS='  0.5 1.5 3   5  8.3  11  14  17  20  24  28';#m/s: vento mks
  _CCOLS='20  27  24  22  32  35  38  96  42  44  77  78'
  _VRANGE='0 30 null'
  pal='wspd'
 endif
 if(name='MSLP')
  _CCOLS='21   22   23   24   25   26   27   28   29   30   31   32   33   34   35   36   37   38   39   40   41   42   43   44   45   46   47   48   49   50   51   52   53   54   55'
  _CLEVS='  982  984  986  988  990  992  994  996  998 1000 1002 1004 1006 1008 1010 1012 1014 1016 1018 1020 1022 1024 1026 1028 1030 1032 1034 1036 1038 1040 1042 1044 1046 1048'
  _VRANGE='null null 20'
  pal='mslp'
 endif
 if(name='DEG0')
  _CCOLS='0 41  42  43  44  45   46   47   48   49   50   51   52   53   54   55   56   57   58   59   60   61   62   63   64   65   66'
  _CLEVS=' 0 200 400 600 800 1000 1200 1400 1600 1800 2000 2200 2400 2600 2800 3000 3200 3400 3600 3800 4000 4200 4400 4600 4800 5000'
  _VRANGE='null null 20'
  pal='standard'
 endif
 if(name='Z500')
  _CCOLS='41   42   43   44   45   46   47   48   49   50   51   52   53   54   55   56   57   58   59   60   61   62   63   64   65   66   67   68   69   70'
  _CLEVS=' 4800 4850 4900 4950 5000 5050 5100 5150 5200 5250 5300 5350 5400 5450 5500 5550 5600 5650 5700 5750 5800 5850 5900 5950 6000 6050 6100 6150 6200'
  _VRANGE='null null 20'
  pal='standard'
 endif
 colors(pal)
return

#-----------------------------------------------------------------
* PLOTENVLP per plottare la envelope del trend della variabile
function plotEnvlp(redefine)
 say 'ensview::plotEnvlp('redefine')'
 if(redefine='redefine');redefine=1;endif
#-- RANGE: definisce come settare la scala dell'asse Y
* RANGE='auto'
* RANGE='clevs'
* RANGE='clevs/auto'
 RANGE='vrange/auto'
#-- colSel: colore del membro selezionato
 'set grid horizontal'
 'set lon '_xlonSel
 'set lat '_xlatSel
* 'set t '_t1' '_t2
* 'set t 1 '_NTIME
 'set t 0.5 '%(_NTIME+0.5)
 'set e 1 '_NENS
 if(redefine)
  'define varDum='_MENU._IVAR.FLD
 endif
#-- RANGE='auto' -> asse Y autoscale
 if(RANGE='auto')
  dummy=minmax('varDum')
  min=subwrd(dummy,1);max=subwrd(dummy,2);cmin=subwrd(dummy,3);cmax=subwrd(dummy,4);cint=subwrd(dummy,5)
  if(_MENU._IVAR='WIND')
   cmax=cmax+cint 
  endif
 endif
#-- RANGE='clevs' -> prende il primo e ultimo valore di _CLEVS come min e max asse Y
 if(RANGE='clevs')
  setPal()
  nword=linlen(_CLEVS)
  cmin=subwrd(_CLEVS,1)
  cmax=subwrd(_CLEVS,nword)
 endif
#-- RANGE='clevs/auto' -> misto: come clevs ma se sfora gestisce lo sforamento ma colora di rosso le label asse Y
 if(RANGE='clevs/auto')
  dummy=minmax('varDum')
  min=subwrd(dummy,1);max=subwrd(dummy,2);cminA=subwrd(dummy,3);cmaxA=subwrd(dummy,4);cint=subwrd(dummy,5)
  say 'RANGE:'RANGE' cminA:'cminA' cmaxA:'cmaxA
  if(_MENU._IVAR='WIND')
   cmaxA=cmaxA+cint 
  endif
  setPal()
  nword=linlen(_CLEVS)
  cminC=subwrd(_CLEVS,1)
  cmaxC=subwrd(_CLEVS,nword)
  say 'RANGE:'RANGE' cminC:'cminC' cmaxC:'cmaxC
  if(cminA<cminC);cmin=cminA;'set ylopts 2';else;cmin=cminC;endif
  if(cmaxA>cmaxC);cmax=cmaxA;'set ylopts 2';else;cmax=cmaxC;endif
 endif
#-- RANGE='vrange/auto' -> misto: come vrange ma se sfora gestisce lo sforamento ma colora di rosso le label asse Y
 if(RANGE='vrange/auto')
  dummy=minmax('varDum')
say '>>> dummy = 'dummy
  min=subwrd(dummy,1);max=subwrd(dummy,2);cminA=subwrd(dummy,3);cmaxA=subwrd(dummy,4);cint=subwrd(dummy,5);meanA=(cmaxA+cminA)/2
  say 'RANGE:'RANGE' cminA:'cminA' cmaxA:'cmaxA
  if(_MENU._IVAR='WIND')
   cmaxA=cmaxA+cint 
  endif
  setPal()
  cminC=subwrd(_VRANGE,1)
  cmaxC=subwrd(_VRANGE,2)
  spreadC=subwrd(_VRANGE,3)
  if(cminC='null');cminC=meanA-spreadC/2;endif
  if(cmaxC='null');cmaxC=meanA+spreadC/2;endif
  say 'RANGE:'RANGE' cminC:'cminC' cmaxC:'cmaxC
  if(cminA<cminC);cmin=cminA;else;cmin=cminC;endif
  if(cmaxA>cmaxC);cmax=cmaxA;'set ylopts 2';else;cmax=cmaxC;endif
 endif
 say 'RANGE:'RANGE' cmin:'cmin' cmax:'cmax
 'clear'
 'set vrange 'cmin' 'cmax
#-- start plotting
 xleg1=0.4;xleg2=0.55;dxleg=0.05
 yleg=7.5;dyleg=0.2
 fact=1
 'set strsiz 0.10'
 'set string 1 l'
 'set e '_ENS
 'define mm=mean(varDum,e=1,e='_NENS')'
 'define ss=sqrt( sum( (varDum-mm)*(varDum-mm),e=1,e='_NENS' )/'_NENS-1' )'
#-- statistics: perc25 e perc75
 col=19;yleg=yleg-dyleg
 'set lfcols 'col' 'col
 'set gxout linefill'
 'd percentile(varDum,e=1,e='_NENS',25);percentile(varDum,e=1,e='_NENS',75)'
 'set line 'col
 'draw recf 'xleg1' '%(yleg-0.04)%' 0.5 '%(yleg+0.04)
 'draw string '%(xleg2+dxleg)%' 'yleg' 25-75%'
#-- all members
 col=15
 'set gxout line'
 ens=0;while(ens<_NENS);ens=ens+1
  if(ens=_ENS);continue;endif
  'set e 'ens
  'set ccolor 'col
  'set cmark 0'
  'set cthick 1'
*  'set cstyle 1'
*  'set cstyle 3'
  'set cstyle '_OPT.MemLinStyl
  'd varDum'
 endwhile
 'set cstyle 1'
*#-- selected member on the top
* col=4;yleg=yleg-dyleg
* 'set gxout line'
* 'set ccolor 'col
* 'set cmark 5'
* 'set cthick 6'
* 'set cstyle 3'
* 'd varDum(e='_ENS')'
* 'set cstyle 1'
* 'set line 'col
* 'draw line 'xleg1' 'yleg' 0.5 'yleg
* 'draw string '%(xleg2+dxleg)%' 'yleg' `3e`0:'_ENS
#-- statistics: err bars
 col=12;yleg=yleg-dyleg
 'set ccolor 'col
 'set cthick 6'
 'set gxout errbar'
 'd mm-'fact'*ss;mm+'fact'*ss'
 'set cthick 1'
 'set line 'col
 'draw line 'xleg1' 'yleg' 0.5 'yleg
 'draw string '%(xleg2+dxleg)%' 'yleg' `3s`0'
#-- statistics: mean
 col=2;yleg=yleg-dyleg
 'set ccolor 'col
 'set cthick 6'
 'set gxout line'
 'set cmark 3'
 'set cstyle 2'
 'd mm'
 'set cstyle 1'
 'set cthick 1'
 'set line 'col
 'draw line 'xleg1' 'yleg' 0.5 'yleg
 'draw string '%(xleg2+dxleg)%' 'yleg' avg'
#-- selected member on the top
 col=4;yleg=yleg-dyleg
 'set gxout line'
 'set ccolor 'col
 'set cmark 5'
 'set cthick 6'
 'set cstyle 3'
 'd varDum(e='_ENS')'
 'set cstyle 1'
 'set line 'col
 'draw line 'xleg1' 'yleg' 0.5 'yleg
 'draw string '%(xleg2+dxleg)%' 'yleg' `3e`0:'_ENS
* title
 'draw title '_MENU._IVAR.NAM' for point '_xlonSel' '_xlatSel
#-- plot wind arrows
 if(_MENU._IVAR='WIND')
  plotArrows('u10','v10')
 endif
 _LAST='Envelope'
 'set grid off'
 'set ylopts 1'
return

#-----------------------------------------------------------------
* plotArrows disegna la distribuzione degli arrows del vento
function plotArrows(Uvar,Vvar)
#-- se SCALE=0 i vettorini sono tutti lunghi =, altrimenti sono tutti scalati rispetto alla lunghezza di _ENS
 SCALE=1
 dummy=getgx()
 x1=subwrd(dummy,3)
 x2=subwrd(dummy,4)
 y1=subwrd(dummy,5)
 y2=subwrd(dummy,6)
 'set z 1 2'
 'set e 1 '_NENS
 'define uu='Uvar
 'define vv='Vvar
 'set z 0.8 1.01';# vettori in alto
* 'set z 0.95 1.3';# vettori in basso
* 'set z 0.5 1.5';# vettori centrali
 'set gxout vector'
 'set parea 'x1' 'x2' 'y1' 'y2
 'set xlab off'
 'set ylab off'
 'set arrlab off'
 if(SCALE)
  scaleVal=1
  'define wndScale=mag(uu(e='_ENS'),vv(e='_ENS'))';say result
 else
  'define wndScale=const(uu,1)';say result
  scaleVal=''
 endif
 ens=0;while(ens<_NENS+1);ens=ens+1
  say 'set arrscl 0.25 'scaleVal
  'set arrscl 0.25 'scaleVal
#-- plotto in blu _ENS
  if(ens=_NENS+1)
   'set e '_ENS;say result
   'set cthick 6'
   'set ccolor 4'
  else
#-- plotto in grigio
   'set e 'ens;say result
   'set cthick 1'
   'set ccolor 15'
  endif
  'd uu/wndScale;vv/wndScale'
 endwhile
 'set xlab on'
 'set ylab on'
 'set e '_ENS
 'set z 1'
return

#-----------------------------------------------------------------
* MINMAX ritorna minimo e massimo, reali e arrotondati, per il plot corrente
function minmax(var)
* say 'ensview::minmax('var')'
 'set gxout stat'
 'd 'var
 i=0;while(i<100);i=i+1
  line=sublin(result,i)
  check=subwrd(line,1)
  if(check="Min,")
   min=subwrd(line,4)
   max=subwrd(line,5)
   if(max="to");max=min;endif
  endif
  if(check="Cmin,")
   cint=subwrd(line,7)
   cmin=subwrd(line,5)-cint
   cmax=subwrd(line,6)+cint
   break
  endif
  if(check="DISPLAY");return ''_ERR' '_ERR;endif
 endwhile
 if(min='min');say "FATAL ERROR IN MINMAX, contact Davide";'quit';endif
return min' 'max' 'cmin' 'cmax' 'cint

#-----------------------------------------------------------------
function drawrec(lon1,lon2,lat1,lat2)
 coords=Cw2xy(lon1,lat1);xp1=subwrd(coords,1);yp1=subwrd(coords,2)
 coords=Cw2xy(lon2,lat2);xp2=subwrd(coords,1);yp2=subwrd(coords,2)
 'set line 4'
 'draw rec 'xp1' 'yp1' 'xp2' 'yp2
return

#-----------------------------------------------------------------
function Cw2xy(xlon,xlat)
 'q w2xy 'xlon' 'xlat
 xp=subwrd(result,3)
 yp=subwrd(result,6)
return (xp' 'yp)

#-----------------------------------------------------------------
function Cxy2w(xp,yp)
 'q xy2w 'xp' 'yp
 xlon=subwrd(result,3)
 xlat=subwrd(result,6)
return (xlon' 'xlat)

#-----------------------------------------------------------------
function getgx()
*ga-> q gxinfo
*Last Graphic = Bar
*Page Size = 11 by 8.5
*X Limits = 2 to 10.5
*Y Limits = 0.75 to 7.75
*Xaxis = Lon  Yaxis = Val
*Mproj = 2
 'q gxinfo'
 line=sublin(result,1);type=subwrd(line,4)
 line=sublin(result,2);xsiz=subwrd(line,4);ysiz=subwrd(line,6)
 line=sublin(result,3);x1=subwrd(line,4);x2=subwrd(line,6)
 line=sublin(result,4);y1=subwrd(line,4);y2=subwrd(line,6)
 line=sublin(result,5);xtyp=subwrd(line,3);ytyp=subwrd(line,5)
return (xsiz' 'ysiz' 'x1' 'x2' 'y1' 'y2' 'xtyp' 'ytyp' 'type)

#-----------------------------------------------------------------
* per disegnare un mark dove clicco e sugli assi X e Y corrispondenti
function drawmark(ibut,xp,yp)
 if(ibut>3);return;endif
 dummy=getgx()
 x1=subwrd(dummy,3)
 x2=subwrd(dummy,4)
 y1=subwrd(dummy,5)
 y2=subwrd(dummy,6)
 type=subwrd(dummy,9)
 say ''x1' 'x2' 'y1' 'y2' 'type' 'xp' 'yp
 if(type!='Clear' & xp>x1 & xp<x2 & yp>y1 & yp<y2)
  if(ibut=1);icol=4;endif
  if(ibut=2);icol=14;endif
  if(ibut=3);icol=2;endif
  if(ibut=4);icol=3;endif
  if(ibut=5);icol=5;endif
  'set line 'icol
  'draw mark 1 'xp' 'yp' 0.1'
  'draw mark 1 'xp' '%y1-0.02' 0.1'
  'draw mark 1 'xp' '%y1+0.02' 0.1'
  'draw mark 1 'x1-0.02' 'yp' 0.1'
  'draw mark 1 'x1+0.02' 'yp' 0.1'
 endif
return

#-----------------------------------------------------------------
* FUNCTION SWITCH quello che era zero diventa 1 e viceversa
function switch(name)
 say 'ensview::switch('name')'
 if(name='Histo')
  if(_HISTO=0);_HISTO=1;else;_HISTO=0;endif
 endif
return


#-----------------------------------------------------------------
* DIFIRST disegna la prima pagina
function disfirst(file)
* definisce la pagina iniziale
 yp=2.3;dy=0.3
 'q config';vergrads=sublin(result,1);_vergrads=subwrd(vergrads,2)
 'set strsiz 0.16'
 'set string 15 l 2'
 yp=yp-dy;'draw string 0.4 'yp' File: 'file
 yp=yp-dy;'draw string 0.4 'yp' Grafica a cura di Davide Sacchetti'
 yp=yp-dy;'draw string 0.4 'yp' Versione: '_version' del: '_datavers
 yp=yp-dy;'draw string 0.4 'yp' GrADS Version: '_vergrads
 'set strsiz 0.28'
 'set string 15 c 3'
 'draw string 5.5 6.0 ARPA Piemonte'
 'draw string 5.5 5.0 Centro Funzionale Meteo-Idrologico'
 'draw string 5.5 4.6 di Protezione Civile Regione Piemonte'
 'set strsiz 1.0 1.0'
 'set string 7 c 0.2'
 'draw string 5.7 3.2 `4ENSVIEW`0'
 'set strsiz 1.02 1.1'
 'set string 12 c 0.25'
 'draw string 5.7 3.2 `4ENSVIEW`0'
 'set strsiz 1.05 1.2'
 'set string 8 c 0.25'
 'draw string 5.7 3.2 `4ENSVIEW`0'
 'set string 1 l 4'
return

#-----------------------------------------------------------------
function colors(arg)
 say 'ensview::colors('arg')'
* 'set rgb 19 228 237 255'
 'set rgb 19 224 235 255'
 'set rgb 20 254 254 254'
 if(arg='paoloRADAR')
  'set rgb 21 0 128 255'
  'set rgb 22 168 255 168'
  'set rgb 23 66 255 66'
  'set rgb 24 0 210 0'
  'set rgb 25 0 117 0'
  'set rgb 26 255 255 132'
  'set rgb 27 255 255 0'
  'set rgb 29 213 213 0'
  'set rgb 30 255 158 62'
  'set rgb 31 210 105 0'
  'set rgb 32 255 70 70'
  'set rgb 33 253 0 0'
  'set rgb 34 193 0 0'
  'set rgb 35 180 0 0'
  'set rgb 36 145 0 50'
  'set rgb 37 155 0 60'
  'set rgb 38 165 0 70'
  'set rgb 39 175 0 80'
  'set rgb 40 200 0 150'
  'set rgb 41 100 100 100'
  'set rgb 42 100 100 100'
 endif
 if(arg='' | arg='paolo')
  'set rgb 21 208 224 255'
  'set rgb 22 176 200 255'
  'set rgb 23 143 176 255'
  'set rgb 24 127 151 255'
  'set rgb 25  96 112 240'
  'set rgb 26   0 159  31'
  'set rgb 27  63 191  63'
  'set rgb 28 176 208 111'
  'set rgb 29 191 248 111'
  'set rgb 30 255 255 160'
  'set rgb 31 255 255 120'
  'set rgb 32 255 248  16'
  'set rgb 33 255 160  15'
  'set rgb 34 255   0   0'
  'set rgb 35 224   0   0'
  'set rgb 36 191   0   0'
  'set rgb 37 170   0   0'
  'set rgb 38 150   0   0'
  'set rgb 39 135   0   0'
  'set rgb 40 128   0   0'
  'set rgb 41 110   0   0'
  'set rgb 42 100   0 105'
  'set rgb 43 110   0 115'
  'set rgb 44 120   0 125'
  'set rgb 45 140   0 145'
  'set rgb 46 150   0 155'
 endif
 if(arg='gridview')
  'set rgb 21 224 235 255'
  'set rgb 22 181 201 255'
  'set rgb 23 142 178 255'
  'set rgb 24 127 150 255'
  'set rgb 25  99 112 247'
  'set rgb 26   0 159  30'
  'set rgb 27  60 188  61'
  'set rgb 28 179 209 110'
  'set rgb 29 185 249 110'
  'set rgb 30 255 249  20'
  'set rgb 31 255 163  10'
  'set rgb 32 229 0 0'
  'set rgb 33 189 0 0'
 endif
 if(arg='andrea')
  'set rgb 21 224 235 255'
  'set rgb 22 181 201 255'
  'set rgb 23 142 178 255'
  'set rgb 24 127 150 255'
  'set rgb 25  99 112 247'
  'set rgb 26   0 159  30'
  'set rgb 27  60 188  61'
  'set rgb 28 179 209 110'
  'set rgb 29 185 249 110'
  'set rgb 30 255 249  20'
  'set rgb 31 250 200 30'
  'set rgb 32 235 150 40'
  'set rgb 33 245 95 50'
  'set rgb 34 250 60 60'
  'set rgb 35 205 0 90'
  'set rgb 36 180 0 180'
  'set rgb 37 150 0 200'
  'set rgb 38 160 100 220'
  'set rgb 39 190 140 200'
  'set rgb 40 225 175 195'
  'set rgb 41 225 200 190'
  'set rgb 42 240 220 225'
 endif
* if(arg='oro')
*  'set rgb 51 240 240 240'
*  'set rgb 52 230 230 230'
*  'set rgb 53 220 220 220'
*  'set rgb 54 210 210 210'
*  'set rgb 55 200 200 200'
*  'set rgb 56 190 190 190'
*  'set rgb 57 180 180 180'
*  'set rgb 58 170 170 170'
*  'set rgb 59 160 160 160'
*  'set rgb 60 150 150 150'
*  'set rgb 61 140 140 140'
*  'set rgb 62 130 130 130'
*  'set rgb 63 120 120 120'
*  'set rgb 64 100 100 100'
*  'set rgb 65  90  90  90'
*  'set rgb 66  80  80  90'
*  'set rgb 67  70  70  80'
*  'set rgb 68  60  60  70'
*  'set rgb 69  50  50  60'
*  'set rgb 70  40  40  50'
*  'set rgb 71  30  30  40'
*  'set rgb 72  20  20  30'
* endif
 if(arg='oro')
  'set rgb 30 250 250 250'
  'set rgb 31 240 240 240'
  'set rgb 32 210 210 210'
  'set rgb 33 190 190 190'
  'set rgb 34 160 160 160'
  'set rgb 35 130 130 130'
  'set rgb 36 110 110 110'
  'set rgb 37  90  90  90'
  'set rgb 38  60  60  60'
  'set rgb 39  50  50  50'
  'set rgb 40  35  35  35'
  'set rgb 41  30  30  30'
  'set rgb 42  20  20  20'
  'set rgb 43  10  10  10'
  'set rgb 44 145 145 145'
  'set rgb 45  40  40  40'
  'set rgb 46 170 170 170'
  'set rgb 47 200 200 200'
  'set rgb 48 100 100 100'
  'set rgb 49  80  80  80'
  'set rgb 50 120 120 120'
  'set rgb 51 160 225 255'
  'set rgb 52  79 109 159'
 endif
 if(arg='standard')
  'set rgb 41 254 235 236'
  'set rgb 42 229 207 199'
  'set rgb 43 225 175 195'
  'set rgb 44 210 155 175'
  'set rgb 45 236 120 185'
  'set rgb 46 218 93 192'
  'set rgb 47 190 16 190'
  'set rgb 48 157 0 200'
  'set rgb 49 136 64 215'
  'set rgb 50 121 0 225'
  'set rgb 51 83 64 228'
  'set rgb 52 30 60 235'
  'set rgb 53 15 110 250'
  'set rgb 54 0 155 245'
  'set rgb 55 20 180 220'
  'set rgb 56 65 210 250'
  'set rgb 57 5 250 225'
  'set rgb 58 0 255 85'
  'set rgb 59 0 220 0'
  'set rgb 60 160 230 50'
  'set rgb 61 195 245 60'
  'set rgb 62 230 220 50'
  'set rgb 63 230 200 50'
  'set rgb 64 230 175 45'
  'set rgb 65 235 150 40'
  'set rgb 66 240 130 40'
  'set rgb 67 245 95 50'
  'set rgb 68 250 60 60'
  'set rgb 69 230 30 80'
  'set rgb 70 205 0 100'
  'set rgb 71 170 0 120'
  'set rgb 72 135 0 140'
 endif
 if(arg='msgCima')
  'set rgb 50 0 0 0'
  'set rgb 51 0 0 0'
  'set rgb 52 4 64 152'
  'set rgb 53 236 240 252'
  'set rgb 54 248 216 220'
  'set rgb 55 252 96 116'
  'set rgb 56 252 120 96'
  'set rgb 57 252 200 96'
  'set rgb 58 252 236 96'
  'set rgb 59 244 252 128'
  'set rgb 60 224 252 156'
  'set rgb 61 152 252 156'
  'set rgb 62 152 252 196'
  'set rgb 63 140 212 184'
  'set rgb 64 176 212 184'
  'set rgb 65 176 192 184'
  'set rgb 66 192 192 192'
  'set rgb 67 224 224 224'
  'set rgb 68 136 136 136'
  'set rgb 69 136 136 136'
  'set rgb 70 248 248 248'
  'set rgb 71 152 152 152'
  'set rgb 72 152 152 152'
 endif
* PALETTE b/n (usata per il radar) 21 - 99
 if(arg='msgB&W')
* sopra il range dinamico (basse temperature e valori di radianza)
  'set rgb 21 252 252 252'
  'set rgb 22 250 250 250'
  'set rgb 23 248 248 248'
  'set rgb 24 246 246 246'
  'set rgb 25 245 245 245'
  'set rgb 26 244 244 244'
  'set rgb 27 243 243 243'
  'set rgb 28 242 242 242'
  'set rgb 29 241 241 241'
* range dinamico (massima variabilita' in temp e radiazione)
  'set rgb 30 240 240 240'
  'set rgb 31 236 236 236'
  'set rgb 32 232 232 232'
  'set rgb 33 228 228 228'
  'set rgb 34 224 224 224'
  'set rgb 35 220 220 220'
  'set rgb 36 216 216 216'
  'set rgb 37 212 212 212'
  'set rgb 38 208 208 208'
  'set rgb 39 204 204 204'
  'set rgb 40 200 200 200'
  'set rgb 41 196 196 196'
  'set rgb 42 192 192 192'
  'set rgb 43 188 188 188'
  'set rgb 44 184 184 184'
  'set rgb 45 180 180 180'
  'set rgb 46 176 176 176'
  'set rgb 47 172 172 172'
  'set rgb 48 168 168 168'
  'set rgb 49 164 164 164'
  'set rgb 50 160 160 160'
  'set rgb 51 156 156 156'
  'set rgb 52 152 152 152'
  'set rgb 53 148 148 148'
  'set rgb 54 144 144 144'
  'set rgb 55 140 140 140'
  'set rgb 56 136 136 136'
  'set rgb 57 132 132 132'
  'set rgb 58 128 128 128'
  'set rgb 59 124 124 124'
  'set rgb 60 120 120 120'
  'set rgb 61 116 116 116'
  'set rgb 62 112 112 112'
  'set rgb 63 108 108 108'
  'set rgb 64 104 104 104'
  'set rgb 65 100 100 100'
  'set rgb 66  96  96  96'
  'set rgb 67  92  92  92'
  'set rgb 68  88  88  88'
  'set rgb 69  84  84  84'
  'set rgb 70  80  80  80'
  'set rgb 71  76  76  76'
  'set rgb 72  72  72  72'
  'set rgb 73  68  68  68'
  'set rgb 74  64  64  64'
  'set rgb 75  60  60  60'
  'set rgb 76  56  56  56'
  'set rgb 77  52  52  52'
  'set rgb 78  48  48  48'
  'set rgb 79  44  44  44'
  'set rgb 80  40  40  40'
  'set rgb 81  36  36  36'
  'set rgb 82  32  32  32'
  'set rgb 83  28  28  28'
  'set rgb 84  24  24  24'
  'set rgb 85  20  20  20'
  'set rgb 86  16  16  16'
  'set rgb 87  12  12  12'
  'set rgb 88   8   8   8'
  'set rgb 89   4   4   4'
* sotto il range dinamico (alte temperature e valori radianza)
  'set rgb 90   0   0   0'
* colors for radar
  'set rgb 91 160 215 255'
  'set rgb 92 0 100 255'
  'set rgb 93 0 160 50'
  'set rgb 94 150 255 100'
  'set rgb 95 255 200 50'
  'set rgb 96 255 0 0'
* colors for lsm, wind
  'set rgb 97 0 0 255'
  'set rgb 98 255 255 153'
  'set rgb 99 18 239 249'
 endif
* PALETTE tecnavia
 if(arg='msgTecnavia')
* b&n in alto e in basso
  'set rgb 30 240 240 240'
  'set rgb 54 144 144 144'
  'set rgb 55 140 140 140'
  'set rgb 56 136 136 136'
  'set rgb 57 132 132 132'
  'set rgb 58 128 128 128'
  'set rgb 59 124 124 124'
  'set rgb 60 120 120 120'
  'set rgb 61 116 116 116'
  'set rgb 62 112 112 112'
  'set rgb 63 108 108 108'
  'set rgb 64 104 104 104'
  'set rgb 65 100 100 100'
  'set rgb 66  96  96  96'
  'set rgb 67  92  92  92'
  'set rgb 68  88  88  88'
  'set rgb 69  84  84  84'
  'set rgb 70  80  80  80'
  'set rgb 71  76  76  76'
  'set rgb 72  72  72  72'
  'set rgb 73  68  68  68'
  'set rgb 74  64  64  64'
  'set rgb 75  60  60  60'
  'set rgb 76  56  56  56'
  'set rgb 77  52  52  52'
  'set rgb 78  48  48  48'
  'set rgb 79  44  44  44'
  'set rgb 80  40  40  40'
  'set rgb 81  36  36  36'
  'set rgb 82  32  32  32'
  'set rgb 83  28  28  28'
  'set rgb 84  24  24  24'
  'set rgb 85  20  20  20'
  'set rgb 86  16  16  16'
  'set rgb 87  12  12  12'
  'set rgb 88   8   8   8'
  'set rgb 89   4   4   4'
* colori tecnavia
  'set rgb 34 208  32 255';#violet
  'set rgb 33 255 116 255'
  'set rgb 32 255 164 255'
  'set rgb 31 255 208 255'
  'set rgb 38   0  32 255';#blue
  'set rgb 37   0 116 255'
  'set rgb 36   0 164 255'
  'set rgb 35   0 208 255'
  'set rgb 42  32 255  32';#green
  'set rgb 41 116 255 116'
  'set rgb 40 164 255 164'
  'set rgb 39 208 255 208'
  'set rgb 46 255  32   0';#red
  'set rgb 45 255 116   0'
  'set rgb 44 255 164   0'
  'set rgb 43 255 208   0'
 endif
 if(arg='mslp')
  'set rgb 34 255 208   0'
  'set rgb 21 102 109 247'
  'set rgb 22  25 145 249'
  'set rgb 23  62 162 244'
  'set rgb 24  48 180 251'
  'set rgb 25 120 200 237'
  'set rgb 26 138 222 237'
  'set rgb 27 153 221 180'
  'set rgb 28 110 211 160'
  'set rgb 29  68 201 140'
  'set rgb 30   0 188  61'
  'set rgb 31   0 158  30'
  'set rgb 32 110 162  84'
  'set rgb 33 125 176  77'
  'set rgb 34 125 190  84'
  'set rgb 35 172 206 100'
  'set rgb 36 185 228  89'
  'set rgb 37 202 228 127'
  'set rgb 38 254 214 127'
  'set rgb 39 239 192 117'
  'set rgb 40 237 166  75'
  'set rgb 41 229 134  63'
  'set rgb 42 223  100  48'
  'set rgb 43 204  73  66'
  'set rgb 44 195  51  63'
  'set rgb 45 187  21  61'
  'set rgb 46 206  38  78'
  'set rgb 47 234  20  83'
  'set rgb 48 254  77  93'
  'set rgb 49 255  97 113'
  'set rgb 50 255 127 143'
  'set rgb 51 255 147 163'
  'set rgb 52 255 162 178'
  'set rgb 53 255 172 188'
  'set rgb 54 255 182 198'
  'set rgb 55 255 195 205'
 endif
 if(arg='swh')
  'set rgb 22  25 145 249'
  'set rgb 24  48 180 251'
  'set rgb 27 153 221 180'
  'set rgb 32 110 162  84'
  'set rgb 34 125 190  84'
  'set rgb 36 185 228  89'
  'set rgb 42 223  100  48'
  'set rgb 44 195  51  63'
  'set rgb 70 255 249  20'
  'set rgb 71 250 200  30'
  'set rgb 77 150   0 200'
  'set rgb 78 160 100 220'
  'set rgb 80 225 175 195'
  'set rgb 100 220 220 220'
 endif
 if(arg='wspd')
  'set rgb 27 153 221 180'
  'set rgb 24  48 180 251'
  'set rgb 22  25 145 249'
  'set rgb 32 110 162  84'
  'set rgb 35 172 206 100'
  'set rgb 38 254 214 127'
  'set rgb 96 220 165  53'
  'set rgb 42 223  100  48'
  'set rgb 44 195  51  63'
  'set rgb 77 150   0 200'
  'set rgb 78 160 100 220'
 endif
return

#-----------------------------------------------------------------
* CHECKMAP per attivare la selezione a mouse di una map in All
function checkmap(nx,ny,shiftup,shiftdown,xp,yp)
 say 'ensview::checkmap('nx','ny','shiftup','shiftdown','xp','yp')'
 shiftleft=0
 shiftright=0
* capisco su quale mappa ho cliccato
 orient="landscape"
 if(orient="portrait")lengx=8.5;lengy=11;else;lengx=11;lengy=8.5;endif
 lx=lengx-(shiftleft+shiftright)
say ' lengy='lengy' shiftup='shiftup' shiftdown='shiftdown
 ly=lengy-(shiftup+shiftdown)
 dx=lx/nx
 dy=ly/ny
say 'dx='dx' dy='dy
 iplot=1
 ix=0;while(ix<nx);ix=ix+1
  iy=0;while(iy<ny);iy=iy+1
   x0=(ix-1)*dx+shiftleft;x1=x0+dx
   y0=(ny-iy)*dy+shiftdown;y1=y0+dy
say 'ix='ix' iy='iy'  'x0' < 'xp' < 'x1'  &  'y0' < 'yp' < 'y1' ?'
   if(xp>=x0 & xp<x1 & yp>=y0 & yp<y1)
    x0sav=x0;x1sav=x1;y0sav=y0;y1sav=y1
    iplot=ix+(iy-1)*nx
say 'OK'
    break
   endif
  endwhile
 endwhile
 say 'la mappa sel ha iplot='iplot
say 'draw rec 'x0sav' 'y0sav' 'x1sav' 'y1sav
 'set line 2';'draw rec 'x0sav' 'y0sav' 'x1sav' 'y1sav
 '!sleep 1'
return iplot

#-----------------------------------------------------------------
function setZoom(xp1,yp1,xp2,yp2)
 SelExact=1

* ordino correttamente xp1,yp1,xp2,yp2
 if(xp1>xp2);xsav=xp2;xp2=xp1;xp1=xsav;endif
 if(yp1>yp2);ysav=yp2;yp2=yp1;yp1=ysav;endif
 say 'x1 x2 y1 y2: 'xp1' 'xp2' 'yp1' 'yp2

* coordinate x1 x2 y1 e y2 di griglia (da 1 a _NLON o _NLAT)
 'query xy2gr 'xp1' 'yp1
 _x1=subwrd(result,3)
 _y1=subwrd(result,6)
 'query xy2gr 'xp2' 'yp2
 _x2=subwrd(result,3)
 _y2=subwrd(result,6)

 if(SelExact=1)
* per salvare i punti cliccati "discretizzati sul grigliato di set gxout grid"
  _x1=math_nint(_x1);x1dum=_x1-0.5
  _y1=math_nint(_y1);y1dum=_y1-0.5
  _x2=math_nint(_x2);x2dum=_x2+0.5
  _y2=math_nint(_y2);y2dum=_y2+0.5
* ritrovo le coordinate xp1,yp1,xp2,yp2 di pagina
  'query gr2xy 'x1dum' 'y1dum
  xp1=subwrd(result,3)
  yp1=subwrd(result,6)
  'query gr2xy 'x2dum' 'y2dum
  xp2=subwrd(result,3)
  yp2=subwrd(result,6)
 endif

* trovo le coord lon e lat
* 'query xy2w 'xp1' 'yp1
* lon1=subwrd(result,3)
* lat1=subwrd(result,6)
* 'query xy2w 'xp2' 'yp2
* lon2=subwrd(result,3)
* lat2=subwrd(result,6)
 'set line 2'
 'draw rec 'xp1' 'yp1' 'xp2' 'yp2

 'set x '_x1' '_x2
 'set y '_y1' '_y2
 'q dims';say result
return

#-----------------------------------------------------------------
function dimens()
* per capire come sono settate le dims X Y Z T
 'query dims'
 linex=sublin(result,2)
 liney=sublin(result,3)
 linez=sublin(result,4)
 linet=sublin(result,5)

 flagx=subwrd(linex,3)
 if(flagx="varying")
  x1=subwrd(linex,11)
  x2=subwrd(linex,13)
  lon1=subwrd(linex,6)
  lon2=subwrd(linex,8)
  else
   x1=subwrd(linex,9)
   x2=subwrd(linex,9)
   lon1=subwrd(linex,6)
   lon2=subwrd(linex,6)
 endif

 flagy=subwrd(liney,3)
 if(flagy="varying")
  y1=subwrd(liney,11)
  y2=subwrd(liney,13)
  lat1=subwrd(liney,6)
  lat2=subwrd(liney,8)
  else
   y1=subwrd(liney,9)
   y2=subwrd(liney,9)
   lat1=subwrd(liney,6)
   lat2=subwrd(liney,6)
 endif

 flagz=subwrd(linez,3)
 if(flagz="varying")
  z1=subwrd(linez,11)
  z2=subwrd(linez,13)
  lev1=subwrd(linez,6)
  lev2=subwrd(linez,8)
  else
   z1=subwrd(linez,9)
   z2=subwrd(linez,9)
   lev1=subwrd(linez,6)
   lev2=subwrd(linez,6)
 endif

 flagt=subwrd(linet,3)
 if(flagt="varying")
  t1=subwrd(linet,11)
  t2=subwrd(linet,13)
  tstr1=subwrd(linet,6)
  ltstr=subwrd(linet,8)
  else
   t1=subwrd(linet,9)
   t2=subwrd(linet,9)
   tstr1=subwrd(linet,6)
   tstr2=subwrd(linet,6)
 endif

*say ' 'x1' 'x2' 'y1' 'y2' 'z1' 'z2' 't1' 't2
return (x1' 'x2' 'y1' 'y2' 'z1' 'z2' 't1' 't2' 'lon1' 'lon2' 'lat1' 'lat2' 'lev1' 'lev2' 'tstr1' 'tstr2)

#-----------------------------------------------------------------
#-- crea una rubber band all'interno della plot area
function drawRband(type,id)
 if(type='type');type=box;endif
 if(id='id');id=1;endif
 parea=getParea()
 'set rband 'id' 'type' 'parea
return

#-----------------------------------------------------------------
#-- torna la parea dell'ultimo plot
function getParea()
 'q gxinfo'
 linea=sublin(result,3)
 x1p=subwrd(linea,4)
 x2p=subwrd(linea,6)
 linea=sublin(result,4)
 y1p=subwrd(linea,4)
 y2p=subwrd(linea,6)
return x1p' 'y1p' 'x2p' 'y2p

#-----------------------------------------------------------------
#-- torna se le coord di pagina passate sono dentro (1) o fuori (0) la plot area
function insideParea(xp,yp)
 parea=getParea()
 x1p=subwrd(parea,1)
 y1p=subwrd(parea,2)
 x2p=subwrd(parea,3)
 y2p=subwrd(parea,4)
 if(xp>=x1p & xp<=x2p & yp>=y1p & yp<=y2p)
  ret=1
 else
  ret=0
 endif
 say 'ensview:insideParea('xp','yp') ['x1p' 'x2p' 'y1p' 'y2p'] -> 'ret
return ret

#-----------------------------------------------------------------
function incr(var,dir)
 if(var='');var='t';endif
 if(dir='');dir='+1';endif
 if(var='x');iline=2;endif
 if(var='y');iline=3;endif
 if(var='z');iline=4;endif
 if(var='t');iline=5;endif
 if(var='e');iline=6;endif
 'q dims'
 line=sublin(result,iline)
 check=subwrd(line,3)
 if(check!='fixed')
  say ''line' 'var' has to be fixed, not 'check
  return
 endif
 num0=subwrd(line,9)
 num1=num0+dir
 'set 'var' 'num1
 say 'system variable 'var' changed: 'num0' -> 'num1
* 'q dims';say ''result
return num1

#-----------------------------------------------------------------
function getNxNy(N0)
#-- per trovare quanti Nx e Ny ci vogliono per rappresentare N0 grafici
 ns=math_nint(math_sqrt(N0))
 offset=math_nint(ns/3)
 NxNy=''
 N2=2*N0
 i=ns-offset-1;while(i<ns+offset);i=i+1
  j=ns-offset-1;while(j<ns);j=j+1
   N1=i*j
   if(N1<N2 & N1>=N0)
    N2=N1
    NxNy=i' 'j
   endif
  endwhile
 endwhile
return NxNy

#-----------------------------------------------------
#-- torna il fattore moltiplicativo per la precipitazione
function getFactor(var)
 if(_UNITS.var="[kg/m**2]" | _UNITS.var="[kg/(m**2)]" | _UNITS.var="[mm]" | _UNITS.var="[kg/m^2]");fact="";else;fact="*1000";endif
 print '------------------------------------------------ var:'var' units:'_UNITS.var' fact:'fact
return fact

#-----------------------------------------------------
#-- torna l'esistenza di una certa udx
function checkUdx(udx)
 check=0
 'q udxt'
*       raigrid -> f_dvd        from </usr/share/dot/i7/opt/grads-2.1.0.oga.1/Contents/Linux/Versions/2.1.0.oga.1/x86_64/gex/libdvd.gex>
 i=0;while(1);i=i+1
  line=sublin(result,i)
  word=subwrd(line,1)
  if(word='->');continue;endif
#-- trovo udx in udxt
  if(word=udx)
*   fxgex=subwrd(line,5)
*   flen=strlen(fxgex)
*   fxgex=substr(fxgex,2,flen-2)
*#-- controllo se esiste la lib gex associata
*   'exists 'fxgex
*   exst=subwrd(result,1)
*   if(exst='yes')
    check=1
*    say '"'udx'" and "'fxgex'" FOUND'
*   else
*    say '"'udx'" exists in udxt but gex "'fxgex'" is missing!'
*   endif
   break
  endif
  if(line='');break;endif
 endwhile
return check


#----------------------------------------------------------------
#-- torna il giorno della settimana
*Zellerday v0.1
*24/12/2020
*Author Brian Gaze
*Zeller's rule
*Revieds by Davide

*Pass in DDMMMYYYY

function zellerday(datagrads)
len=math_strlen(datagrads)
if (len<9)
  say 'ERROR in zellerday('datagrads') argument not of the form [hh[:mn]Z]DDMMMYYYY'
  return '???'
endif
year=substr(datagrads,len-3,4)
month=substr(datagrads,len-6,3)
day=substr(datagrads,len-8,2)
say 'zellerday <'datagrads'> <'year'> <'month'> <'day'>'

*****get m which is the month number,year
***** return day
if (month = 'MAR'); m= 1; endif
if (month = 'APR'); m= 2; endif
if (month = 'MAY'); m= 3; endif
if (month = 'JUN'); m= 4; endif
if (month = 'JUL'); m= 5; endif
if (month = 'AUG'); m= 6; endif
if (month = 'SEP'); m= 7; endif
if (month = 'OCT'); m= 8; endif
if (month = 'NOV'); m= 9; endif
if (month = 'DEC'); m= 10; endif
if (month = 'JAN'); m= 11; endif
if (month = 'FEB'); m= 12; endif

*****Get last 2 digits of the year
D = substr(year,3,2)

*Subtract 1 from year if month is January or February
if m=11; D=D-1; endif
if m=12; D=D-1; endif

*****C is first 2 digits of the year
C = substr(year,1,2)

*get remainder of [(13*m-1)/5]
xz =  (13*m-1)/5
xzform=xz
if (valnum(xzform) =2)
  xz1dp = math_format('%.1f',xz)
  xzform=math_int(xz1dp)
endif

*get remainder of [D/4]
xzd= D/4
xzdform=xzd
if (valnum(xzdform) =2)
  xzd1dp = math_format('%.1f',xzd)
  xzdform=math_int(xzd1dp)
endif

say 'C:'C' D:'D' day:'day
f = day + xzform + D + xzdform + C/4 - 2*C
say f' = 'day' + 'xzform' + 'D' + 'xzdform' + 'C'/4 - 2*'C

say 'xz:'xz' xzform:'xzform
say 'xzd:'xzd' xzdform:'xzdform
say 'f:'f

*grads command
*rc = math_mod(num1,num2);
*num1       any number
*num2       any number not equal to zero
*rc         the integer part of the remainder when num1 is divided by num2

if (f>-1); daynum = math_mod(f,7); endif
if (f<0); daynum = math_mod(f,-7); endif
if (daynum<0); daynum = daynum +7; endif
if (daynum=0); week = 'Sun'; endif
if (daynum=1); week = 'Mon'; endif
if (daynum=2); week = 'Tue'; endif
if (daynum=3); week = 'Wed'; endif
if (daynum=4); week = 'Thu'; endif
if (daynum=5); week = 'Fri'; endif
if (daynum=6); week = 'Sat'; endif

return week
