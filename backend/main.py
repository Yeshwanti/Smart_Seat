from fastapi import FastAPI, HTTPException
import json, os
from datetime import datetime, timedelta

app = FastAPI(title="Smart Seat Backend API")

DATA_PATH = "mock_data"

# Helper function to load JSON
def load_json(filename):
    with open(os.path.join(DATA_PATH, filename), "r") as f:
        return json.load(f)

# Helper function to save JSON
def save_json(filename, data):
    with open(os.path.join(DATA_PATH, filename), "w") as f:
        json.dump(data, f, indent=4)

@app.get("/")
def home():
    return {"message": "Welcome to Smart Seat Backend API!"}

# ✅ GET /get_tables → return table list
@app.get("/get_tables")
def get_tables():
    return load_json("tables.json")

# ✅ POST /book_table → create reservation (10-min expiry)
@app.post("/book_table")
def book_table(name: str, group_size: int):
    reservations = load_json("reservations.json")
    new_reservation = {
        "id": len(reservations) + 1,
        "name": name,
        "group_size": group_size,
        "booked_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat(),
        "status": "active"
    }
    reservations.append(new_reservation)
    save_json("reservations.json", reservations)
    return {"message": "Table booked successfully!", "reservation": new_reservation}

# ✅ POST /add_customer → add walk-in to queue
@app.post("/add_customer")
def add_customer(name: str, group_size: int):
    customers = load_json("customers.json")
    new_customer = {
        "id": len(customers) + 1,
        "name": name,
        "group_size": group_size,
        "joined_at": datetime.now().isoformat(),
        "waiting_time": 0
    }
    customers.append(new_customer)
    save_json("customers.json", customers)
    return {"message": "Customer added to queue!", "customer": new_customer}

# ✅ POST /allocate_table → assign based on priority logic
@app.post("/allocate_table")
def allocate_table():
    tables = load_json("tables.json")
    customers = load_json("customers.json")
    reservations = load_json("reservations.json")

    # Remove expired reservations
    current_time = datetime.now()
    reservations = [
        r for r in reservations
        if datetime.fromisoformat(r["expires_at"]) > current_time
    ]
    save_json("reservations.json", reservations)

    available_tables = [t for t in tables if t["status"] == "available"]
    if not available_tables:
        raise HTTPException(status_code=400, detail="No available tables right now")

    # Calculate priority score for each waiting customer/reservation
    candidates = []

    for c in customers:
        waiting_minutes = (
            datetime.now() - datetime.fromisoformat(c["joined_at"])
        ).seconds // 60
        candidates.append({
            "name": c["name"],
            "group_size": c["group_size"],
            "priority_score": waiting_minutes + 0,  # no reservation bonus
            "type": "walk-in"
        })

    for r in reservations:
        waiting_minutes = (
            datetime.now() - datetime.fromisoformat(r["booked_at"])
        ).seconds // 60
        candidates.append({
            "name": r["name"],
            "group_size": r["group_size"],
            "priority_score": waiting_minutes + 1,  # reservation bonus
            "type": "reservation"
        })

    if not candidates:
        raise HTTPException(status_code=400, detail="No customers waiting")

    # Assign based on priority (higher score first)
    candidates.sort(key=lambda x: x["priority_score"], reverse=True)
    selected = candidates[0]

    # Find best-fitting table
    best_table = min(
        available_tables,
        key=lambda t: abs(t["size"] - selected["group_size"])
    )
    best_table["status"] = "occupied"

    # Save updated table data
    for i, t in enumerate(tables):
        if t["id"] == best_table["id"]:
            tables[i] = best_table
    save_json("tables.json", tables)

    return {
        "message": f"Table {best_table['id']} allocated to {selected['name']}",
        "table": best_table,
        "customer": selected
    }

