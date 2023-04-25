#!/bin/sh

#ssh host
ufw allow 65022

#ssh
ufw allow 22
#telnet
ufw allow 23
#rlogin
ufw allow 513
#petscii 40-column
ufw allow 64
#petscii 128-column
ufw allow 128
#smtp-mail
ufw allow 25
#smtp-submit
ufw allow 587
#smtp-submit+tls
ufw allow 465
#pop3
ufw allow 110
#pop3+tls
ufw allow 995
#imap
ufw allow 143
#imap+tls
ufw allow 993
#ftp
ufw allow 21
#pasv port range
ufw allow 62100:62199/tcp
#ws-term
ufw allow 1123
#wss-term
ufw allow 11235
#message send prot
ufw allow 18
#active user svc
ufw allow 11
#qotd
ufw allow 17
#finger
ufw allow 79
#hotline
#ufw allow 5500:5500
#hotline-trans
#ufw allow 5501:5501
#binkp
ufw allow 24554
#binkps
ufw allow 24553
#nntp
ufw allow 119
#nntps
ufw allow 563
#irc
ufw allow 6667
#http
ufw allow 80
#https
ufw allow 443

#ecweb
# ufw allow 51080
ufw allow from 10.38.0.80 proto tcp to any port 51080
#rmweb
# ufw allow 52080
ufw allow from 10.38.0.80 proto tcp to any port 52080
