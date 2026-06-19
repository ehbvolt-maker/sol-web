from typing import Dict, Optional
from backend.core.logging import logger

class OMS:
    """
    Order Management System.
    Responsible for risk checks and routing orders to the broker.
    """
    def __init__(self, broker_client):
        self.broker = broker_client
        self.max_order_size = 10000  # Example risk limit in USD
        self.max_position_size = 50000

    async def submit_order(self, symbol: str, side: str, qty: int, order_type: str = "market", time_in_force: str = "gtc") -> Dict:
        """
        Submit an order to the broker after risk checks.
        """
        # 1. Fetch current price for risk calculation
        price = self.broker.get_latest_price(symbol)
        if price <= 0:
            logger.error(f"Invalid price for {symbol}, aborting order.")
            return {"status": "rejected", "reason": "invalid_price"}

        notional_value = price * qty

        # 2. Risk Checks
        if notional_value > self.max_order_size:
            logger.warning(f"Order rejected: Notional {notional_value} > Max {self.max_order_size}")
            return {"status": "rejected", "reason": "risk_limit_exceeded"}

        # 3. Submit to Broker
        try:
            # Note: This checks if broker supports direct submit_order, 
            # In our provider interface we didn't add it yet, we need to access the raw api or add it.
            # Using raw api for now or we will add a wrapper in Provider.
            if hasattr(self.broker, 'api'):
                order = self.broker.api.submit_order(
                    symbol=symbol,
                    qty=qty,
                    side=side.lower(),
                    type=order_type,
                    time_in_force=time_in_force
                )
                logger.info(f"Order submitted: {side} {qty} {symbol}")
                return {"status": "accepted", "order_id": str(order.id)}
            else:
                return {"status": "error", "reason": "broker_not_connected"}
        except Exception as e:
            logger.error(f"Order submission failed: {e}")
            return {"status": "error", "reason": str(e)}

    def cancel_all_orders(self):
        try:
            if hasattr(self.broker, 'api'):
                self.broker.api.cancel_all_orders()
                logger.info("All open orders canceled.")
        except Exception as e:
            logger.error(f"Failed to cancel orders: {e}")
