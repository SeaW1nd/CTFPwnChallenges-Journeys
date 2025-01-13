FROM ubuntu:22.04

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get -y update --fix-missing && apt-get -y upgrade
RUN apt-get -y install xinetd

RUN groupadd -r ctf && useradd -r -g ctf ctf
ADD src/pwn.xinetd /etc/xinetd.d/ctf

ADD src/init.sh    /etc/init.sh
RUN chmod 700        /etc/init.sh

RUN chmod 1733 /tmp /var/tmp /dev/shm

ADD src/run.sh   /home/ctf/run.sh
RUN chmod 550        /home/ctf/run.sh

ADD src/flag.txt /home/ctf/flag.txt
ADD src/w1_store /home/ctf/w1_store
RUN chmod 440 /home/ctf/flag.txt
RUN chmod 550 /home/ctf/w1_store

RUN chown -R root:ctf /home/ctf

RUN service xinetd restart