import requests

# Approximate rates as fallback (updated periodically)
FALLBACK_RATES = {
    'USD': 83.5,
    'EUR': 91.2,
    'GBP': 106.0,
    'THB': 2.4,
    'JPY': 0.56,
    'SGD': 62.5,
    'AED': 22.7,
    'MYR': 18.0,
    'IDR': 0.0054,
    'LKR': 0.26,
    'NPR': 0.52,
    'VND': 0.0034,
    'KRW': 0.063,
    'AUD': 55.0,
    'NZD': 51.0,
    'CHF': 95.0,
    'CAD': 62.0,
}


def get_exchange_rate(currency_code: str) -> float:
    currency_code = currency_code.upper()
    if currency_code == 'INR':
        return 1.0

    try:
        resp = requests.get(
            f"https://api.exchangerate-api.com/v4/latest/{currency_code}",
            timeout=3
        )
        data = resp.json()
        if 'rates' in data and 'INR' in data['rates']:
            return data['rates']['INR']
    except Exception:
        pass

    return FALLBACK_RATES.get(currency_code, 1.0)


def convert_to_inr(amount: float, from_currency: str) -> float:
    rate = get_exchange_rate(from_currency)
    return round(amount * rate, 2)
