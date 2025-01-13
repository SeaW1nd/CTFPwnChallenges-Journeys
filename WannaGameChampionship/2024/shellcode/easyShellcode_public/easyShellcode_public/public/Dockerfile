FROM ubuntu:22.04

RUN apt update && \
    apt install ncat -y

COPY chall readflag /

RUN chmod +x /chall /readflag
RUN chmod o+x /chall /readflag
RUN chmod o-r /readflag

RUN adduser user
USER user


CMD [ "/bin/sh", "-c", "ncat -lnvp 4444 -k -e /chall" ]
