from flask import Blueprint, request, jsonify, abort
from . import db
from .models import Polygon
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape, mapping

bp = Blueprint("polygons", __name__)


# Helper to serialize polygon to GeoJSON Feature
def polygon_to_feature(p):
    return {
        "type": "Feature",
        "id": p.id,
        "geometry": mapping(to_shape(p.geom)),
        "properties": {
            "identity": p.identity,
            "name": p.name,
            "country": p.country,
            "category": p.category,
            "ethncty_1": p.ethncty_1,
            "populatn": p.populatn,
            "pop_year": p.pop_year,
            "pop_source": p.pop_source,
            "area_ofcl": p.area_ofcl,
            "area_gis": p.area_gis,
            "iso_code": p.iso_code,
        },
    }


# GET all polygons
@bp.route("/polygons", methods=["GET"])
def get_polygons():
    polys = Polygon.query.all()
    features = [polygon_to_feature(p) for p in polys]
    return jsonify({"type": "FeatureCollection", "features": features})


# POST new polygon
@bp.route("/polygons", methods=["POST"])
def create_polygon():
    data = request.get_json()
    if not data or data.get("type") != "Feature":
        return abort(400, "Invalid GeoJSON Feature payload")

    geom = shape(data["geometry"])
    props = data.get("properties", {})

    poly = Polygon(
        geom=from_shape(geom, srid=4326),
        identity=props.get("identity"),
        name=props.get("name"),
        country=props.get("country"),
        category=props.get("category"),
        ethncty_1=props.get("ethncty_1"),
        populatn=props.get("populatn"),
        pop_year=props.get("pop_year"),
        pop_source=props.get("pop_source"),
        area_ofcl=props.get("area_ofcl"),
        area_gis=props.get("area_gis"),
        iso_code=props.get("iso_code"),
    )

    db.session.add(poly)
    db.session.commit()
    return jsonify({"id": poly.id}), 201


# GET polygon by ID
@bp.route("/polygons/<int:poly_id>", methods=["GET"])
def get_polygon(poly_id):
    poly = Polygon.query.get_or_404(poly_id)
    return jsonify(polygon_to_feature(poly))


# PUT polygon by ID
@bp.route("/polygons/<int:poly_id>", methods=["PUT"])
def update_polygon(poly_id):
    poly = Polygon.query.get_or_404(poly_id)
    data = request.get_json()
    if not data or data.get("type") != "Feature":
        return abort(400, "Invalid GeoJSON Feature payload")

    geom = shape(data["geometry"])
    props = data.get("properties", {})

    poly.geom = from_shape(geom, srid=4326)
    poly.identity = props.get("identity")
    poly.name = props.get("name")
    poly.country = props.get("country")
    poly.category = props.get("category")
    poly.ethncty_1 = props.get("ethncty_1")
    poly.populatn = props.get("populatn")
    poly.pop_year = props.get("pop_year")
    poly.pop_source = props.get("pop_source")
    poly.area_ofcl = props.get("area_ofcl")
    poly.area_gis = props.get("area_gis")
    poly.iso_code = props.get("iso_code")

    db.session.commit()
    return jsonify({"message": "Updated successfully"})


# DELETE polygon by ID
@bp.route("/polygons/<int:poly_id>", methods=["DELETE"])
def delete_polygon(poly_id):
    poly = Polygon.query.get_or_404(poly_id)
    db.session.delete(poly)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"})
