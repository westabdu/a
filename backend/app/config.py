"""
QuantStack Terminal - Configuration & Asset Universe Settings
"""
import os
from typing import List, Dict

# Proje dizinleri
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "app", "data")
os.makedirs(DATA_DIR, exist_ok=True)
PAPER_TRADES_FILE = os.path.join(DATA_DIR, "paper_trades.json")

# Sunucu Ayarları
PORT = int(os.getenv("PORT", "8000"))
HOST = "0.0.0.0"

# İzlenen Çekirdek Varlık Evreni
CORE_ASSETS: Dict[str, Dict] = {
    "XU100.IS": {"name": "BIST 100 Endeksi", "category": "INDEX", "currency": "TRY"},
    "THYAO.IS": {"name": "Türk Hava Yolları", "category": "BIST", "currency": "TRY"},
    "ASELS.IS": {"name": "Aselsan", "category": "BIST", "currency": "TRY"},
    "EREGL.IS": {"name": "Ereğli Demir Çelik", "category": "BIST", "currency": "TRY"},
    "SISE.IS": {"name": "Şişecam", "category": "BIST", "currency": "TRY"},
    "TUPRS.IS": {"name": "Tüpraş", "category": "BIST", "currency": "TRY"},
    "GARAN.IS": {"name": "Garanti BBVA", "category": "BIST", "currency": "TRY"},
    "BIMAS.IS": {"name": "BİM Mağazalar", "category": "BIST", "currency": "TRY"},
    "KCHOL.IS": {"name": "Koç Holding", "category": "BIST", "currency": "TRY"},
    "AKBNK.IS": {"name": "Akbank", "category": "BIST", "currency": "TRY"},
    "FROTO.IS": {"name": "Ford Otosan", "category": "BIST", "currency": "TRY"},
    "AAPL": {"name": "Apple Inc.", "category": "US", "currency": "USD"},
    "MSFT": {"name": "Microsoft Corp.", "category": "US", "currency": "USD"},
    "NVDA": {"name": "NVIDIA Corp.", "category": "US", "currency": "USD"},
    "TSLA": {"name": "Tesla Inc.", "category": "US", "currency": "USD"},
    "BTC-USD": {"name": "Bitcoin / USD", "category": "CRYPTO", "currency": "USD"},
    "ETH-USD": {"name": "Ethereum / USD", "category": "CRYPTO", "currency": "USD"},
    "SOL-USD": {"name": "Solana / USD", "category": "CRYPTO", "currency": "USD"},
    "GC=F": {"name": "Ons Altın (XAU/USD)", "category": "COMMODITY", "currency": "USD"},
    "SI=F": {"name": "Ons Gümüş (XAG/USD)", "category": "COMMODITY", "currency": "USD"},
    "BZ=F": {"name": "Brent Ham Petrol", "category": "COMMODITY", "currency": "USD"},
    "USDTRY=X": {"name": "USD / TRY", "category": "FX", "currency": "TRY"},
    "EURTRY=X": {"name": "EUR / TRY", "category": "FX", "currency": "TRY"},
}

# Başlangıç Paper Trading Bakiyesi
DEFAULT_PAPER_BALANCE = 250000.0  # TRY
