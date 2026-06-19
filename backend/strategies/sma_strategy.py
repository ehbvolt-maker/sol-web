import pandas as pd
from backend.strategies.base_strategy import BaseStrategy
from backend.strategies.indicators import calculate_sma
from backend.core.logging import logger

class SMAStrategy(BaseStrategy):
    def __init__(self, name: str, symbols: list, short_window: int = 10, long_window: int = 30):
        super().__init__(name, symbols)
        self.short_window = short_window
        self.long_window = long_window

    async def analyze(self, data: pd.DataFrame) -> dict:
        """
        Analyze a single symbol's data frame.
        """
        if data.empty:
            return {"action": "HOLD"}
        
        # Ensure we have enough data
        if len(data) < self.long_window:
            return {"action": "HOLD"}

        closes = data['Close']
        short_sma = calculate_sma(closes, self.short_window)
        long_sma = calculate_sma(closes, self.long_window)
        
        # Get last valid values
        curr_short = short_sma.iloc[-1]
        curr_long = long_sma.iloc[-1]
        prev_short = short_sma.iloc[-2]
        prev_long = long_sma.iloc[-2]
        
        current_price = closes.iloc[-1]
        
        signal = "HOLD"
        # Golden Cross (Short crosses above Long)
        if prev_short <= prev_long and curr_short > curr_long:
            signal = "BUY"
            logger.info(f"{self.name} generated BUY signal at {current_price}")

        # Death Cross (Short crosses below Long)
        elif prev_short >= prev_long and curr_short < curr_long:
            signal = "SELL"
            logger.info(f"{self.name} generated SELL signal at {current_price}")
            
        return {
            "action": signal,
            "price": float(current_price),
            "short_sma": float(curr_short),
            "long_sma": float(curr_long)
        }

    def generate_signals(self, market_data: dict) -> dict:
        signals = {}
        # This is sync wrapper if needed, but analyze is async to allow potential I/O
        # For simplicity in MVP, we might treat analyze as sync or await it in a loop
        pass
