import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../src/constants/colors';
import ApiService from '../../src/services/apiService';

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  volume: number;
  lastUpdated: string;
}

interface TimeSeriesData {
  date: string;
  close: number;
  volume: number;
}

interface StatItemProps {
  label: string;
  value: string;
}

interface NewsItemProps {
  title: string;
  time: string;
  source: string;
}

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams();
  const [stockData, setStockData] = useState<Stock | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<string>('1M');

  useEffect(() => {
    fetchStockDetails();
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      const [quote, timeSeries] = await Promise.all([
        ApiService.getStockQuote(symbol as string),
        ApiService.getTimeSeriesDaily(symbol as string)
      ]);
      
      setStockData(quote);
      setTimeSeriesData(timeSeries);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stockData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const chartData = {
    labels: timeSeriesData.slice(-7).map(item => item.date.slice(-5)),
    datasets: [{
      data: timeSeriesData.slice(-7).map(item => item.close),
      color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
      strokeWidth: 2,
    }]
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.symbol}>{stockData.symbol}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.currentPrice}>${stockData.price.toFixed(2)}</Text>
        <View style={styles.changeContainer}>
          <Text style={[
            styles.change, 
            { color: stockData.change >= 0 ? COLORS.success : COLORS.danger }
          ]}>
            {stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)}
          </Text>
          <Text style={[
            styles.changePercent,
            { color: stockData.change >= 0 ? COLORS.success : COLORS.danger }
          ]}>
            ({stockData.changePercent}%)
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.timeframeButtons}>
          {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.timeframeButton,
                timeframe === period && styles.activeTimeframe
              ]}
              onPress={() => setTimeframe(period)}
            >
              <Text style={[
                styles.timeframeText,
                timeframe === period && styles.activeTimeframeText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <LineChart
          data={chartData}
          width={SIZES.width - 32}
          height={200}
          chartConfig={{
            backgroundColor: COLORS.surface,
            backgroundGradientFrom: COLORS.surface,
            backgroundGradientTo: COLORS.surface,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Key Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Key Statistics</Text>
        <View style={styles.statsGrid}>
          <StatItem label="Volume" value={stockData.volume.toLocaleString()} />
          <StatItem label="Market Cap" value="$2.8T" />
          <StatItem label="P/E Ratio" value="28.5" />
          <StatItem label="52W High" value="$199.62" />
          <StatItem label="52W Low" value="$124.17" />
          <StatItem label="Dividend Yield" value="0.44%" />
        </View>
      </View>

      {/* News Section */}
      <View style={styles.newsContainer}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        <NewsItem 
          title="Apple Reports Strong Q4 Earnings"
          time="2 hours ago"
          source="Reuters"
        />
        <NewsItem 
          title="iPhone Sales Exceed Expectations"
          time="5 hours ago"
          source="Bloomberg"
        />
      </View>
    </ScrollView>
  );
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const NewsItem: React.FC<NewsItemProps> = ({ title, time, source }) => (
  <TouchableOpacity style={styles.newsItem}>
    <Text style={styles.newsTitle}>{title}</Text>
    <Text style={styles.newsTime}>{time} • {source}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: 8,
  },
  symbol: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  favoriteButton: {
    padding: 8,
  },
  priceSection: {
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
    backgroundColor: COLORS.surface,
  },
  currentPrice: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  change: {
    fontSize: SIZES.body,
    fontWeight: '600',
    marginRight: 8,
  },
  changePercent: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.margin,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.margin,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTimeframe: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
  activeTimeframeText: {
    color: COLORS.surface,
  },
  chart: {
    borderRadius: SIZES.radius,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.margin,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: SIZES.margin,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  newsContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.margin,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  newsItem: {
    paddingVertical: SIZES.padding * 0.75,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  newsTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  newsTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
});
