from backend.data.provider import DataProvider
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class MockProvider(DataProvider):
    """
    Generates realistic looking fake market data for demo purposes
    when valid API keys are not provided.
    """
    def get_historical_data(self, symbol: str, start_date: str, end_date: str, interval: str = "1d") -> pd.DataFrame:
        # Generate date range
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Random walk generation
        base_price = 100.0 if "BTC" not in symbol else 50000.0
        if "ETH" in symbol: base_price = 3000.0
        
        prices = [base_price]
        for _ in range(len(dates)-1):
            change = prices[-1] * (random.uniform(-0.02, 0.02)) # +/- 2% daily move
            prices.append(prices[-1] + change)
            
        df = pd.DataFrame(index=dates, data={
            "Open": prices,
            "High": [p * 1.01 for p in prices],
            "Low": [p * 0.99 for p in prices],
            "Close": prices,
            "Volume": [random.randint(1000, 1000000) for _ in prices]
        })
        return df

    def get_latest_price(self, symbol: str) -> float:
        base = 50000.0 if "BTC" in symbol else 150.0
        return base * random.uniform(0.95, 1.05)
    
    def get_account_info(self) -> dict:
        return {
            "equity": 100000.0,
            "buying_power": 400000.0,
            "cash": 100000.0,
            "status": "ACTIVE (MOCK)"
        }
