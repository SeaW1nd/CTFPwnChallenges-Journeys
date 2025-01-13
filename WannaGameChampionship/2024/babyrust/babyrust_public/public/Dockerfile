FROM ubuntu:22.04
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update --fix-missing -y && apt-get -y upgrade
RUN apt-get install -y xinetd


#RUN useradd -m ctf


#RUN chown -R ctf:ctf /home/ctf/

#COPY chall /home/ctf
#COPY flag /home/ctf
#COPY run /home/ctf
#COPY init.sh /home/ctf/
#COPY xinetd /etc/xinetd.d/babyrust
#RUN chmod +x /home/ctf/run /home/ctf/init.sh /home/ctf/chall
#RUN chmod 444 /home/ctf/flag

#WORKDIR /home/ctf
#USER ctf

#CMD ["./init.sh"]

