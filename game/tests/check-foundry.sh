#!/bin/bash
# Quick health check for Foundry Local service

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔍 FOUNDRY LOCAL HEALTH CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

BASE_URL="http://localhost:5272"

# Test 1: Service availability
echo "1. Testing service availability..."
if curl -s --max-time 10 "$BASE_URL/v1/models" > /tmp/foundry_models.json 2>/dev/null; then
    echo "   ✅ Foundry Local is running!"
    if command -v jq &> /dev/null; then
        models=$(jq -r '.data[].id' /tmp/foundry_models.json 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
        echo "   📦 Available models: $models"
    fi
else
    echo "   ❌ Foundry Local is NOT running"
    echo ""
    echo "   To start Foundry Local:"
    echo "   1. Install Foundry Local CLI"
    echo "   2. Run: foundry model run Phi-4"
    echo ""
    exit 1
fi

# Test 2: Chat completion
echo ""
echo "2. Testing chat completion..."
RESPONSE=$(curl -s --max-time 30 "$BASE_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d '{"model":"Phi-4","messages":[{"role":"user","content":"Say OK only."}],"max_tokens":10}')

if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo "   ✅ Chat endpoint working!"
    if command -v jq &> /dev/null; then
        reply=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null)
        echo "   📝 Response: $reply"
    fi
else
    echo "   ⚠️  Chat endpoint test failed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✨ Health check complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
