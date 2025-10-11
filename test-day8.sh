#!/bin/bash

# Day 8 Manual Test Script
# This script tests the weekly cache refresh function

set -e

echo "🧪 Testing Weekly Cache Refresh Function..."
echo ""

# Your Supabase configuration
PROJECT_REF="wlzsnrqizimqctdiqjjv"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

# Check if SUPABASE_ANON_KEY is set
if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: SUPABASE_ANON_KEY not set"
  echo ""
  echo "Please set your Supabase anon key:"
  echo "  export SUPABASE_ANON_KEY='your-anon-key-here'"
  echo ""
  echo "You can find your anon key at:"
  echo "  Supabase Dashboard → Settings → API → anon/public key"
  exit 1
fi

echo "📡 Calling refresh function at: ${SUPABASE_URL}/functions/v1/refresh-cached-mosques"
echo ""

# Call the function
RESPONSE=$(curl -X POST "${SUPABASE_URL}/functions/v1/refresh-cached-mosques" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -s -w "\n%{http_code}")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check status
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Test successful! (HTTP $HTTP_CODE)"
  echo ""

  # Parse stats if available
  TOTAL=$(echo "$BODY" | jq -r '.stats.totalMosques' 2>/dev/null || echo "N/A")
  UPDATED=$(echo "$BODY" | jq -r '.stats.updated' 2>/dev/null || echo "N/A")
  UNCHANGED=$(echo "$BODY" | jq -r '.stats.unchanged' 2>/dev/null || echo "N/A")
  ERRORS=$(echo "$BODY" | jq -r '.stats.errors' 2>/dev/null || echo "N/A")
  COST=$(echo "$BODY" | jq -r '.stats.totalCost' 2>/dev/null || echo "N/A")

  if [ "$TOTAL" != "N/A" ]; then
    echo "📊 Stats:"
    echo "   - Total mosques: $TOTAL"
    echo "   - Updated: $UPDATED"
    echo "   - Unchanged: $UNCHANGED"
    echo "   - Errors: $ERRORS"
    echo "   - Cost: \$$COST"
  fi
else
  echo "❌ Test failed! (HTTP $HTTP_CODE)"
  echo ""
  echo "Error message:"
  echo "$BODY"
  exit 1
fi

echo ""
echo "🎉 Function is working correctly!"
echo ""
echo "Next: Set up the cron job to run this automatically every Sunday."
