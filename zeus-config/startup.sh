pmacctd -D -f /root/pmacct/pmacct-1.5.2/examples/probe_netflow.conf
nohup redis-server 2>&1 >> /var/log/redis-server.log &
cd /root/chat
nohup nodejs ./chatServer.js 2>&1 >> /var/log/chatserver.log &
nohup /root/chat/zeus-config/pmacct_collect.sh 2>&1 >> /var/log/pmacct_collect.log &
