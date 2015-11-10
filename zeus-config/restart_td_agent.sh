#configure with cron
# */1 * * * * /root/restart_td_agent.sh

PIDFILE=/var/run/td-agent/td-agent.pid
if ! test -f $PIDFILE || ! kill -0 `cat $PIDFILE`; then
   service td-agent restart
   sleep 5
fi
