"""
QuantStack Terminal - FastAPI Backend Main Application
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import market, analysis, trading

app = FastAPI(
    title="QuantStack Terminal API",
    description="Kantitatif Finans, Stacking Ensemble AI, Risk Paritesi ve Backtest API",
    version="1.0.0"
)

# CORS Middleware (Frontend SPA erişimi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router'larını ekle
app.include_router(market.router)
app.include_router(analysis.router)
app.include_router(trading.router)

# Statik Dosyalar (Opsiyonel SPA sunumu)
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "QuantStack Terminal API", "version": "1.0.0"}
