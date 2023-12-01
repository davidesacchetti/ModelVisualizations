function grads_locale {
  BASEDIR=`realpath $PWD/../../grads-2.0.1`
  export LD_LIBRARY_PATH=$BASEDIR/lib64
  export GADBIN=$BASEDIR/bin
  export GADDIR=$BASEDIR/data
  GRADS_CMD="$GADBIN/grads"
}

function grads_module {
  module load grads
  GRADS_CMD="grads -d X11"
}

#-- MAIN
grads_module
cd "`dirname $0`/../lib" || exit 1
$GRADS_CMD -cxl "run ensview.gs fctl=../test-data/ecepsmem_2023102700.ctl foro=data/ENSEN_ITALY_0200_zsfc.ctl addO=1"

