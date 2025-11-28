#!/usr/bin/env bash
set -euo pipefail
sleep 2
EMAIL="test+$(date +%s)@example.com"
RESP=$(curl -s -X POST 'http://localhost:3001/api/auth/register' -H 'Content-Type: application/json' -d '{"name":"Test Admin","email":"'"$EMAIL"'" ,"password":"P@ssw0rd!"}')
echo "REGISTER_RESP:$RESP"
TOKEN=$(echo "$RESP" | node -e "const d=require('fs').readFileSync(0,'utf8'); try{const j=JSON.parse(d); console.log(j.token||j.accessToken||j.data?.token||j.data?.accessToken||j.data?.access_token||'');}catch(e){console.error('PARSE_ERR');}")
echo "TOKEN:$TOKEN"
CREATED=$(curl -s -X POST 'http://localhost:3001/api/blogs' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d '{"title":"Temp Test Blog","slug":"temp-test-blog-'"$(date +%s)"'","content":"temp"}')
echo "CREATED:$CREATED"
ID=$(echo "$CREATED" | node -e "const d=require('fs').readFileSync(0,'utf8'); try{const j=JSON.parse(d); console.log(j.data?.id||j.id||'');}catch(e){console.error('PARSE_ERR');}")
echo "BLOG_ID:$ID"
if [ -n "$ID" ]; then
  DEL=$(curl -s -X DELETE "http://localhost:3001/api/blogs/$ID" -H "Authorization: Bearer $TOKEN")
  echo "DELETE_RESP:$DEL"
else
  echo "No BLOG_ID; skipping delete"
fi
