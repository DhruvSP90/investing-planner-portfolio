import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { formatCurrency, formatPercentage } from '../utils/calculations';

const StockCard = ({ stock, onPress }) => {
  const isPositive = stock.change >= 0;
  
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(stock)}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.price}>{formatCurrency(stock.price)}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.volume}>Vol: {stock.volume.toLocaleString()}</Text>
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: isPositive ? COLORS.success : COLORS.danger }]}>
            {formatCurrency(stock.change)}
          </Text>
          <Text style={[styles.changePercent, { color: isPositive ? COLORS.success : COLORS.danger }]}>
            {formatPercentage(parseFloat(stock.changePercent))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volume: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  changePercent: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StockCard;
