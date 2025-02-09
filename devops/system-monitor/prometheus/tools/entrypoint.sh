wget https://github.com/prometheus/prometheus/releases/download/v2.55.0/prometheus-2.55.0.linux-arm64.tar.gz
tar -xvf prometheus-2.55.0.linux-arm64.tar.gz
rm prometheus-2.55.0.linux-arm64.tar.gz

mv /prometheus.yml prometheus-2.55.0.linux-arm64/prometheus.yml

cd prometheus-2.55.0.linux-arm64

./prometheus --config.file=prometheus.yml
