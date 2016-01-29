#!/bin/bash
echo "**************************************************************"
echo "http://rates-query-dev:3001/?ws=rates-query-dev:3001&port=5858"
echo "**************************************************************"
pkill -f "node-inspector"
node-inspector --web-port=3001 & mocha --recursive --debug-brk