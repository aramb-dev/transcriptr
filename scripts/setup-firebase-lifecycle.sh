#!/bin/bash

# Script to apply Firebase Storage lifecycle configuration
# This will automatically delete files older than 1 day in temp_audio/ and test/ directories

set -e

echo "🔄 Setting up Firebase Storage lifecycle management..."

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null; then
    echo "❌ Error: gsutil is not installed"
    echo "📦 Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Read the bucket name from .env.local
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    exit 1
fi

BUCKET=$(grep NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

if [ -z "$BUCKET" ]; then
    echo "❌ Error: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not found in .env.local"
    exit 1
fi

echo "📦 Bucket: gs://$BUCKET"
echo ""

# Apply lifecycle configuration
echo "⚙️  Applying lifecycle configuration..."
gsutil lifecycle set lifecycle.json gs://$BUCKET

echo ""
echo "✅ Lifecycle configuration applied successfully!"
echo ""
echo "📋 Current lifecycle configuration:"
gsutil lifecycle get gs://$BUCKET

echo ""
echo "✨ Files in temp_audio/ and test/ directories will now be automatically deleted after 1 day"
