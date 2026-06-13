import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { TableSelectionScreen } from "./components/TableSelectionScreen";
import { OrderScreen } from "./components/OrderScreen";
import { CheckoutOverlay } from "./components/CheckoutOverlay";
import { KitchenDisplay } from "./components/KitchenDisplay";
import { OrdersLedger } from "./components/OrdersLedger";

type Screen = "login" | "table-select" | "order" | "kds" | "ledger";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSubtotal, setCheckoutSubtotal] = useState(0);

  const handleLogin = () => {
    setScreen("table-select");
    setShowTableModal(true);
  };

  const handleSelectTable = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setShowTableModal(false);
    setScreen("order");
  };

  const handleBackToTables = () => {
    setShowTableModal(true);
  };

  const handleOpenCheckout = (subtotal: number) => {
    setCheckoutSubtotal(subtotal);
    setShowCheckout(true);
  };

  const handleConfirmPayment = () => {
    setShowCheckout(false);
    setShowTableModal(true);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      {screen === "login" && <LoginScreen onLogin={handleLogin} />}

      {screen === "table-select" && (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: "url('https://images.unsplash.com/photo-1710509716466-afc0747663c7?w=1440&h=900&fit=crop&auto=format') center/cover",
          }}
        >
          <TableSelectionScreen
            onSelectTable={handleSelectTable}
            onClose={() => setScreen("login")}
          />
        </div>
      )}

      {screen === "order" && selectedTable !== null && (
        <>
          <OrderScreen
            tableNumber={selectedTable}
            onBack={handleBackToTables}
            onCheckout={handleOpenCheckout}
            onOpenKDS={() => setScreen("kds")}
            onOpenLedger={() => setScreen("ledger")}
          />
          {showTableModal && (
            <TableSelectionScreen
              onSelectTable={handleSelectTable}
              onClose={() => setShowTableModal(false)}
            />
          )}
          {showCheckout && (
            <CheckoutOverlay
              tableNumber={selectedTable}
              subtotal={checkoutSubtotal}
              onClose={() => setShowCheckout(false)}
              onConfirm={handleConfirmPayment}
            />
          )}
        </>
      )}

      {screen === "kds" && (
        <KitchenDisplay onBack={() => setScreen("order")} />
      )}

      {screen === "ledger" && (
        <OrdersLedger onBack={() => setScreen("order")} />
      )}
    </div>
  );
}
