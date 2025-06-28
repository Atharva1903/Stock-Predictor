import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Download, Search, Globe, Building2 } from "lucide-react";
import { toast } from "sonner";
import Plot from 'react-plotly.js';
import { Progress } from "@/components/ui/progress";

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PredictionResult {
  success: boolean;
  plot?: string;
  metrics?: { rmse: number; mae: number };
  recommendation?: {
    action: string;
    confidence: string;
    reason: string;
    price_change: number;
    volatility: number;
  };
  predictions?: any[];
  error?: string;
}

const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const StockPredictor = () => {
  const [ticker, setTicker] = useState("");
  const [marketType, setMarketType] = useState("us");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [predictionDays, setPredictionDays] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState<'idle'|'training'|'completed'>('idle');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [convertedPlot, setConvertedPlot] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);

  const usStocks = [
    { value: "AAPL", label: "Apple Inc. (AAPL)" },
    { value: "MSFT", label: "Microsoft Corporation (MSFT)" },
    { value: "GOOGL", label: "Alphabet Inc. (GOOGL)" },
    { value: "AMZN", label: "Amazon.com Inc. (AMZN)" },
    { value: "TSLA", label: "Tesla Inc. (TSLA)" },
    { value: "META", label: "Meta Platforms Inc. (META)" },
    { value: "NVDA", label: "NVIDIA Corporation (NVDA)" },
    { value: "JPM", label: "JPMorgan Chase & Co. (JPM)" },
    { value: "V", label: "Visa Inc. (V)" },
    { value: "JNJ", label: "Johnson & Johnson (JNJ)" },
    { value: "PG", label: "Procter & Gamble Co. (PG)" },
    { value: "UNH", label: "UnitedHealth Group Inc. (UNH)" },
    { value: "HD", label: "The Home Depot Inc. (HD)" },
    { value: "MA", label: "Mastercard Inc. (MA)" },
    { value: "DIS", label: "The Walt Disney Company (DIS)" },
    { value: "PYPL", label: "PayPal Holdings Inc. (PYPL)" },
    { value: "ADBE", label: "Adobe Inc. (ADBE)" },
    { value: "NFLX", label: "Netflix Inc. (NFLX)" },
    { value: "CRM", label: "Salesforce Inc. (CRM)" },
    { value: "INTC", label: "Intel Corporation (INTC)" },
  ];

  const indianStocks = [
    { value: "RELIANCE.NS", label: "Reliance Industries Ltd. (RELIANCE.NS)" },
    { value: "TCS.NS", label: "Tata Consultancy Services Ltd. (TCS.NS)" },
    { value: "HDFCBANK.NS", label: "HDFC Bank Ltd. (HDFCBANK.NS)" },
    { value: "INFY.NS", label: "Infosys Ltd. (INFY.NS)" },
    { value: "ICICIBANK.NS", label: "ICICI Bank Ltd. (ICICIBANK.NS)" },
    { value: "SBIN.NS", label: "State Bank of India (SBIN.NS)" },
    { value: "BHARTIARTL.NS", label: "Bharti Airtel Ltd. (BHARTIARTL.NS)" },
    { value: "TATAMOTORS.NS", label: "Tata Motors Ltd. (TATAMOTORS.NS)" },
    { value: "ITC.NS", label: "ITC Ltd. (ITC.NS)" },
    { value: "HINDUNILVR.NS", label: "Hindustan Unilever Ltd. (HINDUNILVR.NS)" },
    { value: "AXISBANK.NS", label: "Axis Bank Ltd. (AXISBANK.NS)" },
    { value: "KOTAKBANK.NS", label: "Kotak Mahindra Bank Ltd. (KOTAKBANK.NS)" },
    { value: "ASIANPAINT.NS", label: "Asian Paints Ltd. (ASIANPAINT.NS)" },
    { value: "MARUTI.NS", label: "Maruti Suzuki India Ltd. (MARUTI.NS)" },
    { value: "SUNPHARMA.NS", label: "Sun Pharmaceutical Industries Ltd. (SUNPHARMA.NS)" },
    { value: "WIPRO.NS", label: "Wipro Ltd. (WIPRO.NS)" },
    { value: "ULTRACEMCO.NS", label: "UltraTech Cement Ltd. (ULTRACEMCO.NS)" },
    { value: "TITAN.NS", label: "Titan Company Ltd. (TITAN.NS)" },
    { value: "BAJFINANCE.NS", label: "Bajaj Finance Ltd. (BAJFINANCE.NS)" },
    { value: "NESTLEIND.NS", label: "Nestle India Ltd. (NESTLEIND.NS)" },
    { value: "POWERGRID.NS", label: "Power Grid Corporation of India Ltd. (POWERGRID.NS)" },
  ];

  const currentStocks = marketType === "us" ? usStocks : indianStocks;
  
  const filteredStocks = currentStocks.filter(stock =>
    stock.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update symbol when currency changes
  useEffect(() => {
    const found = currencyOptions.find(c => c.code === selectedCurrency);
    setCurrencySymbol(found ? found.symbol : '$');
  }, [selectedCurrency]);

  const handleTrainModel = async () => {
    if (!ticker || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setResults(null);
    setProgress(0);
    setProgressStatus('training');

    // Simulate progress bar (since backend doesn't provide progress)
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress += Math.random() * 10 + 5;
      if (fakeProgress >= 95) {
        clearInterval(progressInterval);
        setProgress(95);
      } else {
        setProgress(Math.min(fakeProgress, 95));
      }
    }, 400);

    try {
      const response = await fetch(`${API_URL}/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: ticker,
          start_date: startDate,
          end_date: endDate,
          prediction_days: parseInt(predictionDays),
        }),
      });

      const data: PredictionResult = await response.json();

      clearInterval(progressInterval);
      setProgress(100);
      setProgressStatus('completed');

      if (data.success) {
        setResults(data);
        toast.success("Model trained successfully!");
      } else {
        toast.error(data.error || "Failed to train model");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setProgressStatus('idle');
      toast.error("Error connecting to server. Make sure Flask backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    window.open(`${API_URL}/download_csv`, "_blank");
  };

  const handleDownloadPlot = () => {
    window.open(`${API_URL}/download_plot`, "_blank");
  };

  // Parse Plotly chart data (now handles direct objects from Flask)
  const parsePlotData = (plotData: any) => {
    try {
      // If it's already an object, return it directly
      if (typeof plotData === 'object' && plotData !== null) {
        return plotData;
      }
      // If it's a string, try to parse it
      if (typeof plotData === 'string') {
        const parsed = JSON.parse(plotData);
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleConvertCurrency = async () => {
    if (!results?.plot || selectedCurrency === 'USD') {
      setConvertedPlot(null);
      return;
    }
    setIsConverting(true);
    try {
      // Use ExchangeRate-API with provided key
      const res = await fetch(`https://v6.exchangerate-api.com/v6/80f9c4924c96d57ebe25a567/pair/USD/${selectedCurrency}`);
      const data = await res.json();
      console.log('Currency API response:', data); // Debug
      const rate = data.conversion_rate;
      if (!rate) {
        toast.error('No rate in API response: ' + JSON.stringify(data));
        throw new Error('No rate');
      }
      // Deep copy plot data
      const plotObj = typeof results.plot === 'string' ? JSON.parse(results.plot) : JSON.parse(JSON.stringify(results.plot));
      // Convert y values robustly
      plotObj.data.forEach((trace: any) => {
        if (trace.y) {
          if (Array.isArray(trace.y[0])) {
            // Nested array (e.g., for candlestick)
            trace.y = trace.y.map((arr: any[]) => arr.map((v: number) => typeof v === 'number' ? v * rate : v));
          } else {
            trace.y = trace.y.map((v: number) => typeof v === 'number' ? v * rate : v);
          }
        }
      });
      // Update y-axis label
      if (plotObj.layout && plotObj.layout.yaxis) {
        plotObj.layout.yaxis.title = `${currencySymbol} Price`;
      } else if (plotObj.layout) {
        plotObj.layout.yaxis = { title: `${currencySymbol} Price` };
      }
      setConvertedPlot(plotObj);
    } catch (e) {
      toast.error('Currency conversion failed: ' + (e instanceof Error ? e.message : e));
      console.error('Currency conversion error:', e);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-white py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Stock Price Predictor
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered LSTM neural network for stock price forecasting
        </p>
      </div>

      {/* Configuration Card */}
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader className=" rounded-t-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Model Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Market Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="market-type">Market Type</Label>
              <Select value={marketType} onValueChange={setMarketType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      US Market
                    </div>
                  </SelectItem>
                  <SelectItem value="indian">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Indian Market
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stock Search */}
            <div className="space-y-2">
              <Label htmlFor="stock-search">Search Company</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="stock-search"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stock Selection */}
            <div className="space-y-2">
              <Label htmlFor="ticker">Select Stock</Label>
              <Select onValueChange={setTicker}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a stock" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredStocks.map((stock) => (
                    <SelectItem key={stock.value} value={stock.value}>
                      {stock.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prediction Days */}
            <div className="space-y-2">
              <Label htmlFor="prediction-days">Prediction Window</Label>
              <Select value={predictionDays} onValueChange={setPredictionDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Train Button & Progress Bar */}
            <div className="space-y-2 flex flex-col items-center justify-end">
              <Label>&nbsp;</Label>
              <div className="flex flex-col items-center w-full gap-2">
                <Button
                  onClick={handleTrainModel}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Training...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Train Model
                    </>
                  )}
                </Button>
                {(progressStatus === 'training' || progressStatus === 'completed') && (
                  <div className="w-full flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className={`text-xs font-medium ${progressStatus === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                      {progressStatus === 'completed' ? 'Completed' : `${Math.round(progress)}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && results.success && (
        <div className="space-y-8">
          {/* Stock Results */}
          <Card className="shadow-lg border-0">
            <CardHeader className=" rounded-t-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                {ticker} - Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Metrics and Recommendations Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Performance Metrics */}
                  <div className="flex flex-col justify-center h-full">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Model Performance</h3>
                    <div className="flex gap-4 h-full">
                      <div className="bg-blue-50 p-6 rounded-xl text-center flex-1 flex flex-col justify-center h-full">
                        <p className="text-sm text-blue-600 font-medium">RMSE</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {results.metrics?.rmse || "N/A"}
                        </p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-xl text-center flex-1 flex flex-col justify-center h-full">
                        <p className="text-sm text-green-600 font-medium">MAE</p>
                        <p className="text-2xl font-bold text-green-800">
                          {results.metrics?.mae || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trading Recommendation */}
                  {results.recommendation && (
                    <div className="flex flex-col justify-center h-full">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Trading Recommendation</h3>
                      <div className={`p-6 rounded-xl h-full flex flex-col justify-center ${getRecommendationColor(results.recommendation.action)}`}> 
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-bold">{results.recommendation.action}</p>
                          <span className={`text-sm font-medium ${getConfidenceColor(results.recommendation.confidence)}`}>
                            {results.recommendation.confidence} Confidence
                          </span>
                        </div>
                        <p className="text-sm mb-2">{results.recommendation.reason}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Price Change:</span> {results.recommendation.price_change}%
                          </div>
                          <div>
                            <span className="font-medium">Volatility:</span> {results.recommendation.volatility}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Row */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Prediction Chart</h3>
                  <div className="flex items-center justify-end mb-2 gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={selectedCurrency}
                      onChange={e => setSelectedCurrency(e.target.value)}
                    >
                      {currencyOptions.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.name}</option>
                      ))}
                    </select>
                    <Button size="sm" onClick={handleConvertCurrency} disabled={isConverting || selectedCurrency === 'USD'}>
                      {isConverting ? 'Converting...' : 'Convert'}
                    </Button>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    {(convertedPlot || results.plot) ? (
                      <Plot
                        data={parsePlotData(convertedPlot || results.plot)?.data || []}
                        layout={{
                          ...parsePlotData(convertedPlot || results.plot)?.layout,
                          height: 500,
                          margin: { t: 50, b: 60, l: 60, r: 20 },
                          legend: {
                            orientation: 'h',
                            y: -0.2,
                            x: 0.5,
                            xanchor: 'center'
                          },
                          title: {
                            ...parsePlotData(convertedPlot || results.plot)?.layout?.title,
                            font: { size: 16, color: '#1f2937' },
                            x: 0.5,
                            xanchor: 'center'
                          }
                        }}
                        config={{ 
                          displayModeBar: true,
                          modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'resetScale2d'],
                          displaylogo: false,
                          responsive: true
                        }}
                        style={{ width: '100%' }}
                        useResizeHandler={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <p>Chart data not available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button onClick={handleDownloadCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
                <Button onClick={handleDownloadPlot} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Chart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StockPredictor;
