#!/usr/bin/env bash
set -euo pipefail

# ——————————————————————————————
# 1) Ensure we’re in the right dir and .env exists
# ——————————————————————————————
cd "$(dirname "$0")"
if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found in $(pwd)"
  exit 1
fi

# ——————————————————————————————
# 2) Load variables from .env safely
# ——————————————————————————————
while IFS= read -r line || [[ -n $line ]]; do
  # strip any trailing CR (Windows line endings)
  line=${line//$'\r'/}
  # skip empty lines or lines starting with #
  [[ -z $line || $line =~ ^[[:space:]]*# ]] && continue
  # must contain an equals sign
  [[ $line != *=* ]] && continue

  # split into key and val at first '='
  IFS='=' read -r key val <<< "$line"
  # trim whitespace around key
  key="${key//[[:space:]]/}"
  # strip surrounding quotes from val, if any
  val="${val#\"}"; val="${val%\"}"

  # only export if key is a valid shell identifier
  if [[ $key =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    export "$key"="$val"
  fi
done < .env

# ——————————————————————————————
# 3) Build the mysql command
# ——————————————————————————————
MYSQL_OPTS=(
  -u"${DB_USER}"
  -p"${DB_PASSWORD}"
  -h"${DB_HOST}"
  -P"${DB_PORT}"
  --batch --skip-column-names
)

# ——————————————————————————————
# 4) Fetch all non-system schemas
# ——————————————————————————————
USER_DBS=$(mysql "${MYSQL_OPTS[@]}" -e "
  SELECT SCHEMA_NAME
    FROM INFORMATION_SCHEMA.SCHEMATA
   WHERE SCHEMA_NAME NOT IN
         ('mysql','information_schema','performance_schema','sys');
")

if [[ -z $USER_DBS ]]; then
  echo "✔ No non-system databases found."
  exit 0
fi

echo "⚠️  The following databases will be dropped:"
printf "  • %s\n" $USER_DBS

read -rp "Type 'yes' to proceed: " CONFIRM
if [[ $CONFIRM != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

# ——————————————————————————————
# 5) Drop them, one by one
# ——————————————————————————————
for db in $USER_DBS; do
  echo "Dropping \`$db\` …"
  mysql "${MYSQL_OPTS[@]}" -e "DROP DATABASE \`$db\`;"
done

echo "✅ All user databases dropped."
