import csv
import io
import os
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, render_template, request, send_file

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "clicks.db")


def init_db() -> None:
    """Create the database and clicks table if they do not exist."""
    os.makedirs(BASE_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                button_label TEXT NOT NULL,
                click_number INTEGER NOT NULL,
                click_date TEXT NOT NULL,
                click_time TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


# Ensure database exists when the module is imported
init_db()


def next_click_number(conn: sqlite3.Connection, date_str: str) -> int:
    """Return the next sequential click number for the given date."""
    cursor = conn.execute(
        "SELECT COALESCE(MAX(click_number), 0) FROM clicks WHERE click_date = ?",
        (date_str,),
    )
    current = cursor.fetchone()[0]
    return current + 1


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/click", methods=["POST"])
def register_click():
    data = request.get_json(silent=True) or {}
    button_label = data.get("button")
    if not button_label:
        return jsonify({"error": "'button' is required"}), 400

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.isolation_level = None  # Use autocommit off and BEGIN IMMEDIATE for safety
        conn.execute("BEGIN IMMEDIATE")
        seq = next_click_number(conn, date_str)
        conn.execute(
            "INSERT INTO clicks (button_label, click_number, click_date, click_time) VALUES (?, ?, ?, ?)",
            (button_label, seq, date_str, time_str),
        )
        conn.commit()
    except sqlite3.DatabaseError as exc:
        conn.rollback()
        return jsonify({"error": "database_error", "details": str(exc)}), 500
    finally:
        conn.close()

    return jsonify(
        {
            "button": button_label,
            "click_number": seq,
            "date": date_str,
            "time": time_str,
        }
    )


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/api/all", methods=["GET"])
def get_all_data():
    """Return all clicks with statistics."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get all clicks
    cursor.execute(
        "SELECT button_label, click_number, click_date, click_time FROM clicks ORDER BY click_date DESC, click_number DESC"
    )
    all_clicks = cursor.fetchall()

    # Get today's clicks
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute(
        "SELECT COUNT(*) FROM clicks WHERE click_date = ?", (today,)
    )
    today_count = cursor.fetchone()[0]

    # Get unique services
    cursor.execute("SELECT COUNT(DISTINCT button_label) FROM clicks")
    unique_services = cursor.fetchone()[0]

    conn.close()

    return jsonify(
        {
            "clicks": all_clicks,
            "total": len(all_clicks),
            "today": today_count,
            "unique": unique_services,
        }
    )


@app.route("/api/export", methods=["GET"])
def export_data():
    """Export all clicks to a CSV file."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT button_label, click_number, click_date, click_time FROM clicks ORDER BY click_date DESC, click_number DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Serviço", "Número Sequencial", "Data", "Hora"])
    writer.writerows(rows)

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name="registo_cliques.csv"
    )


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
