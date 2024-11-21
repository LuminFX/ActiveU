#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://users_db_cert_user:F2wRRTefO7pM5U6523nQQTe2dhhsFFrS@dpg-csvmb5ogph6c73e2489g-a.oregon-postgres.render.com/users_db_cert"

# Execute each .sql file in the directory
for file in init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done