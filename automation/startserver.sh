while true
do
cd /root/chat/
nohup nodejs chatServer.js  2>&1 >> /var/log/chatserver_out.log
sleep 5
done
