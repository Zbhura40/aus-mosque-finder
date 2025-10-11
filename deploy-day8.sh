#!/bin/bash

# Day 8 Deployment Script
# This script deploys the weekly cache refresh automation

set -e  # Exit on error

echo "🚀 Starting Day 8 Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login
echo -e "${BLUE}Step 1: Login to Supabase${NC}"
echo "Running: supabase login"
supabase login
echo ""

# Step 2: Link project
echo -e "${BLUE}Step 2: Link to project${NC}"
echo "Running: supabase link --project-ref wlzsnrqizimqctdiqjjv"
supabase link --project-ref wlzsnrqizimqctdiqjjv
echo ""

# Step 3: Deploy function
echo -e "${BLUE}Step 3: Deploy Edge Function${NC}"
echo "Running: supabase functions deploy refresh-cached-mosques"
supabase functions deploy refresh-cached-mosques
echo ""

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the function manually (see test-day8.sh)"
echo "2. Set up cron job in Supabase Dashboard"
echo "3. Monitor logs for first execution"
