curl -XPOST -H "Content-Type: application/json" -d '{
  "name":"kisobe",
  "email":"keisobe@graf.com",
  "login":"kisobe",
  "password":"Kisobe42!"
}' http://admin:prom-operator@grafana:3000/api/admin/users

curl -XPOST -H "Content-Type: application/json" -d '{
  "name":"resaito",
  "email":"resaito@graf.com",
  "login":"resaito",
  "password":"resaito42!"
}' http://admin:prom-operator@grafana:3000/api/admin/users

curl -XPOST -H "Content-Type: application/json" -d '{
  "name":"jyasukaw",
  "email":"jyasukaw@graf.com",
  "login":"jyasukaw",
  "password":"jyasukaw42!"
}' http://admin:prom-operator@grafana:3000/api/admin/users

curl -XPOST -H "Content-Type: application/json" -d '{
  "name":"tchoquet",
  "email":"tchoquet@graf.com",
  "login":"tchoquet",
  "password":"tchoquet42!"
}' http://admin:prom-operator@grafana:3000/api/admin/users


