"""
QuantStack Terminal - Multi-Asset Risk Parity & Equal Risk Contribution (ERC) Engine
Calculates Covariance Matrix, Correlation Heatmap, Equal Risk Contribution weights via Scipy SLSQP.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from scipy.optimize import minimize

class RiskParityEngine:
    @staticmethod
    def calculate_erc_portfolio(returns_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Equal Risk Contribution (ERC / Risk Parity) optimizasyonu.
        Her bir varlığın toplam portföy riskine katkısını eşitler:
        RC_i = w_i * (Sigma * w)_i / sigma_p = sigma_p / N
        """
        assets = list(returns_df.columns)
        n = len(assets)
        if n < 2:
            return {"error": "En az 2 varlık gereklidir"}

        # Kovaryans ve Korelasyon Matrisi
        cov_matrix = returns_df.cov().values * 252.0  # Yıllıklandırılmış
        corr_matrix = returns_df.corr().values

        # Amaç Fonksiyonu: Risk katkıları farkının kareler toplamı
        def objective(w):
            w = np.array(w)
            port_var = np.dot(w.T, np.dot(cov_matrix, w))
            port_vol = np.sqrt(port_var + 1e-9)
            marginal_contrib = np.dot(cov_matrix, w) / port_vol
            risk_contrib = w * marginal_contrib
            target_risk = port_vol / n
            return np.sum((risk_contrib - target_risk) ** 2)

        # Kısıtlar & Sınırlar
        # sum(w) = 1.0, 0 <= w_i <= 1.0
        cons = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
        bounds = tuple((0.01, 0.90) for _ in range(n))
        init_w = np.repeat(1.0 / n, n)

        res = minimize(objective, init_w, method='SLSQP', bounds=bounds, constraints=cons)
        erc_weights = res.x if res.success else init_w

        # Portföy Karşılaştırmaları:
        # 1. ERC Portföyü
        erc_vol = float(np.sqrt(np.dot(erc_weights.T, np.dot(cov_matrix, erc_weights)))) * 100.0
        
        # 2. Eşit Ağırlıklı (1/N)
        eq_weights = init_w
        eq_vol = float(np.sqrt(np.dot(eq_weights.T, np.dot(cov_matrix, eq_weights)))) * 100.0

        # 3. Minimum Varyans Portföyü
        def min_var_obj(w):
            return np.dot(w.T, np.dot(cov_matrix, w))
        min_res = minimize(min_var_obj, init_w, method='SLSQP', bounds=bounds, constraints=cons)
        mv_weights = min_res.x if min_res.success else init_w
        mv_vol = float(np.sqrt(np.dot(mv_weights.T, np.dot(cov_matrix, mv_weights)))) * 100.0

        # Varlık Bazında Dağılım
        allocations = []
        for i, a in enumerate(assets):
            allocations.append({
                "asset": a,
                "erc_weight": round(float(erc_weights[i]) * 100.0, 2),
                "equal_weight": round(float(eq_weights[i]) * 100.0, 2),
                "min_var_weight": round(float(mv_weights[i]) * 100.0, 2),
                "asset_volatility": round(float(np.sqrt(cov_matrix[i, i])) * 100.0, 2),
            })

        # Korelasyon Matrisi JSON formatı
        correlation_data = {
            "assets": assets,
            "matrix": [[round(float(val), 3) for val in row] for row in corr_matrix]
        }

        return {
            "assets": assets,
            "allocations": allocations,
            "erc_portfolio_volatility": round(erc_vol, 2),
            "equal_weight_volatility": round(eq_vol, 2),
            "min_var_volatility": round(mv_vol, 2),
            "correlation": correlation_data,
        }
