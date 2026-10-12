"""
QuantStack Terminal - Physical & Spot Gold, Silver and Commodities Service
"""
from typing import Dict, Any, List
import yfinance as yf

class GoldCommodityService:
    @staticmethod
    def get_precious_metals_data() -> Dict[str, Any]:
        """Spot ons fiyatları ve Türkiye Kapalıçarşı / Serbest Piyasa fiziki altın makasları"""
        try:
            gold_ticker = yf.Ticker("GC=F")
            usd_ticker = yf.Ticker("USDTRY=X")
            silver_ticker = yf.Ticker("SI=F")
            oil_ticker = yf.Ticker("BZ=F")

            gold_price = float(gold_ticker.history(period="5d")["Close"].iloc[-1])
            usd_try = float(usd_ticker.history(period="5d")["Close"].iloc[-1])
            silver_price = float(silver_ticker.history(period="5d")["Close"].iloc[-1])
            oil_price = float(oil_ticker.history(period="5d")["Close"].iloc[-1])
        except Exception:
            # Fallback varsayılan piyasa seviyeleri
            gold_price = 2650.0
            usd_try = 34.80
            silver_price = 31.50
            oil_price = 78.50

        # 1 Ons = 31.1034768 gram
        OUNCE_TO_GRAM = 31.1034768
        spot_gram_try = (gold_price * usd_try) / OUNCE_TO_GRAM
        spot_silver_try = (silver_price * usd_try) / OUNCE_TO_GRAM

        # Fiziki kuyumcu ve serbest piyasa alış/satış makasları (spread modellemesi)
        items: List[Dict[str, Any]] = [
            {
                "id": "gram_altin",
                "name": "Gram Altın (24 Ayar)",
                "weight_g": 1.0,
                "purity": 0.995,
                "buy_price": round(spot_gram_try * 1.012, 2),
                "sell_price": round(spot_gram_try * 1.025, 2),
                "currency": "TRY",
                "spread": round((spot_gram_try * 1.025) - (spot_gram_try * 1.012), 2),
                "spread_pct": 1.28,
            },
            {
                "id": "ceyrek_altin",
                "name": "Çeyrek Altın (Eski/Yeni)",
                "weight_g": 1.754,
                "purity": 0.916,
                "buy_price": round((spot_gram_try * 1.608) * 1.02, 2),
                "sell_price": round((spot_gram_try * 1.608) * 1.048, 2),
                "currency": "TRY",
                "spread": round(((spot_gram_try * 1.608) * 1.048) - ((spot_gram_try * 1.608) * 1.02), 2),
                "spread_pct": 2.74,
            },
            {
                "id": "yarim_altin",
                "name": "Yarım Ziynet Altın",
                "weight_g": 3.508,
                "purity": 0.916,
                "buy_price": round((spot_gram_try * 3.216) * 1.018, 2),
                "sell_price": round((spot_gram_try * 3.216) * 1.042, 2),
                "currency": "TRY",
                "spread": round(((spot_gram_try * 3.216) * 1.042) - ((spot_gram_try * 3.216) * 1.018), 2),
                "spread_pct": 2.36,
            },
            {
                "id": "tam_altin",
                "name": "Tam Ziynet Altın",
                "weight_g": 7.016,
                "purity": 0.916,
                "buy_price": round((spot_gram_try * 6.432) * 1.015, 2),
                "sell_price": round((spot_gram_try * 6.432) * 1.036, 2),
                "currency": "TRY",
                "spread": round(((spot_gram_try * 6.432) * 1.036) - ((spot_gram_try * 6.432) * 1.015), 2),
                "spread_pct": 2.07,
            },
            {
                "id": "ata_lira",
                "name": "Cumhuriyet / Ata Lira",
                "weight_g": 7.216,
                "purity": 0.916,
                "buy_price": round((spot_gram_try * 6.61) * 1.017, 2),
                "sell_price": round((spot_gram_try * 6.61) * 1.039, 2),
                "currency": "TRY",
                "spread": round(((spot_gram_try * 6.61) * 1.039) - ((spot_gram_try * 6.61) * 1.017), 2),
                "spread_pct": 2.16,
            },
            {
                "id": "bilezik_22",
                "name": "22 Ayar Bilezik (Gram)",
                "weight_g": 1.0,
                "purity": 0.916,
                "buy_price": round(spot_gram_try * 0.916 * 0.99, 2),
                "sell_price": round(spot_gram_try * 0.916 * 1.06, 2),
                "currency": "TRY",
                "spread": round((spot_gram_try * 0.916 * 1.06) - (spot_gram_try * 0.916 * 0.99), 2),
                "spread_pct": 7.07,
            },
            {
                "id": "gram_gumus",
                "name": "Gram Gümüş (999)",
                "weight_g": 1.0,
                "purity": 0.999,
                "buy_price": round(spot_silver_try * 0.96, 2),
                "sell_price": round(spot_silver_try * 1.05, 2),
                "currency": "TRY",
                "spread": round((spot_silver_try * 1.05) - (spot_silver_try * 0.96), 2),
                "spread_pct": 9.37,
            },
            {
                "id": "ons_altin",
                "name": "Ons Altın (XAU/USD)",
                "weight_g": 31.103,
                "purity": 1.0,
                "buy_price": round(gold_price, 2),
                "sell_price": round(gold_price * 1.0008, 2),
                "currency": "USD",
                "spread": round(gold_price * 0.0008, 2),
                "spread_pct": 0.08,
            },
            {
                "id": "brent_petrol",
                "name": "Brent Ham Petrol ($/V)",
                "weight_g": 0.0,
                "purity": 1.0,
                "buy_price": round(oil_price, 2),
                "sell_price": round(oil_price * 1.002, 2),
                "currency": "USD",
                "spread": round(oil_price * 0.002, 2),
                "spread_pct": 0.20,
            }
        ]

        return {
            "gold_ounce_usd": round(gold_price, 2),
            "usd_try": round(usd_try, 4),
            "spot_gram_gold_try": round(spot_gram_try, 2),
            "items": items,
        }
