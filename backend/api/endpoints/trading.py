from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.data.alpaca import AlpacaProvider
from backend.data.mock import MockProvider
from backend.strategies.sma_strategy import SMAStrategy
from backend.execution.oms import OMS
from datetime import datetime, timedelta
import asyncio

router = APIRouter()

# Global instances
# Forcing MockProvider for Demo since default keys are invalid
import logging
logging.getLogger("Init").warning("Using MockProvider for Demo Mode.")
provider = MockProvider()

oms = OMS(provider)
active_strategies = {}

# Major symbols to trade automatically (Stocks + Crypto)
AUTO_SYMBOLS = ["BTC/USD", "ETH/USD", "AAPL", "NVDA", "TSLA"]

@router.on_event("startup")
async def startup_event():
    import logging
    logger = logging.getLogger("SystemStartup")
    logger.info("Initializing Autonomous Trading Mode...")
    # We can't use BackgroundTasks here directly easily without a loop, 
    # so we'll start them as tasks on the event loop.
    for symbol in AUTO_SYMBOLS:
        if symbol not in active_strategies:
            strat = SMAStrategy(name=f"SMA-{symbol}", symbols=[symbol])
            active_strategies[symbol] = {"strategy": strat, "running": True}
            asyncio.create_task(strategy_loop(symbol))
            logger.info(f"Auto-started strategy for {symbol}")

@router.get("/status")
async def get_system_status():
    return {"status": "active", "strategies": list(active_strategies.keys())}

@router.get("/account")
async def get_account():
    return provider.get_account_info()

@router.post("/start-strategy/{symbol}")
async def start_strategy(symbol: str, background_tasks: BackgroundTasks):
    if symbol in active_strategies:
        return {"message": f"Strategy for {symbol} already running"}
    
    # Initialize strategy
    strat = SMAStrategy(name=f"SMA-{symbol}", symbols=[symbol])
    active_strategies[symbol] = {"strategy": strat, "running": True}
    
    # Start loop (mocked background task for now)
    background_tasks.add_task(strategy_loop, symbol)
    
    return {"message": f"Started strategy for {symbol}"}

@router.post("/stop-strategy/{symbol}")
async def stop_strategy(symbol: str):
    if symbol in active_strategies:
        active_strategies[symbol]["running"] = False
        del active_strategies[symbol]
        return {"message": f"Stopped strategy for {symbol}"}
    raise HTTPException(status_code=404, detail="Strategy not found")

async def strategy_loop(symbol: str):
    """
    Very basic polling loop.
    """
    import logging
    logger = logging.getLogger("StrategyLoop")
    logger.info(f"Starting loop for {symbol}")
    
    # We retrieve the object from global dict (using a safer way in prod)
    strat_info = active_strategies.get(symbol)
    if not strat_info: 
        return

    while strat_info.get("running"):
        try:
            # 1. Get Dynamic Data (Last 60 days to ensure enough history for 30-day MA)
            now = datetime.now()
            start_date = (now - timedelta(days=60)).strftime("%Y-%m-%d")
            end_date = now.strftime("%Y-%m-%d")
            
            # Fetch daily bars for robust signal (or 1h/15m if preferred)
            data = provider.get_historical_data(symbol, start_date=start_date, end_date=end_date, interval="1d") 
            
            if not data.empty:
                # 2. Analyze
                analysis = await strat_info["strategy"].analyze(data)
                
                # 3. Act
                if analysis["action"] in ["BUY", "SELL"]:
                    # Check if we already have a position to avoid spamming (simple check)
                    # For a pro agent, we'd check 'provider.get_position(symbol)'
                    # Here we just execute. OMS handles risk limits.
                    await oms.submit_order(symbol, analysis["action"], qty=1)
            
            # Wait for next poll (e.g., 5 minutes in production, 15 seconds for demo)
            await asyncio.sleep(15) 
        except Exception as e:
            logger.error(f"Error in loop {symbol}: {e}")
            await asyncio.sleep(60)
