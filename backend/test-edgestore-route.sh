#!/bin/bash

# Test EdgeStore backend route

echo "=========================================="
echo "🧪 Testing EdgeStore Backend Route"
echo "=========================================="
echo ""

echo "1. Testing /api/edgestore/init endpoint:"
echo "   Method: POST"
echo "   Expected: Should return JSON response"
echo ""

# Test POST to /api/edgestore/init
echo "Response:"
curl -X POST https://api.gyanin.academy/api/edgestore/init \
  -H "Content-Type: application/json" \
  -H "Origin: https://gyanin.academy" \
  -v 2>&1 | grep -E "< HTTP|< Content-Type|< Access-Control|error|message" | head -10

echo ""
echo "2. Testing OPTIONS (CORS preflight):"
curl -X OPTIONS https://api.gyanin.academy/api/edgestore/init \
  -H "Origin: https://gyanin.academy" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -E "< HTTP|< Access-Control" | head -5

echo ""
echo "3. Testing GET (should return method not allowed or 404):"
curl -X GET https://api.gyanin.academy/api/edgestore/init \
  -H "Origin: https://gyanin.academy" \
  -v 2>&1 | grep -E "< HTTP" | head -1

echo ""
echo "=========================================="

