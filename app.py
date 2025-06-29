from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import io
import base64
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from stock_predictor import StockPredictor
import plotly.graph_objects as go
import plotly.utils
import yfinance as yf

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Global variable to store the predictor instance
predictor = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/train', methods=['POST'])
def train_model():
    global predictor
    try:
        data = request.get_json()
        ticker = data['ticker'].upper()
        start_date = data['start_date']
        end_date = data['end_date']
        prediction_days = int(data['prediction_days'])

        # Train model for single stock
        predictor = StockPredictor(ticker, start_date, end_date)
        history = predictor.train_model()
        predictions = predictor.predict_future(prediction_days)
        plot_data = create_interactive_plot(predictor.data, predictions, ticker)
        metrics = calculate_metrics(predictor.data, predictions)
        recommendation = generate_recommendation(predictor.data, predictions, ticker)

        return jsonify({
            'success': True,
            'plot': plot_data,
            'metrics': metrics,
            'recommendation': recommendation,
            'predictions': predictions.to_dict('records')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/download_csv')
def download_csv():
    global predictor
    if predictor is None:
        return jsonify({'error': 'No model trained yet'}), 400
    try:
        predictions = predictor.predict_future(30)
        historical_data = predictor.data[['Date', 'Close']].copy()
        historical_data['Type'] = 'Historical'
        pred_data = predictions[['Date', 'Close']].copy()
        pred_data['Type'] = 'Predicted'
        combined_data = pd.concat([historical_data, pred_data], ignore_index=True)
        
        csv_buffer = io.StringIO()
        combined_data.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        return send_file(
            io.BytesIO(csv_buffer.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'{predictor.ticker}_predictions.csv'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/download_plot')
def download_plot():
    global predictor
    if predictor is None:
        return jsonify({'error': 'No model trained yet'}), 400
    try:
        import matplotlib.pyplot as plt
        import matplotlib.dates as mdates
        predictions = predictor.predict_future(30)
        plt.figure(figsize=(12, 6))
        plt.plot(predictor.data['Date'], predictor.data['Close'], label='Historical', color='blue')
        plt.plot(predictions['Date'], predictions['Close'], label='Predicted', color='red', linestyle='--')
        plt.title(f'{predictor.ticker} Stock Price Prediction')
        plt.xlabel('Date')
        plt.ylabel('Price')
        plt.legend()
        plt.grid(True)
        plt.xticks(rotation=45)
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=300)
        img_buffer.seek(0)
        plt.close()
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name=f'{predictor.ticker}_prediction_plot.png'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/test_yf')
def test_yf():
    try:
        info = yf.Ticker("MSFT").info
        return str(info)
    except Exception as e:
        return str(e), 500

def create_interactive_plot(data, predictions, ticker):
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=data['Date'],
        y=data['Close'],
        mode='lines',
        name='Historical',
        line=dict(color='blue', width=2)
    ))
    fig.add_trace(go.Scatter(
        x=predictions['Date'],
        y=predictions['Close'],
        mode='lines',
        name='Predicted',
        line=dict(color='red', width=2, dash='dash')
    ))
    fig.update_layout(
        title=f'{ticker} Stock Price Prediction',
        xaxis_title='Date',
        yaxis_title='Price ($)',
        hovermode='x unified',
        template='plotly_white',
        height=400,
        margin=dict(t=50, b=50, l=50, r=50)
    )
    # Convert to JSON-serializable format
    fig_json = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig))
    return fig_json

def calculate_metrics(data, predictions):
    if len(data) > 30:
        validation_data = data.tail(30)
        pred_values = predictions.head(30)['Close'].values
        actual_values = validation_data['Close'].values
        rmse = np.sqrt(np.mean((actual_values - pred_values) ** 2))
        mae = np.mean(np.abs(actual_values - pred_values))
        return {
            'rmse': round(rmse, 2),
            'mae': round(mae, 2)
        }
    return {
        'rmse': 'N/A',
        'mae': 'N/A'
    }

def generate_recommendation(data, predictions, ticker):
    """Generate buy/sell recommendation based on prediction trends"""
    try:
        # Get current price and predicted prices
        current_price = data['Close'].iloc[-1]
        predicted_prices = predictions['Close'].head(7)  # Next 7 days
        
        # Calculate trend
        price_change = (predicted_prices.iloc[-1] - current_price) / current_price * 100
        
        # Calculate volatility
        recent_volatility = data['Close'].tail(30).pct_change().std() * 100
        
        # Generate recommendation based on trend and volatility
        if price_change > 5:  # Strong upward trend
            recommendation = "BUY"
            confidence = "High"
            reason = f"Predicted {price_change:.1f}% increase in 7 days"
        elif price_change > 2:  # Moderate upward trend
            recommendation = "BUY"
            confidence = "Medium"
            reason = f"Predicted {price_change:.1f}% increase in 7 days"
        elif price_change < -5:  # Strong downward trend
            recommendation = "SELL"
            confidence = "High"
            reason = f"Predicted {abs(price_change):.1f}% decrease in 7 days"
        elif price_change < -2:  # Moderate downward trend
            recommendation = "SELL"
            confidence = "Medium"
            reason = f"Predicted {abs(price_change):.1f}% decrease in 7 days"
        else:  # Sideways movement
            recommendation = "HOLD"
            confidence = "Medium"
            reason = f"Predicted {price_change:.1f}% change in 7 days"
        
        return {
            'action': recommendation,
            'confidence': confidence,
            'reason': reason,
            'price_change': round(price_change, 1),
            'volatility': round(recent_volatility, 1)
        }
    except Exception as e:
        return {
            'action': 'HOLD',
            'confidence': 'Low',
            'reason': 'Insufficient data for recommendation',
            'price_change': 0,
            'volatility': 0
        }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 