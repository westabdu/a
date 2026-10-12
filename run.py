#!/usr/bin/env python3
"""
QuantStack Terminal - Tek Tıkla Başlatıcı (Single-Click Launcher)
Çalıştırmak için: python run.py
"""
import uvicorn
import os
import sys

def main():
    print("=" * 65)
    print(" 🚀 QuantStack Terminal: Kantitatif Finans & Stacking AI")
    print(" BIST | Kripto | ABD | Kıymetli Madenler | TEFAS")
    print("=" * 65)
    
    port = int(os.getenv("PORT", "8000"))
    print(f"[*] API Sunucusu Başlatılıyor: http://127.0.0.1:{port}")
    print("[*] API Docs (Swagger): http://127.0.0.1:{port}/docs")
    
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
