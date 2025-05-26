// const fetchPortfolioData = async () => {
//   //   try {
//   //     setError(null);
//   //     const stockData = await apiService.getMultipleQuotes(SAMPLE_PORTFOLIO);
      
//   //     const stocksWithHoldings: Stock[] = stockData.map((stock: Stock, index: number) => ({
//   //       ...stock,
//   //       shares: [10, 5, 15, 8, 12][index],
//   //     }));
      
//   //     setStocks(stocksWithHoldings);
//   //   } catch (err: unknown) {
//   //     const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
//   //     setError(errorMessage);
//   //     console.error('Error fetching portfolio:', err);
//   //   } finally {
//   //     setLoading(false);
//   //     setRefreshing(false);
//   //   }
//   // };

import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import GoalTracker from '../src/components/GoalTracker';
import LoadingSpinner from '../src/components/LoadingSpinner';
import PortfolioChart from '../src/components/PortfolioChart';
import PortfolioComparison from '../src/components/PortfolioComparison';
import PortfolioSummary from '../src/components/PortfolioSummary';
import Recommendations from '../src/components/Recommendations';
import RiskAnalysis from '../src/components/RiskAnalysis';
import StockCard from '../src/components/StockCard';
import { COLORS } from '../src/constants/colors';
import DatabaseService from '../src/services/databaseServices';

// Mock data for charts
const mockChartData = [
  { date: '2025-05-20', value: 14500 },
  { date: '2025-05-21', value: 14750 },
  { date: '2025-05-22', value: 14400 },
  { date: '2025-05-23', value: 14900 },
  { date: '2025-05-24', value: 14800 },
  { date: '2025-05-25', value: 14850 },
  { date: '2025-05-26', value: 14873.60 },
];

const MOCK_STOCKS = [
  {
    symbol: 'AAPL',
    price: 275.43,
    change: 2.15,
    changePercent: '1.24',
    volume: 52840000,
    lastUpdated: '2025-05-26',
    shares: 10
  },
  {
    symbol: 'GOOGL',
    price: 287.52,
    change: -15.23,
    changePercent: '-0.53',
    volume: 1240000,
    lastUpdated: '2025-05-26',
    shares: 5
  },
  {
    symbol: 'MSFT',
    price: 350.18,
    change: -4.68,
    changePercent: '-1.03',
    volume: 16883509,
    lastUpdated: '2025-05-26',
    shares: 15
  },
  {
    symbol: 'TSLA',
    price: 248.50,
    change: 8.75,
    changePercent: '3.65',
    volume: 45200000,
    lastUpdated: '2025-05-26',
    shares: 8
  },
  {
    symbol: 'AMZN',
    price: 286.75,
    change: 1.25,
    changePercent: '0.67',
    volume: 28500000,
    lastUpdated: '2025-05-26',
    shares: 12
  }
];

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  volume: number;
  lastUpdated: string;
  shares?: number;
}

interface ChartData {
  date: string;
  value: number;
}

export default function HomeScreen() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loadDataFromDatabase();
      
      await fetchFreshData();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataFromDatabase = async () => {
    try {
      const savedStocks = await DatabaseService.getAllStocks();
      const portfolioHistory = await DatabaseService.getPortfolioHistory(30);
      
      console.log('Loaded from DB - Stocks:', savedStocks.length, 'History:', portfolioHistory.length);
      
      if (savedStocks.length > 0) {
        setStocks(savedStocks);
      }
      
      if (portfolioHistory.length > 0) {
        setChartData(portfolioHistory);
      } else {
        setChartData(mockChartData);
      }
    } catch (error) {
      console.error('Error loading data from database:', error);
      setStocks(MOCK_STOCKS);
      setChartData(mockChartData);
    }
  };

  const fetchFreshData = async () => {
    try {
      setError(null);
      
      const stocksWithTimestamp = MOCK_STOCKS.map(stock => ({
        ...stock,
        lastUpdated: new Date().toISOString()
      }));

      await DatabaseService.saveMultipleStocks(stocksWithTimestamp);
      
      setStocks(stocksWithTimestamp);

      const summary = await DatabaseService.getPortfolioSummary();
      await DatabaseService.savePortfolioSnapshot(
        summary.totalValue,
        summary.totalChange,
        summary.changePercent
      );
      
      const updatedHistory = await DatabaseService.getPortfolioHistory(30);
      if (updatedHistory.length > 0) {
        setChartData(updatedHistory);
      } else {
        setChartData(mockChartData);
      }
      
      console.log('Fresh data saved to database');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching fresh data:', err);
      
      setStocks(MOCK_STOCKS);
      setChartData(mockChartData);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFreshData();
    setRefreshing(false);
  };

  const handleStockPress = async (stock: Stock) => {
    const positionValue = stock.price * stock.shares!;
    
    Alert.alert(
      `${stock.symbol} Details`,
      `Current Price: $${stock.price.toFixed(2)}\nShares Owned: ${stock.shares}\nPosition Value: $${positionValue.toLocaleString()}\nDaily Change: $${stock.change.toFixed(2)} (${stock.changePercent}%)`,
      [
        {
          text: 'Update Shares',
          onPress: () => {
            Alert.prompt(
              'Update Shares',
              `Enter new number of shares for ${stock.symbol}:`,
              async (newShares) => {
                if (newShares && !isNaN(Number(newShares))) {
                  await DatabaseService.updateStockShares(stock.symbol, Number(newShares));
                  await loadDataFromDatabase();
                }
              },
              'plain-text',
              stock.shares?.toString()
            );
          }
        },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && stocks.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubText}>Using cached data from SQLite</Text>
      </View>
    );
  }

  const totalValue = stocks.reduce((sum, stock) => sum + (stock.price * stock.shares!), 0);
  const totalChange = stocks.reduce((sum, stock) => sum + (stock.change * stock.shares!), 0);
  const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Portfolio Summary */}
      <PortfolioSummary
        totalValue={totalValue}
        totalChange={totalChange}
        changePercent={changePercent}
      />
      
      {/* Portfolio Performance Chart */}
      <PortfolioChart 
        data={mockChartData} 
        title="Portfolio Performance"
      />
      
      {/* Risk Analysis */}
      <RiskAnalysis stocks={stocks} />
      
      {/* Portfolio vs Benchmark Comparison */}
      <PortfolioComparison userPortfolio={stocks} />
      
      {/* Investment Recommendations */}
      <Recommendations stocks={stocks} />
      
      {/* Financial Goals Tracker */}
      <GoalTracker currentValue={totalValue} />
      
      {/* Individual Stock Cards */}
      <View style={styles.stocksContainer}>
        <Text style={styles.sectionTitle}>Your Holdings</Text>
        {stocks.map((stock: Stock) => (
          <StockCard 
            key={stock.symbol} 
            stock={stock} 
            onPress={handleStockPress} 
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  stocksContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
});
