import axios from 'axios';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.alphaVantageApiKey || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
  }

  async getStockQuote(symbol) {
    try {
      const response = await this.api.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: API_KEY,
        },
      });
      
      console.log(`API Response for ${symbol}:`, response.data);

      if (response.data.Information) {
        console.warn('Demo API key limitation:', response.data.Information);
        throw new Error('Demo API key limitation - please get a real API key');
      }
      
      const quote = response.data['Global Quote'];
      if (!quote) {
        console.error('No Global Quote in response:', response.data);
        throw new Error(`Invalid response from API for symbol ${symbol}`);
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'].replace('%', ''),
        volume: parseInt(quote['06. volume']),
        lastUpdated: quote['07. latest trading day'],
      };
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
  }

  async getMultipleQuotes(symbols) {
    const results = [];
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getStockQuote(symbol);
        results.push(quote);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to fetch ${symbol}, skipping:`, error);
      }
    }
    
    if (results.length === 0) {
      throw new Error('Failed to fetch any stock data');
    }
    
    return results;
  }

  async getTimeSeriesDaily(symbol, outputSize = 'compact') {
    try {
      const response = await this.api.get('', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: outputSize,
          apikey: API_KEY,
        },
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('Invalid response from API');
      }

      const chartData = Object.entries(timeSeries)
        .slice(0, 30)
        .reverse()
        .map(([date, data]) => ({
          date,
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume']),
        }));

      return chartData;
    } catch (error) {
      console.error('Error fetching time series:', error);
      throw new Error('Failed to fetch historical data');
    }
  }

  async getPortfolioHistoricalData(symbols, shares) {
  try {
    const historicalData = {};
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const stockShares = shares[i];
      
      const timeSeries = await this.getTimeSeriesDaily(symbol, 'compact');
      historicalData[symbol] = timeSeries.map(day => ({
        ...day,
        value: day.close * stockShares 
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const portfolioHistory = this.calculatePortfolioHistory(historicalData);
    return portfolioHistory;
    
  } catch (error) {
    console.error('Error fetching portfolio historical data:', error);
    throw new Error('Failed to fetch portfolio historical data');
  }
}

calculatePortfolioHistory(historicalData) {
  const symbols = Object.keys(historicalData);
  const portfolioHistory = [];
  
  const minLength = Math.min(...symbols.map(symbol => historicalData[symbol].length));
  
  for (let i = 0; i < minLength; i++) {
    let totalValue = 0;
    let date = null;
    
    symbols.forEach(symbol => {
      const dayData = historicalData[symbol][i];
      totalValue += dayData.value;
      if (!date) date = dayData.date;
    });
    
    portfolioHistory.push({
      date: date,
      value: totalValue
    });
  }
  
  return portfolioHistory.reverse(); 
}
}

export default new ApiService();
