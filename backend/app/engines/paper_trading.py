"""
QuantStack Terminal - Paper Trading Engine with Local JSON Persistence
"""
import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List
from ..config import PAPER_TRADES_FILE, DEFAULT_PAPER_BALANCE

class PaperTradingEngine:
    @staticmethod
    def load_data() -> Dict[str, Any]:
        if not os.path.exists(PAPER_TRADES_FILE):
            default_data = {
                "balance": DEFAULT_PAPER_BALANCE,
                "initial_balance": DEFAULT_PAPER_BALANCE,
                "positions": [],
                "history": [],
                "updated_at": datetime.now().isoformat(),
            }
            PaperTradingEngine.save_data(default_data)
            return default_data
        
        try:
            with open(PAPER_TRADES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {
                "balance": DEFAULT_PAPER_BALANCE,
                "initial_balance": DEFAULT_PAPER_BALANCE,
                "positions": [],
                "history": [],
                "updated_at": datetime.now().isoformat(),
            }

    @staticmethod
    def save_data(data: Dict[str, Any]) -> None:
        os.makedirs(os.path.dirname(PAPER_TRADES_FILE), exist_ok=True)
        with open(PAPER_TRADES_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @staticmethod
    def execute_order(
        symbol: str,
        side: str, # "BUY" | "SELL"
        qty: float,
        price: float,
        stop_loss: float = None,
        take_profit: float = None
    ) -> Dict[str, Any]:
        data = PaperTradingEngine.load_data()
        cost = qty * price

        if side == "BUY":
            if data["balance"] < cost:
                return {"error": "Yetersiz bakiye", "balance": data["balance"]}
            
            data["balance"] -= cost
            position = {
                "id": str(uuid.uuid4())[:8],
                "symbol": symbol,
                "qty": qty,
                "entry_price": price,
                "current_price": price,
                "stop_loss": stop_loss,
                "take_profit": take_profit,
                "opened_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            }
            data["positions"].append(position)
        elif side == "SELL":
            # Pozisyon kontrolü
            pos_match = next((p for p in data["positions"] if p["symbol"] == symbol), None)
            if not pos_match or pos_match["qty"] < qty:
                return {"error": "Satılacak pozisyon bulunamadı veya miktar yetersiz"}
            
            revenue = qty * price
            pnl = revenue - (qty * pos_match["entry_price"])
            pnl_pct = ((price - pos_match["entry_price"]) / pos_match["entry_price"]) * 100.0
            data["balance"] += revenue

            if pos_match["qty"] == qty:
                data["positions"].remove(pos_match)
            else:
                pos_match["qty"] -= qty

            trade_record = {
                "id": str(uuid.uuid4())[:8],
                "symbol": symbol,
                "side": "SELL",
                "qty": qty,
                "entry_price": pos_match["entry_price"],
                "exit_price": price,
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
                "closed_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            }
            data["history"].insert(0, trade_record)

        data["updated_at"] = datetime.now().isoformat()
        PaperTradingEngine.save_data(data)
        return {"success": True, "data": data}

    @staticmethod
    def close_position(pos_id: str, current_price: float) -> Dict[str, Any]:
        data = PaperTradingEngine.load_data()
        pos = next((p for p in data["positions"] if p["id"] == pos_id), None)
        if not pos:
            return {"error": "Pozisyon bulunamadı"}
        
        revenue = pos["qty"] * current_price
        pnl = revenue - (pos["qty"] * pos["entry_price"])
        pnl_pct = ((current_price - pos["entry_price"]) / pos["entry_price"]) * 100.0
        data["balance"] += revenue
        data["positions"].remove(pos)

        data["history"].insert(0, {
            "id": pos["id"],
            "symbol": pos["symbol"],
            "side": "CLOSE",
            "qty": pos["qty"],
            "entry_price": pos["entry_price"],
            "exit_price": current_price,
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2),
            "closed_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        })

        data["updated_at"] = datetime.now().isoformat()
        PaperTradingEngine.save_data(data)
        return {"success": True, "data": data}

    @staticmethod
    def reset_account() -> Dict[str, Any]:
        data = {
            "balance": DEFAULT_PAPER_BALANCE,
            "initial_balance": DEFAULT_PAPER_BALANCE,
            "positions": [],
            "history": [],
            "updated_at": datetime.now().isoformat(),
        }
        PaperTradingEngine.save_data(data)
        return data
