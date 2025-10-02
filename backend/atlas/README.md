# Atlas Backend Setup

## Install required packages:
```bash
sudo pacman -S postgresql postgis gdal
```

## Initialize Postgresql
```bash
sudo -iu postgres
initdb --locale=$LANG -E UTF8 -D /var/lib/postgres/data
exit
```

## Start Postgresql service
```bash
sudo systemctl start postgresql
```

## Create user and Database
```bash
sudo -iu postgres
createuser --interactive
createdb -O <username> atlas  # change username to your username configured in above step.
```

## Enable PostGIS
```bash
psql -U <username> -d atlas
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# Verify using:
SELECT PostGIS_Version();
```

## Seed the database
```bash
chmod +x seed.sh
./seed.sh <username>
```

## **Edit URL in config.py**

## Create virtualenv and install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Start server
```bash
python run.py
```

## Test using curl:

+ GET all polygons
```
curl http://127.0.0.1:5000/api/polygons
```

+ GET polygon by ID
```
curl http://127.0.0.1:5000/api/polygons/<id>
```

+ POST new polygon
```
curl -X POST http://127.0.0.1:5000/api/polygons \
  -H "Content-Type: application/json" \
  -d @test.json
```

+ PUT (update) existing polygon
```
curl -X PUT http://127.0.0.1:5000/api/polygons/<id> \
  -H "Content-Type: application/json" \
  -d @test.json
```

+ DELETE polygon
```
curl -X DELETE http://127.0.0.1:5000/api/polygons/<id>
```
