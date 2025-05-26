import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, isTablet } from '../constants/colors';

const RiskAnalysis = ({ stocks }) => {
  const calculateRiskMetrics = () => {
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.shares * stock.price), 0);
    
    const sectors = {
      'Technology': ['AAPL', 'GOOGL', 'MSFT'],
      'Electric Vehicles': ['TSLA'],
      'E-commerce': ['AMZN']
    };
    
    const sectorAllocation = {};
    Object.entries(sectors).forEach(([sector, symbols]) => {
      const sectorValue = stocks
        .filter(stock => symbols.includes(stock.symbol))
        .reduce((sum, stock) => sum + (stock.shares * stock.price), 0);
      sectorAllocation[sector] = ((sectorValue / totalValue) * 100).toFixed(1);
    });

    return { sectorAllocation, totalValue };
  };

  const { sectorAllocation } = calculateRiskMetrics();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Risk Analysis</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Risk Level</Text>
          <Text style={[styles.metricValue, { color: COLORS.warning }]}>Moderate</Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Diversification</Text>
          <Text style={[styles.metricValue, { color: COLORS.success }]}>Good</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sector Allocation</Text>
      {Object.entries(sectorAllocation).map(([sector, percentage]) => (
        <View key={sector} style={styles.sectorRow}>
          <Text style={styles.sectorName}>{sector}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
      ))}
    </View>
  );
};

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
  metricsContainer: {
    flexDirection: isTablet ? 'row' : 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.margin * 1.5,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  sectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 0.8,
  },
  sectorName: {
    flex: 1,
    fontSize: SIZES.caption,
    color: COLORS.text,
  },
  progressBar: {
    flex: 2,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: SIZES.margin * 0.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  percentage: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
});

export default RiskAnalysis;
