#!/usr/bin/env bash
set -euo pipefail

# 1) cd into script folder
cd "$(dirname "$0")"

# 2) Ensure .env is present
if [[ ! -f .env ]]; then
  echo "ERROR: .env not found in $(pwd)" >&2
  exit 1
fi

# 3) Load .env (strip any CRs)
while IFS= read -r line || [[ -n $line ]]; do
  line=${line//$'\r'/}
  [[ -z $line || $line =~ ^# ]] && continue
  [[ $line != *=* ]] && continue
  IFS='=' read -r key val <<< "$line"
  key="${key//[[:space:]]/}"
  val="${val%\"}"
  val="${val#\"}"
  if [[ $key =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    export "$key"="$val"
  fi
done < .env

# 4) Ask for root/admin credentials
read -rp "MySQL admin user (e.g. root): " ADMIN_USER
read -srp "Password for $ADMIN_USER: " ADMIN_PW
echo ""

# 5) Run the SQL to create DB and user
mysql \
  -u"$ADMIN_USER" -p"$ADMIN_PW" \
  -h"$DB_HOST" -P"$DB_PORT" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'%'
  IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
SQL

echo "✅ Database \`$DB_NAME\` and user \`$DB_USER\`@'%' are ready."
