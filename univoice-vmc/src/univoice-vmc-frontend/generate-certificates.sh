#!/bin/bash

CERT_DIR=".certificates"
CERT_PATH="$CERT_DIR/cert.pem"
KEY_PATH="$CERT_DIR/key.pem"

echo "Generating SSL certificates for local development..."

mkdir -p $CERT_DIR
cd $CERT_DIR

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

echo ""
echo "Certificates generated successfully at:"
echo "Certificate: $CERT_PATH"
echo "Private Key: $KEY_PATH"
echo ""
echo "You can now run your development server with HTTPS enabled." 