"""
QuantStack Terminal - 60+ Alpha Features & Indicator Engine
Calculates Momentum, Volatility, Bands, Trend & Regime, Volume, Lag Returns, and Multi-Timeframe factors.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class IndicatorEngine:
    @staticmethod
    def calculate_all_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Girdi: OHLCV DataFrame (Open, High, Low, Close, Volume)
        Çıktı: 60+ Alpha ve Rejim Özelliği eklenmiş DataFrame
        """
        df = df.copy()
        c = df["Close"]
        h = df["High"]
        l = df["Low"]
        o = df["Open"]
        v = df["Volume"]

        # 1. MOMENTUM ÖZELLİKLERİ
        # RSI 14
        delta = c.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / (loss + 1e-9)
        df["rsi_14"] = 100 - (100 / (1 + rs))
        df["rsi_lag1"] = df["rsi_14"].shift(1)
        df["rsi_lag3"] = df["rsi_14"].shift(3)
        df["rsi_delta"] = df["rsi_14"] - df["rsi_lag1"]
        df["rsi_7"] = 100 - (100 / (1 + ((delta.where(delta > 0, 0)).rolling(7).mean() / ((-delta.where(delta < 0, 0)).rolling(7).mean() + 1e-9))))
        df["rsi_21"] = 100 - (100 / (1 + ((delta.where(delta > 0, 0)).rolling(21).mean() / ((-delta.where(delta < 0, 0)).rolling(21).mean() + 1e-9))))

        # MACD
        ema12 = c.ewm(span=12, adjust=False).mean()
        ema26 = c.ewm(span=26, adjust=False).mean()
        df["macd_line"] = ema12 - ema26
        df["macd_signal"] = df["macd_line"].ewm(span=9, adjust=False).mean()
        df["macd_hist"] = df["macd_line"] - df["macd_signal"]
        df["macd_hist_slope"] = df["macd_hist"].diff()

        # Stokastik Osilatör
        low14 = l.rolling(14).min()
        high14 = h.rolling(14).max()
        df["stoch_k"] = 100 * ((c - low14) / (high14 - low14 + 1e-9))
        df["stoch_d"] = df["stoch_k"].rolling(3).mean()
        df["stoch_diff"] = df["stoch_k"] - df["stoch_d"]

        # Rate of Change (ROC)
        df["roc_3"] = c.pct_change(3) * 100
        df["roc_5"] = c.pct_change(5) * 100
        df["roc_10"] = c.pct_change(10) * 100
        df["roc_20"] = c.pct_change(20) * 100

        # Williams %R
        df["williams_r"] = -100 * ((high14 - c) / (high14 - low14 + 1e-9))

        # 2. VOLATİLİTE & BANTLAR
        sma20 = c.rolling(20).mean()
        std20 = c.rolling(20).std()
        df["bollinger_upper"] = sma20 + (2 * std20)
        df["bollinger_lower"] = sma20 - (2 * std20)
        df["bollinger_pct_b"] = (c - df["bollinger_lower"]) / (df["bollinger_upper"] - df["bollinger_lower"] + 1e-9)
        df["bollinger_bandwidth"] = (df["bollinger_upper"] - df["bollinger_lower"]) / (sma20 + 1e-9)
        df["bollinger_squeeze"] = np.where(df["bollinger_bandwidth"] < df["bollinger_bandwidth"].rolling(20).mean(), 1, 0)

        # Average True Range (ATR)
        tr1 = h - l
        tr2 = (h - c.shift()).abs()
        tr3 = (l - c.shift()).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        df["atr_14"] = tr.rolling(14).mean()
        df["atr_pct"] = (df["atr_14"] / c) * 100
        df["realized_vol_5d"] = c.pct_change().rolling(5).std() * np.sqrt(252) * 100
        df["realized_vol_10d"] = c.pct_change().rolling(10).std() * np.sqrt(252) * 100
        df["realized_vol_20d"] = c.pct_change().rolling(20).std() * np.sqrt(252) * 100

        # 3. TREND & REJİM (TESTERE/CHOP KORUMASI İÇİN)
        # Choppiness Index (CHOP)
        tr_sum_14 = tr.rolling(14).sum()
        max_h_14 = h.rolling(14).max()
        min_l_14 = l.rolling(14).min()
        df["choppiness_index"] = 100 * (np.log10(tr_sum_14 / (max_h_14 - min_l_14 + 1e-9)) / np.log10(14))

        # Directional Movement & ADX
        plus_dm = (h - h.shift()).clip(lower=0)
        minus_dm = (l.shift() - l).clip(lower=0)
        plus_dm = np.where(plus_dm > minus_dm, plus_dm, 0)
        minus_dm = np.where(minus_dm > plus_dm, minus_dm, 0)
        plus_di = 100 * (pd.Series(plus_dm).rolling(14).mean() / (df["atr_14"] + 1e-9))
        minus_di = 100 * (pd.Series(minus_dm).rolling(14).mean() / (df["atr_14"] + 1e-9))
        dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di + 1e-9))
        df["adx_14"] = dx.rolling(14).mean()
        df["plus_di"] = plus_di
        df["minus_di"] = minus_di

        # Moving Averages & Regimes
        df["ema_9"] = c.ewm(span=9, adjust=False).mean()
        df["ema_21"] = c.ewm(span=21, adjust=False).mean()
        df["ema_50"] = c.ewm(span=50, adjust=False).mean()
        df["ema_200"] = c.ewm(span=200, adjust=False).mean()
        df["price_to_ema9"] = c / (df["ema_9"] + 1e-9)
        df["price_to_ema21"] = c / (df["ema_21"] + 1e-9)
        df["price_to_ema50"] = c / (df["ema_50"] + 1e-9)
        df["price_to_ema200"] = c / (df["ema_200"] + 1e-9)
        df["ema9_ema21_cross"] = np.where(df["ema_9"] > df["ema_21"], 1, -1)
        df["golden_cross"] = np.where(df["ema_50"] > df["ema_200"], 1, -1)

        # 4. HACİM ANALİZİ
        vol_sma20 = v.rolling(20).mean()
        df["volume_ratio"] = v / (vol_sma20 + 1e-9)
        df["volume_trend_5d"] = v.rolling(5).mean() / (v.rolling(20).mean() + 1e-9)
        
        # On-Balance Volume (OBV)
        obv = [0]
        for i in range(1, len(df)):
            if c.iloc[i] > c.iloc[i - 1]:
                obv.append(obv[-1] + v.iloc[i])
            elif c.iloc[i] < c.iloc[i - 1]:
                obv.append(obv[-1] - v.iloc[i])
            else:
                obv.append(obv[-1])
        df["obv"] = obv
        df["obv_ema20"] = df["obv"].ewm(span=20).mean()
        df["obv_oscillator"] = (df["obv"] - df["obv_ema20"]) / (df["obv_ema20"].abs() + 1e-9)

        # Money Flow Index (MFI)
        typical_price = (h + l + c) / 3
        raw_money_flow = typical_price * v
        pos_flow = raw_money_flow.where(typical_price > typical_price.shift(), 0).rolling(14).sum()
        neg_flow = raw_money_flow.where(typical_price < typical_price.shift(), 0).rolling(14).sum()
        df["mfi_14"] = 100 - (100 / (1 + (pos_flow / (neg_flow + 1e-9))))

        # 5. GECİKMELİ GETİRİLER & İSTATİSTİKLER (LAG RETURNS)
        df["ret_1d"] = c.pct_change(1)
        df["ret_3d"] = c.pct_change(3)
        df["ret_5d"] = c.pct_change(5)
        df["ret_10d"] = c.pct_change(10)
        df["ret_20d"] = c.pct_change(20)
        df["ret_lag1"] = df["ret_1d"].shift(1)
        df["ret_lag2"] = df["ret_1d"].shift(2)
        df["ret_lag3"] = df["ret_1d"].shift(3)
        df["ret_skew_20d"] = df["ret_1d"].rolling(20).skew()
        df["ret_kurt_20d"] = df["ret_1d"].rolling(20).kurt()

        # 6. MULTI-TIMEFRAME (HAFTALIK TEYİT FAKTÖRLERİ)
        # 5 günlük smoothing ile yaklaşık haftalık trend & RSI
        df["weekly_rsi_smoothed"] = df["rsi_14"].rolling(5).mean()
        df["weekly_trend_confirm"] = np.where((df["ema_9"] > df["ema_21"]) & (c > df["ema_50"]), 1, 0)
        df["regime_sideways_flag"] = np.where((df["choppiness_index"] > 61.8) | (df["adx_14"] < 20.0), 1, 0)

        # NaN değerleri temizle
        df = df.bfill().ffill()
        return df
