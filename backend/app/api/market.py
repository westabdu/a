"""
QuantStack Terminal - Market Data API Router
"""
from fastapi import APIRouter, Query
from ..services.market_data import MarketDataService
from ..services.gold_service import GoldCommodityService
from ..services.tefas_service import TefasService
from ..services.events_service import EventsService

router = APIRouter(prefix="/api/market", tags=["Market"])

@router.get("/ribbon")
def get_ribbon():
    """Canlı Ticker Şeridi"""
    return MarketDataService.get_ticker_ribbon()

@router.get("/symbol")
def get_symbol(symbol: str = Query("THYAO.IS"), period: str = Query("1y")):
    """Sembol OHLCV ve Temel Analiz verisi"""
    return MarketDataService.get_symbol_details(symbol=symbol, period=period)

@router.get("/gold-commodities")
def get_gold_commodities():
    """Spot & Fiziki Altın/Gümüş ve Emtialar"""
    return GoldCommodityService.get_precious_metals_data()

@router.get("/tefas")
def get_tefas():
    """TEFAS Fon Takipçisi"""
    return TefasService.get_curated_funds()

@router.get("/events")
def get_events():
    """Bilanço, Temettü ve Makroekonomik Takvim Olayları"""
    return EventsService.get_upcoming_events()
