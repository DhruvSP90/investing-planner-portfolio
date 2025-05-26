import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { formatCurrency, formatPercentage } from '../utils/calculations';

const PortfolioSummary = ({ totalValue, totalChange, changePercent }) => {
  const isPositive = totalChange >= 0;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio Value</Text>
      <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
      
      <View style={styles.changeContainer}>
        <Text style={[styles.change, { color: isPositive ? COLORS.success : COLORS.danger }]}>
          {formatCurrency(totalChange)}
        </Text>
        <Text style={[styles.changePercent, { color: isPositive ? COLORS.success : COLORS.danger }]}>
          ({formatPercentage(changePercent)})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  changePercent: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PortfolioSummary;
