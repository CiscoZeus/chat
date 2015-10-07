while true
do
  pmacct -s -e -a -O json >> /var/log/pmacct.log
  sleep 30
done
