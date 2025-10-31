import os, requests, time
from supabase import create_client, Client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

API_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722"
API_KEY = os.environ.get("DATA_GOV_API_KEY", "579b464db66ec23bdd0000019630d990aebf44a36fe605a3808e09b9")

client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_page(limit=1000, offset=0):
    params = {
        "api-key": API_KEY,
        "limit": limit,
        "offset": offset,
        "format": "json"
    }
    r = requests.get(API_URL, params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def sync_all():
    limit = 1000
    offset = 0

    print("🚀 Starting realtime sync...")

    while True:
        data = fetch_page(limit, offset)
        records = data.get("records", [])

        if not records:
            print("✅ No more records to sync.")
            break

        # Add unique key & clean data
        for r in records:
            r["unique_key"] = f"{r.get('fin_year','')}_{r.get('month','')}_{r.get('state_code','')}_{r.get('district_code','')}"

        # Upsert
        res = client.table("mgnrega_stats").upsert(records, on_conflict="unique_key").execute()

        count = len(records)
        print(f"✅ Synced batch: {count} rows | Offset: {offset}")

        offset += limit
        time.sleep(0.2)  # avoid API abuse

    print("🎉 Realtime sync finished successfully!")

if __name__ == "__main__":
    sync_all()
