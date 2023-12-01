BASEDIR=`realpath $PWD/../../grads-2.0.1`
export LD_LIBRARY_PATH=$BASEDIR/lib64
export GADBIN=$BASEDIR/bin
export GADDIR=$BASEDIR/data
export GASCRP=$BASEDIR/lib
cd ../lib
$GADBIN/grads -cxl "run ensview.gs fctl=../test-data/ecepsmem_2023102700.ctl foro=data/ENSEN_ITALY_0200_zsfc.ctl addO=1"

