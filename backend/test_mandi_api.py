import requests

# Government of India Mandi Price API
API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Paste YOUR API key from data.gov.in here
API_KEY = "api-key=579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645&offset=0&limit=all &format=csv."

params = {
    "api-key": API_KEY,
    "format": "json",
    "offset": 0,
    "limit": 2
}

try:
    print("Connecting to data.gov.in...")

    response = requests.get(
        API_URL,
        params=params,
        timeout=60
    )

    print("Status Code:", response.status_code)

    response.raise_for_status()

    data = response.json()

    print("\nAPI CONNECTED SUCCESSFULLY! ✅")

    print("\nTotal records:")
    print(data.get("total", "Not available"))

    print("\nFirst records:")

    for record in data.get("records", []):
        print(record)

except Exception as error:
    print("\nAPI CONNECTION FAILED ❌")
    print(error)