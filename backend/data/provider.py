from abc import ABC, abstractmethod
import pandas as pd
from typing import Optional, List, Dict

class DataProvider(ABC):
    """
    Abstract base class for market data providers.
    """
    
    @abstractmethod
    def get_historical_data(self, symbol: str, start_date: str, end_date: str, interval: str = "1d") -> pd.DataFrame:
        """
        Fetch historical bars for a symbol.
        Returns a DataFrame with index as datetime and columns: Open, High, Low, Close, Volume.
        """
        pass
    
    @abstractmethod
    def get_latest_price(self, symbol: str) -> float:
        """
        Fetch the latest traded price for a symbol.
        """
        pass
    
    @abstractmethod
    def get_account_info(self) -> Dict:
        """
        Fetch account information (buying power, equity, etc.)
        """
        pass
