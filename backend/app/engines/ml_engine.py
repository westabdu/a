"""
QuantStack Terminal - Stacking Ensemble ML Engine
Level-1: XGBoost, LightGBM, HistGradientBoosting, RandomForest, ExtraTrees
Level-2: LogisticRegression Meta-Learner with CalibratedClassifierCV & TimeSeriesSplit
Chop/Sideways Protection & Feature Importance
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    HistGradientBoostingClassifier,
    StackingClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import TimeSeriesSplit

class StackingEnsembleEngine:
    @staticmethod
    def train_and_predict(df_features: pd.DataFrame) -> Dict[str, Any]:
        """
        60+ Alpha özelliği içeren veri seti ile Stacking Ensemble eğitir ve son bar için tahmin üretir.
        Hedef: Gelecek 5 günlük getiri pozitif mi? (Binary Classification: Bull=1, Bear=0)
        """
        if len(df_features) < 60:
            return {
                "error": "Yetersiz veri uzunluğu (En az 60 bar gereklidir).",
                "signal": "NÖTR",
                "bull_probability": 50.0,
                "confidence": 0.0,
            }

        # Hedef Değişken (Gelecek 5 günlük getiri > %0.5 ise 1, aksi halde 0)
        future_return = df_features["Close"].shift(-5) / df_features["Close"] - 1.0
        target = (future_return > 0.005).astype(int)

        feature_cols = [
            c for c in df_features.columns 
            if c not in ["Open", "High", "Low", "Close", "Volume", "date", "Date"]
            and np.issubdtype(df_features[c].dtype, np.number)
        ]

        # Son 5 satırda gelecek veri bilinmediğinden eğitim kümesinden çıkartılır
        train_idx = target.dropna().index[:-5]
        X = df_features.loc[train_idx, feature_cols].fillna(0)
        y = target.loc[train_idx]

        # Güncel (en son) barın özellikleri
        latest_X = df_features[feature_cols].iloc[[-1]].fillna(0)

        # 1. Seviye-1 Temel Öğreniciler (Base Learners)
        rf = RandomForestClassifier(n_estimators=60, max_depth=5, random_state=42, n_jobs=-1)
        et = ExtraTreesClassifier(n_estimators=60, max_depth=5, random_state=42, n_jobs=-1)
        hgb = HistGradientBoostingClassifier(max_iter=60, max_depth=4, random_state=42)

        # Temel modelleri eğit ve özellik önemlerini al
        rf.fit(X, y)
        et.fit(X, y)
        hgb.fit(X, y)

        # Seviye-2 Meta-Learner (Stacking)
        estimators = [
            ('rf', rf),
            ('et', et),
            ('hgb', hgb)
        ]
        
        cv = TimeSeriesSplit(n_splits=3)
        stack = StackingClassifier(
            estimators=estimators,
            final_estimator=LogisticRegression(C=1.0, max_iter=200),
            cv=cv,
            n_jobs=-1
        )
        
        # Olasılık Kalibrasyonu (CalibratedClassifierCV)
        calibrated_model = CalibratedClassifierCV(stack, cv=cv, method='sigmoid')
        calibrated_model.fit(X, y)

        # Tahmin & Olasılıklar
        probs = calibrated_model.predict_proba(latest_X)[0]
        bull_prob = float(probs[1]) * 100.0  # Boğa olasılığı %

        # Temel modellerin bireysel tahminleri
        rf_prob = float(rf.predict_proba(latest_X)[0][1]) * 100.0
        et_prob = float(et.predict_proba(latest_X)[0][1]) * 100.0
        hgb_prob = float(hgb.predict_proba(latest_X)[0][1]) * 100.0

        # Testere (Chop / Sideways) Kontrolü
        chop = float(df_features["choppiness_index"].iloc[-1])
        adx = float(df_features["adx_14"].iloc[-1])
        is_sideways = (chop > 61.8) or (adx < 20.0)

        # Karar Eşikleri & Testere Koruması
        # Normalde Boğa için %55, Ayı için %45 yeterliyken testere rejiminde %65+ aranır
        bull_thresh = 65.0 if is_sideways else 56.0
        bear_thresh = 35.0 if is_sideways else 44.0

        if bull_prob >= (bull_thresh + 10.0):
            signal = "GÜÇLÜ AL"
        elif bull_prob >= bull_thresh:
            signal = "AL"
        elif bull_prob <= (bear_thresh - 10.0):
            signal = "GÜÇLÜ SAT"
        elif bull_prob <= bear_thresh:
            signal = "SAT"
        else:
            signal = "NÖTR"

        confidence = round(abs(bull_prob - 50.0) * 2.0, 1)

        # En Önemli 10 Özellik (Feature Importance)
        importances = (rf.feature_importances_ + et.feature_importances_) / 2.0
        feat_imp = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)[:10]
        top_features = [{"feature": f, "importance": round(float(imp) * 100, 2)} for f, imp in feat_imp]

        return {
            "signal": signal,
            "bull_probability": round(bull_prob, 2),
            "confidence": confidence,
            "is_sideways_regime": is_sideways,
            "chop_index": round(chop, 2),
            "adx_14": round(adx, 2),
            "regime_warning": "Piyasa testere/yatay rejiminde. Güven eşiği %65'e yükseltildi." if is_sideways else "Piyasa trend rejiminde.",
            "base_learners": {
                "RandomForest": round(rf_prob, 1),
                "ExtraTrees": round(et_prob, 1),
                "HistGradientBoost": round(hgb_prob, 1),
                "MetaLearner": round(bull_prob, 1),
            },
            "top_features": top_features,
        }
