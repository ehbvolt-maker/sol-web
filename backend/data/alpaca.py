from backend.data.provider import DataProvider
from backend.core.config import settings
from backend.core.logging import logger
import alpaca_trade_api as tradeapi
import pandas as pd
from typing import Dict
from datetime import datetime, timedelta

class AlpacaProvider(DataProvider):
    def __init__(self):
        try:
            self.api = tradeapi.REST(
                settings.ALPACA_API_KEY,
                settings.ALPACA_SECRET_KEY,
                settings.ALPACA_BASE_URL,
                api_version='v2'
            )
            logger.info("Alpaca API connection initialized.")
        except Exception as e:
            logger.error(f"Failed to connect to Alpaca: {e}")
            raise

    def get_historical_data(self, symbol: str, start_date: str, end_date: str, interval: str = "1Day") -> pd.DataFrame:
        """
        Fetches historical data from Alpaca. Handles both Stocks and Crypto.
        """
        timeframe_map = {
            "1d": "1Day",
            "1h": "1Hour",
            "1m": "1Min"
        }
        tf = timeframe_map.get(interval, "1Day")
        
        try:
            # Check if it's a crypto pair (contains '/')
            if "/" in symbol:
                # Alpaca Crypto logic
                bars = self.api.get_crypto_bars(
                    symbol,
                    tf,
                    start=start_date,
                    end=end_date,
                ).df
            else:
                # Stock logic
                bars = self.api.get_bars(
                    symbol,
                    tf,
                    start=start_date,
                    end=end_date,
                    adjustment='raw'
                ).df
            
            if bars.empty:
                logger.warning(f"No data found for {symbol}")
                return pd.DataFrame()

            # Normalize columns
            # Alpaca V2 often returns index as timestamp. 
            # If MultiIndex (symbol, timestamp), we might need to reset.
            if isinstance(bars.index, pd.MultiIndex):
                bars = bars.reset_index(level=0, drop=True)
                
            # Expected cols: open, high, low, close, volume. Capitalize for consistency.
            bars.columns = [c.capitalize() for c in bars.columns]
            return bars
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return pd.DataFrame()

    def get_latest_price(self, symbol: str) -> float:
        try:
            trade = self.api.get_latest_trade(symbol)
            return float(trade.price)
        except Exception as e:
            logger.error(f"Error fetching latest price for {symbol}: {e}")
            return 0.0

    def get_account_info(self) -> Dict:
        try:
            account = self.api.get_account()
            return {
                "equity": float(account.equity),
                "buying_power": float(account.buying_power),
                "cash": float(account.cash),
                "status": account.status
            }
        except Exception as e:
            logger.error(f"Error fetching account info: {e}")
            return {}
