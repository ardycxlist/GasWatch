import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function App() {
  const [gasData, setGasData] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);

  const fetchGasData = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
      const feeData = await provider.getFeeData();

      // fetch ETH price from CoinGecko
      const priceRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const priceJson = await priceRes.json();
      const price = priceJson?.ethereum?.usd || null;
      setEthPrice(price);

      const baseFee = parseFloat(ethers.utils.formatUnits(feeData.gasPrice || 0, "gwei"));
      const priorityFee = parseFloat(
        ethers.utils.formatUnits(feeData.maxPriorityFeePerGas || 0, "gwei")
      );

      const usdEstimate = price ? ((baseFee + priorityFee) * 21000 * price) / 1e9 : null;

      setGasData({
        baseFee: isNaN(baseFee) ? null : baseFee.toFixed(2),
        priorityFee: isNaN(priorityFee) ? null : priorityFee.toFixed(2),
        usdEstimate: usdEstimate ? usdEstimate.toFixed(4) : null,
      });
    } catch (err) {
      console.error("fetchGasData error:", err);
    }
  };

  useEffect(() => {
    fetchGasData();
    const interval = setInterval(fetchGasData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#ffffff",
      color: "#111827",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }}>
      <div style={{
        maxWidth: 420,
        width: "100%",
        borderRadius: 16,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        padding: 24,
        backgroundColor: "#ffffff",
        textAlign: "center",
        border: "1px solid #e6e9ee"
      }}>
        <img src="/icon.png" alt="GasWatch" style={{width:64, height:64, marginBottom:12}} />
        <h1 style={{margin:0, fontSize:22}}>GasWatch</h1>
        <p style={{marginTop:6, marginBottom:18, color:"#6b7280"}}>Track real-time gas price and transaction cost on Base network</p>

        {gasData ? (
          <div style={{fontSize:16, lineHeight:1.8}}>
            <div>💨 <strong>Base Fee:</strong> {gasData.baseFee} Gwei</div>
            <div>⚡ <strong>Priority Fee:</strong> {gasData.priorityFee} Gwei</div>
            <div>💰 <strong>Estimated Tx Cost:</strong> {gasData.usdEstimate ? `$${gasData.usdEstimate} USD` : "—"}</div>
            <div style={{marginTop:8, fontSize:12, color:"#9ca3af"}}>ETH Price: {ethPrice ? `$${ethPrice}` : "—"}</div>
          </div>
        ) : (
          <div style={{color:"#9ca3af"}}>Loading gas data...</div>
        )}

        <div style={{marginTop:16, fontSize:12, color:"#9ca3af"}}>
          Updated every 10 seconds · Data from Base RPC
        </div>
      </div>
    </div>
  );
}
