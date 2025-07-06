#!/usr/bin/env bash
# Usage: ./setup.sh <PROJECT_NAME> <DB_PASSWORD> [REGION]
# Automates creation of a hosted Supabase project, enables PostGIS/uuid-ossp via migrations,
# links the local directory, and pushes all migrations.
# Requires:
#   • You have run `supabase login` (stores an access token).
#   • jq installed for JSON parsing (\`sudo apt-get install jq\` on Ubuntu).
#   • Billing enabled on your Supabase account.

set -euo pipefail

PROJECT_NAME="${1:-}"
DB_PASSWORD="${2:-}"
REGION="${3:-us-east-1}"

if [[ -z "$PROJECT_NAME" || -z "$DB_PASSWORD" ]]; then
  echo "\nUsage: $0 <PROJECT_NAME> <DB_PASSWORD> [REGION]"
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found; install with: npm i -g supabase@latest"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for JSON parsing. Install via your package manager (e.g., sudo apt-get install jq)."
  exit 1
fi

echo "\n➡️  Creating Supabase project '$PROJECT_NAME' (region: $REGION)..."
CREATE_RESP=$(supabase projects create "$PROJECT_NAME" \
  --db-password "$DB_PASSWORD" \
  --region "$REGION" \
  --output json)

PROJECT_REF=$(echo "$CREATE_RESP" | jq -r '.ref')
SUPABASE_URL=$(echo "$CREATE_RESP" | jq -r '.apiUrl')
ANON_KEY=$(echo "$CREATE_RESP" | jq -r '.anonKey')

if [[ -z "$PROJECT_REF" || "$PROJECT_REF" == "null" ]]; then
  echo "❌ Failed to parse project reference. Output was:\n$CREATE_RESP"
  exit 1
fi

echo "✅ Project created: $PROJECT_REF"

# Link local directory so further CLI commands target this project
supabase link --project-ref "$PROJECT_REF" --yes

# Push all pending migrations (includes PostGIS extension & schema)
export PGPASSWORD="$DB_PASSWORD"
echo "\n➡️  Pushing migrations..."
supabase db push --yes

echo "\n🎉 All done! Your backend is ready. Save these credentials:" 
echo "   SUPABASE_URL=$SUPABASE_URL"
echo "   SUPABASE_ANON_KEY=$ANON_KEY"