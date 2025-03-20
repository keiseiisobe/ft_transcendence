#!/bin/bash
echo "entrypoint.sh"
CERTS_DIR="/usr/share/kibana/config/certs"
if [ -d "$CERTS_DIR" ]; then
    rm -rf "$CERTS_DIR"
    echo "Removed."
fi
mkdir -p /usr/share/kibana/config/certs
cp /certs/ca/ca.crt /usr/share/kibana/config/certs/ca.crt
cp /certs/kibana/kibana.crt /usr/share/kibana/config/certs/kibana.crt
cp /certs/kibana/kibana.key /usr/share/kibana/config/certs/kibana.key
rm -rf /certs/kibana

ls -la /usr/share/kibana/config/certs
chown -R kibana:kibana /usr/share/kibana/config/certs



exec gosu kibana /usr/local/bin/kibana-docker

