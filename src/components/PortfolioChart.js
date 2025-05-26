import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../constants/colors';

const PortfolioChart = ({ data, title = "Portfolio Performance" }) => {
  const chartData = {
    labels: data.map(item => item.date.slice(-5)), // Show MM-DD
    datasets: [{
      data: data.map(item => item.value),
      color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
      strokeWidth: 3,
    }]
  };

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
    style: { borderRadius: SIZES.radius },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.primary
    }
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={SIZES.width - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
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
  chart: {
    borderRadius: SIZES.radius,
  },
});

export default PortfolioChart;