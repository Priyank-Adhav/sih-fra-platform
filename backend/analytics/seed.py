import csv
import os
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


def parse_numeric(value, as_float=False):
    if not value or value.strip() in ("NA/NR", "NA", ""):
        return None
    try:
        return float(value) if as_float else int(value)
    except ValueError:
        return None


def map_snapshot(suffix):
    """Map suffixes like '3006' -> 2025-06-30, '3107' -> 2025-07-31"""
    if suffix == "3006":
        return datetime(2025, 6, 30).date()
    elif suffix == "3107":
        return datetime(2025, 7, 31).date()
    return None


def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Create table if not exists
    cur.execute(
        """
    CREATE TABLE IF NOT EXISTS land_claims_observation (
        id SERIAL PRIMARY KEY,
        state TEXT NOT NULL,
        snapshot_date DATE NOT NULL,
        claims_individual INTEGER,
        claims_community INTEGER,
        titles_individual INTEGER,
        titles_community INTEGER,
        claims_rejected INTEGER,
        claims_disposed INTEGER,
        pct_disposed NUMERIC(5,2),
        pct_titles_distributed NUMERIC(5,2),
        forest_land_individual_acres NUMERIC,
        forest_land_community_acres NUMERIC,
        created_at TIMESTAMP DEFAULT now()
    );
    """
    )
    conn.commit()

    # Clear old data before re-inserting
    cur.execute("TRUNCATE land_claims_observation;")
    conn.commit()

    with open("extraction/data-combined.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            state = row["States/UT"].strip()

            for suffix in ("3006", "3107"):
                snapshot_date = map_snapshot(suffix)

                claims_individual = parse_numeric(
                    row[f"Claims_Individual_upto_{suffix}"]
                )
                claims_community = parse_numeric(row[f"Claims_Community_upto_{suffix}"])
                titles_individual = parse_numeric(
                    row[f"Titles_Individual_upto_{suffix}"]
                )
                titles_community = parse_numeric(row[f"Titles_Community_upto_{suffix}"])

                claims_rejected = parse_numeric(row["Claims_Rejected"])
                claims_disposed = parse_numeric(row["Claims_Disposed"])
                pct_disposed = parse_numeric(row["Percent_Disposed"], as_float=True)
                pct_titles_distributed = parse_numeric(
                    row["Percent_Titles_Distributed"], as_float=True
                )
                forest_ind_acres = parse_numeric(
                    row["Forest_Land_Individual_acres"], as_float=True
                )
                forest_com_acres = parse_numeric(
                    row["Forest_Land_Community_acres"], as_float=True
                )

                print(
                    "Inserting:",
                    state,
                    snapshot_date,
                    claims_individual,
                    claims_community,
                    titles_individual,
                    titles_community,
                    claims_rejected,
                    claims_disposed,
                    pct_disposed,
                    pct_titles_distributed,
                    forest_ind_acres,
                    forest_com_acres,
                )

                cur.execute(
                    """
                    INSERT INTO land_claims_observation (
                        state, snapshot_date, claims_individual, claims_community,
                        titles_individual, titles_community, claims_rejected, claims_disposed,
                        pct_disposed, pct_titles_distributed,
                        forest_land_individual_acres, forest_land_community_acres
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        state,
                        snapshot_date,
                        claims_individual,
                        claims_community,
                        titles_individual,
                        titles_community,
                        claims_rejected,
                        claims_disposed,
                        pct_disposed,
                        pct_titles_distributed,
                        forest_ind_acres,
                        forest_com_acres,
                    ),
                )

    conn.commit()
    cur.close()
    conn.close()
    print("Table ensured, truncated, and data inserted successfully.")


if __name__ == "__main__":
    main()
