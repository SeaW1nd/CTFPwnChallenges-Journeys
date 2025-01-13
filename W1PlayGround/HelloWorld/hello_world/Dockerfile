FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install \ 
xinetd 

RUN rm -fr /etc/xinetd.d/*

RUN useradd -U -m ctf && mkdir -p /home/ctf
ADD chall /home/ctf/
ADD flag.txt /home/ctf/flag.txt
ADD ctf.xinetd /etc/xinetd.d/ctf

RUN chmod 755 /home/ctf/chall \
    && chmod 444 /home/ctf/flag.txt

USER ctf

ENV CTF_PORT 1337
EXPOSE 1337

ENTRYPOINT ["/usr/sbin/xinetd", "-dontfork", "-stayalive", "-inetd_compat"]