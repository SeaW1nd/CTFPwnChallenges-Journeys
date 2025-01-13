FROM node:14

RUN mkdir /app
COPY flag /flag
RUN chown root:root /flag
RUN chmod 600 /flag 

COPY read_flag.c /
RUN gcc /read_flag.c -o /read_flag
RUN rm /read_flag.c
RUN chmod +x /read_flag
RUN chmod u+s /read_flag



RUN useradd -ms /bin/bash ctf_user
RUN groupadd ctf && \
    usermod -a -G ctf ctf_user

COPY --chown=ctf_user:ctf app.js /app
COPY --chown=ctf_user:ctf package.json /app
COPY --chown=ctf_user:ctf yarn.lock /app
COPY --chown=ctf_user:ctf index.html /app

RUN chown -R ctf_user:ctf_user /app
RUN chmod 555 /app/app.js
RUN chmod 555 /app/package.json
RUN chmod 555 /app/yarn.lock

USER ctf_user 
WORKDIR /app
RUN yarn
ENTRYPOINT [ "node", "/app/app.js" ]
