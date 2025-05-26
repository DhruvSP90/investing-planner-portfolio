import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES } from '../constants/colors';

const Recommendations = ({ stocks }) => {
  const generateRecommendations = () => {
    const recommendations = [];
    
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.shares * stock.price), 0);
    stocks.forEach(stock => {
      const allocation = ((stock.shares * stock.price) / totalValue) * 100;
      if (allocation > 30) {
        recommendations.push({
          type: 'warning',
          title: 'Overweight Position',
          description: `${stock.symbol} represents ${allocation.toFixed(1)}% of your portfolio. Consider rebalancing.`,
          action: 'Rebalance'
        });
      }
    });

    recommendations.push({
      type: 'success',
      title: 'Diversification Opportunity',
      description: 'Consider adding international exposure or bonds to reduce risk.',
      action: 'Explore'
    });

    recommendations.push({
      type: 'info',
      title: 'Dollar-Cost Averaging',
      description: 'Set up automatic monthly investments to reduce timing risk.',
      action: 'Set Up'
    });

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getIconName = (type) => {
    switch (type) {
      case 'warning': return 'warning-outline';
      case 'success': return 'checkmark-circle-outline';
      case 'info': return 'information-circle-outline';
      default: return 'bulb-outline';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return COLORS.warning;
      case 'success': return COLORS.success;
      case 'info': return COLORS.secondary;
      default: return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investment Recommendations</Text>
      
      {recommendations.map((rec, index) => (
        <View key={index} style={styles.recommendationCard}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getIconName(rec.type)} 
              size={24} 
              color={getIconColor(rec.type)} 
            />
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recDescription}>{rec.description}</Text>
          </View>
          
          <TouchableOpacity style={[styles.actionButton, { borderColor: getIconColor(rec.type) }]}>
            <Text style={[styles.actionText, { color: getIconColor(rec.type) }]}>
              {rec.action}
            </Text>
          </TouchableOpacity>
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
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding * 0.75,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 0.5,
    marginBottom: SIZES.margin * 0.75,
  },
  iconContainer: {
    marginRight: SIZES.margin,
  },
  contentContainer: {
    flex: 1,
  },
  recTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recDescription: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.4,
    borderWidth: 1,
    borderRadius: SIZES.radius * 0.5,
  },
  actionText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
});

export default Recommendations;
