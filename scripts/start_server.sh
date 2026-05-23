#!/bin/bash
cd /var/www/deployease/backend
pm2 delete deployease-api || true
pm2 start index.js --name deployease-api
