#!/bin/bash

workdir=/usr/share/elasticsearch
certdir=$workdir/config/certs/service-certificates
ymlfile=$workdir/service-certificates.yml

mkdir -p $certdir

# CA証明書の作成（まだ存在しない場合）
if [ ! -f $certdir/ca.key ] || [ ! -f $certdir/ca.crt ]; then
  echo "CA証明書を作成中"
  openssl genrsa -out $certdir/ca.key 4096
  openssl req -x509 -new -nodes -key $certdir/ca.key -sha256 -days 3650 -out $certdir/ca.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=MyOrganization/OU=IT/CN=My CA"
  echo "CA証明書を作成しました"
fi

# YAMLファイルから各エントリを処理
yq e -o=json $ymlfile | jq -c '.certificates[]' | while read -r cert; do
  name=$(echo $cert | jq -r '.name')
  cn=$(echo $cert | jq -r '.cn')
  
  echo "証明書を生成中: $name ($cn)"
  
  # 秘密鍵の生成
  openssl genrsa -out "$certdir/${name}.key" 2048
  
  # CSR（証明書署名要求）の作成
  subj="/C=JP/ST=Tokyo/L=Tokyo/O=MyOrganization/OU=IT/CN=${cn}"
  openssl req -new -key "$certdir/${name}.key" -out "$certdir/${name}.csr" -subj "$subj"
  
  # SANを含む設定ファイルの作成（存在する場合）
  if echo $cert | jq -e '.san' > /dev/null; then
    extfile="$certdir/${name}.ext"
    cat > "$extfile" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
EOF
    
    # SANエントリの追加
    san_index=1
    echo $cert | jq -r '.san[]' | while read -r san; do
      echo "DNS.$san_index = $san" >> "$extfile"
      san_index=$((san_index+1))
    done
    
    # CSRから証明書を生成（SANあり）
    openssl x509 -req -in "$certdir/${name}.csr" -CA "$certdir/ca.crt" -CAkey "$certdir/ca.key" \
      -CAcreateserial -out "$certdir/${name}.crt" -days 365 -sha256 \
      -extfile "$extfile"
  else
    # CSRから証明書を生成（SANなし）
    openssl x509 -req -in "$certdir/${name}.csr" -CA "$certdir/ca.crt" -CAkey "$certdir/ca.key" \
      -CAcreateserial -out "$certdir/${name}.crt" -days 365 -sha256
  fi
  
  echo "証明書の生成が完了しました: ${name}.crt"
done

echo "すべての証明書の生成が完了しました"
