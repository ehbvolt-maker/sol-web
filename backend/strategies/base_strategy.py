from abc import ABC, abstractmethod
from typing import Dict, Optional
import pandas as pd

class BaseStrategy(ABC):
    def __init__(self, name: str, symbols: list):
        self.name = name
        self.symbols = symbols
        self.positions = {} # Keep track of virtual positions

    @abstractmethod
    async def analyze(self, data: pd.DataFrame) -> Dict[str, str]:
        """
        Analyze the provided data and return a signal.
        Return dict format: {"symbol": "BUY"|"SELL"|"HOLD"}
        """
        pass

    @abstractmethod
    def generate_signals(self, market_data: Dict[str, pd.DataFrame]) -> Dict[str, dict]:
        """
        Main entry point for strategy execution.
        Receives a dictionary of DataFrames (one per symbol).
        Returns a dictionary of signals with metadata.
        Example:
        {
            "AAPL": {"action": "BUY", "confidence": 0.8, "price": 150.0}
        }
        """
        pass
