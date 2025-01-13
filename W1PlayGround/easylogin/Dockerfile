FROM node:20

RUN mkdir /app
COPY app.js package.json yarn.lock /app/
WORKDIR /app
RUN yarn
ENV FLAG="W1{test}"
RUN chmod +x /app/app.js

EXPOSE 3000
ENTRYPOINT [ "/app/app.js" ]