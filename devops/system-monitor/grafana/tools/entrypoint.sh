wget https://dl.grafana.com/oss/release/grafana-11.3.0.linux-arm64.tar.gz
tar -zxvf grafana-11.3.0.linux-arm64.tar.gz
rm grafana-11.3.0.linux-arm64.tar.gz

mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | tee /etc/apt/keyrings/grafana.gpg > /dev/null

# rename grafana dir
mv /grafana-v11.3.0 /grafana

# register prometheus 
mv /prometheus-datasource.yml /grafana/conf/provisioning/datasources/

# ???
mv /node-exporter.yml /grafana/conf/provisioning/dashboards/

# dashboard json files
mkdir -p /var/lib/grafana
mkdir -p /var/lib/grafana/dashboards
mv /node-exporter.json /var/lib/grafana/dashboards/
mv /postgres.json /var/lib/grafana/dashboards/

# setting password policy 
sed -i 's/^password_policy = false/password_policy = true/' /grafana/conf/default.ini
cd grafana
./bin/grafana server
