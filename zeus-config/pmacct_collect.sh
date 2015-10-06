while true
do
  pmacct -s -a -O json >> /var/log/pmacct.log
  sleep 30
done
