# Stockbyak - AI-Powered Stock Price Predictor

A modern, intelligent stock price prediction system built with **LSTM neural networks**, featuring a beautiful React frontend and comprehensive buy/sell recommendations.

## 🚀 Features

- **Single Stock Analysis**: Focused analysis with detailed insights
- **Market Support**: Both US and Indian stock markets
- **Trading Recommendations**: AI-generated BUY/SELL/HOLD suggestions
- **Interactive Charts**: Real-time visualizations with Plotly
- **Searchable Company List**: 40+ popular stocks across markets
- **Performance Metrics**: RMSE and MAE evaluation
- **Export Options**: Download CSV data and chart images

## 🛠️ Technology Stack

**Backend**: Python, Flask, TensorFlow/Keras, yfinance, pandas, plotly
**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, react-plotly.js

## 📦 Installation

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+ and npm

### Setup
```bash
# Clone repository
git clone <repository-url>
cd Stockbyak

# Backend setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend setup
npm install
npm install react-plotly.js @types/react-plotly.js
```

## 🚀 Usage

### Start Backend
```bash
venv\Scripts\activate
python app.py
```

### Start Frontend
```bash
npm run dev
```

### Using the App
1. Select market (US or Indian)
2. Search and select a stock from the dropdown
3. Set date range and prediction window
4. Click "Train Model"
5. View results, recommendations, and charts

## 📊 Supported Stocks

**US Market**: Apple, Microsoft, Google, Amazon, Tesla, Meta, NVIDIA, and 13+ more
**Indian Market**: Reliance, TCS, HDFC Bank, Infosys, ICICI Bank, and 15+ more

## 🧠 Trading Recommendations

The system provides intelligent trading advice:
- **BUY**: Predicted increase > 2%
- **SELL**: Predicted decrease > 2%
- **HOLD**: Predicted change between -2% and +2%

Each recommendation includes confidence level, reasoning, and volatility metrics.

## 📁 Project Structure

```
Stockbyak/
├── app.py                    # Flask backend
├── stock_predictor.py        # LSTM model
├── src/
│   ├── App.tsx              # Main React app
│   └── components/
│       └── StockPredictor.tsx  # Main component
└── README.md
```

## ⚠️ Disclaimer

This application is for **educational purposes only**. Stock predictions are uncertain and should not be used as sole basis for investment decisions. Always consult financial advisors.

## 🔮 Future Enhancements

- Portfolio analysis
- Advanced ML models
- Real-time data streaming
- Sentiment analysis
- Mobile app

---

**Built with ❤️ using modern AI and web technologies**
