"""
QuantStack Terminal - Paper Trading API Router
"""
from fastapi import APIRouter, Body
from typing import Dict, Any
from ..engines.paper_trading import PaperTradingEngine

router = APIRouter(prefix="/api/trading", tags=["Paper Trading"])

@router.get("/portfolio")
def get_portfolio():
    return PaperTradingEngine.load_data()

@router.post("/order")
def execute_order(payload: Dict[str, Any] = Body(...)):
    symbol = payload.get("symbol", "THYAO.IS")
    side = payload.get("side", "BUY")
    qty = float(payload.get("qty", 10))
    price = float(payload.get("price", 300.0))
    sl = payload.get("stop_loss")
    tp = payload.get("take_profit")
    return PaperTradingEngine.execute_order(
        symbol=symbol,
        side=side,
        qty=qty,
        price=price,
        stop_loss=float(sl) if sl else None,
        take_profit=float(tp) if tp else None,
    )

@router.post("/close")
def close_position(payload: Dict[str, Any] = Body(...)):
    pos_id = payload.get("position_id")
    price = float(payload.get("current_price", 300.0))
    return PaperTradingEngine.close_position(pos_id=pos_id, current_price=price)

@router.post("/reset")
def reset_portfolio():
    return PaperTradingEngine.reset_account()
