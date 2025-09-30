#!/bin/sh

echo "Seeding database with polygons...."

# ogr2ogr -f "PostgreSQL" \
#   PG:"dbname=atlas user=$1 host=localhost" \
#   geojson-poly-4326-india-cleaned.json \
#   -nln polygons

#ogr2ogr -f "PostgreSQL" PG:"dbname=atlas user=$POSTGRES_USER password=changeme host=db port=5432" geojson-poly-4326-india-cleaned.json -nln polygons -append

ogr2ogr -f "PostgreSQL" \
  PG:"dbname=atlas user=$POSTGRES_USER host=db port=5432" \
  geojson-poly-4326-india-cleaned.json \
  -nln polygons \
  -lco FID=id \
  -lco GEOMETRY_NAME=geom \
  -nlt PROMOTE_TO_MULTI

echo "Finished Seeding"
