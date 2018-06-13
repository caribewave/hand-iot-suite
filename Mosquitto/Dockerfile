FROM eclipse-mosquitto

COPY /config/pwfile /mosquitto/config
RUN mosquitto_passwd -U /mosquitto/config/pwfile
COPY /config/mosquitto.conf /mosquitto/config

CMD ["/usr/sbin/mosquitto","-c","/mosquitto/config/mosquitto.conf"]