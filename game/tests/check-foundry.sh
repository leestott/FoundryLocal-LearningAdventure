#!/bin/bash
# Quick health check for Foundry Local service

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔍 FOUNDRY LOCAL HEALTH CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

BASE_URL=""

# Step 0: Discover port dynamically
echo "0. Discovering Foundry Local port..."
if command -v foundry &> /dev/null; then
    FOUNDRY_OUTPUT=$(foundry service status 2>&1)
    DISCOVERED_PORT=$(echo "$FOUNDRY_OUTPUT" | grep -oP 'https?://(?:127\.0\.0\.1|localhost):\K\d+' | head -1)
    if [ -n "$DISCOVERED_PORT" ]; then
        if curl -s --max-time 3 "http://127.0.0.1:$DISCOVERED_PORT/v1/models" > /dev/null 2>&1; then
            BASE_URL="http://127.0.0.1:$DISCOVERED_PORT"
            echo "   ✅ Discovered port $DISCOVERED_PORT via CLI"
        fi
    fi
fi

# Fall back to port scanning if CLI didn't work
if [ -z "$BASE_URL" ]; then
    echo "   ℹ️  Scanning common ports..."
    for port in 61341 5272 51319 5000 8080; do
        if curl -s --max-time 2 "http://127.0.0.1:$port/v1/models" > /dev/null 2>&1; then
            BASE_URL="http://127.0.0.1:$port"
            echo "   ✅ Found Foundry Local on port $port"
            break
        fi
    done
fi

if [ -z "$BASE_URL" ]; then
    echo "   ❌ Foundry Local is NOT running"
    echo ""
    echo "   To start Foundry Local:"
    echo "   1. Install Foundry Local CLI"
    echo "   2. Run: foundry model run Phi-4"
    echo ""
    exit 1
fi

# Test 1: Service availability
echo ""
echo "1. Testing service availability at $BASE_URL..."
if curl -s --max-time 10 "$BASE_URL/v1/models" > /tmp/foundry_models.json 2>/dev/null; then
    echo "   ✅ Foundry Local is running!"
    if command -v jq &> /dev/null; then
        models=$(jq -r '.data[].id' /tmp/foundry_models.json 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
        echo "   📦 Available models: $models"
    fi
else
    echo "   ❌ Service not responding"
    exit 1
fi

# Determine model to use for chat test
CHAT_MODEL="Phi-4"
if command -v jq &> /dev/null; then
    DETECTED_MODEL=$(jq -r '.data[].id' /tmp/foundry_models.json 2>/dev/null | grep -iE 'instruct|chat|phi' | head -1)
    if [ -n "$DETECTED_MODEL" ]; then
        CHAT_MODEL="$DETECTED_MODEL"
    else
        FIRST_MODEL=$(jq -r '.data[0].id' /tmp/foundry_models.json 2>/dev/null)
        if [ -n "$FIRST_MODEL" ] && [ "$FIRST_MODEL" != "null" ]; then
            CHAT_MODEL="$FIRST_MODEL"
        fi
    fi
fi

# Test 2: Chat completion
echo ""
echo "2. Testing chat completion with model: $CHAT_MODEL..."
RESPONSE=$(curl -s --max-time 30 "$BASE_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$CHAT_MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"Say OK only.\"}],\"max_tokens\":10}")

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
