from . import db
from geoalchemy2 import Geometry


class Polygon(db.Model):
    __tablename__ = "polygons"

    id = db.Column(db.Integer, primary_key=True)
    identity = db.Column(db.String, nullable=True)
    name = db.Column(db.String, nullable=True)
    country = db.Column(db.String, nullable=True)
    category = db.Column(db.String, nullable=True)
    ethncty_1 = db.Column(db.String, nullable=True)
    populatn = db.Column(db.Integer, nullable=True)
    pop_year = db.Column(db.Integer, nullable=True)
    pop_source = db.Column(db.String, nullable=True)
    area_ofcl = db.Column(db.Float, nullable=True)
    area_gis = db.Column(db.Float, nullable=True)
    iso_code = db.Column(db.String, nullable=True)
    geom = db.Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)
