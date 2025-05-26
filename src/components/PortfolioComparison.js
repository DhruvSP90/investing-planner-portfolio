import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../constants/colors';

const PortfolioComparison = ({ userPortfolio }) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState('S&P 500');
  
  const benchmarks = {
    'S&P 500': { return: 12.5, risk: 15.2, sharpe: 0.82 },
    'NASDAQ': { return: 15.8, risk: 18.7, sharpe: 0.85 },
    'Dow Jones': { return: 10.2, risk: 12.8, sharpe: 0.80 },
  };

  const userMetrics = {
    return: 14.2,
    risk: 16.5,
    sharpe: 0.86
  };

  const chartData = {
    labels: ['Return %', 'Risk %', 'Sharpe Ratio'],
    datasets: [
      {
        data: [userMetrics.return, userMetrics.risk, userMetrics.sharpe * 10], // Scale Sharpe for visibility
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        label: 'Your Portfolio'
      },
      {
        data: [
          benchmarks[selectedBenchmark].return,
          benchmarks[selectedBenchmark].risk,
          benchmarks[selectedBenchmark].sharpe * 10
        ],
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        label: selectedBenchmark
      }
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio vs Benchmark</Text>
      
      <View style={styles.benchmarkSelector}>
        {Object.keys(benchmarks).map((benchmark) => (
          <TouchableOpacity
            key={benchmark}
            style={[
              styles.benchmarkButton,
              selectedBenchmark === benchmark && styles.selectedBenchmark
            ]}
            onPress={() => setSelectedBenchmark(benchmark)}
          >
            <Text style={[
              styles.benchmarkText,
              selectedBenchmark === benchmark && styles.selectedBenchmarkText
            ]}>
              {benchmark}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <BarChart
        data={chartData}
        width={SIZES.width - 64}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
        }}
        style={styles.chart}
      />

      <View style={styles.metricsComparison}>
        <ComparisonMetric
          label="Annual Return"
          userValue={`${userMetrics.return}%`}
          benchmarkValue={`${benchmarks[selectedBenchmark].return}%`}
          isPositive={userMetrics.return > benchmarks[selectedBenchmark].return}
        />
        <ComparisonMetric
          label="Risk (Volatility)"
          userValue={`${userMetrics.risk}%`}
          benchmarkValue={`${benchmarks[selectedBenchmark].risk}%`}
          isPositive={userMetrics.risk < benchmarks[selectedBenchmark].risk}
        />
        <ComparisonMetric
          label="Sharpe Ratio"
          userValue={userMetrics.sharpe.toFixed(2)}
          benchmarkValue={benchmarks[selectedBenchmark].sharpe.toFixed(2)}
          isPositive={userMetrics.sharpe > benchmarks[selectedBenchmark].sharpe}
        />
      </View>
    </View>
  );
};

const ComparisonMetric = ({ label, userValue, benchmarkValue, isPositive }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <View style={styles.metricValues}>
      <Text style={styles.userValue}>{userValue}</Text>
      <Text style={styles.vs}>vs</Text>
      <Text style={styles.benchmarkValue}>{benchmarkValue}</Text>
      <View style={[
        styles.indicator,
        { backgroundColor: isPositive ? COLORS.success : COLORS.danger }
      ]}>
        <Text style={styles.indicatorText}>
          {isPositive ? '↑' : '↓'}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  benchmarkSelector: {
    flexDirection: 'row',
    marginBottom: SIZES.margin,
  },
  benchmarkButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  selectedBenchmark: {
    backgroundColor: COLORS.primary,
  },
  benchmarkText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedBenchmarkText: {
    color: COLORS.surface,
  },
  chart: {
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
  },
  metricsComparison: {
    marginTop: SIZES.margin,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin * 0.75,
  },
  metricLabel: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  vs: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginHorizontal: 8,
  },
  benchmarkValue: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  indicatorText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PortfolioComparison;
