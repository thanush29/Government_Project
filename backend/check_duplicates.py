import pandas as pd

df = pd.read_csv("mgnrega_data.csv", dtype=str)

# Create the same key format used in Supabase logic
df['unique_key'] = df['fin_year'] + "_" + df['month'] + "_" + df['state_code'] + "_" + df['district_code']

total_rows = len(df)
unique_rows = df['unique_key'].nunique()
duplicate_rows = total_rows - unique_rows

print("Total rows:", total_rows)
print("Unique keys:", unique_rows)
print("Duplicate rows:", duplicate_rows)

# Show top 5 duplicates to confirm
dupes = df[df.duplicated('unique_key', keep=False)]
print("\nSample duplicate entries:")
print(dupes.head())
