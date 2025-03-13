curl -XPOST -u kousuzuk:kousuzuk42! -H "Content-Type: application/json" -d '{
  "name":"kisobe",
  "email":"keisobe@graf.com",
  "login":"kisobe",
  "password":"Kisobe4242!!",
  "OrgId": 2
}' http://grafana:3000/api/admin/users
curl -X POST -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" -d '
{
  "loginOrEmail":"kisobe",
  "role":"Editor"
}' http://grafana:3000/api/orgs/2/users

curl -XPOST -u kousuzuk:kousuzuk42! -H "Content-Type: application/json" -d '{ "name":"resaito",
  "email":"resaito@graf.com",
  "login":"resaito",
  "password":"Resaito4242!!",
  "OrgId": 2
}' http://grafana:3000/api/admin/users
curl -X POST -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" -d '
{
  "loginOrEmail":"resaito",
  "role":"Editor"
}' http://grafana:3000/api/orgs/2/users

curl -XPOST -u kousuzuk:kousuzuk42! -H "Content-Type: application/json" -d '{
  "name":"jyasukaw",
  "email":"jyasukaw@graf.com",
  "login":"jyasukaw",
  "password":"Jyasukaw4242!!",
  "OrgId": 2
}' http://grafana:3000/api/admin/users
curl -X POST -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" -d '
{
  "loginOrEmail":"jyasukaw",
  "role":"Editor"
}' http://grafana:3000/api/orgs/2/users

curl -X POST -u kousuzuk:kousuzuk42! -H "Content-Type: application/json" -d '{
  "name":"tchoquet",
  "email":"tchoquet@graf.com",
  "login":"tchoquet",
  "password":"Tchoquet4242!!",
  "OrgId": 2
}' http://grafana:3000/api/admin/users
curl -X POST -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" -d '
{
  "loginOrEmail":"tchoquet",
  "role":"Editor"
}' http://grafana:3000/api/orgs/2/users

curl -XPOST -u kousuzuk:kousuzuk42! -H "Content-Type: application/json" -d '{
  "name":"viewer",
  "email":"viewer@graf.com",
  "login":"viewer",
  "password":"Viewer4242!!",
  "OrgId": 2
}' http://grafana:3000/api/admin/users

