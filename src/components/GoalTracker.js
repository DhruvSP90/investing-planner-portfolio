import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import DatabaseService from '../services/databaseServices';

const GoalTracker = ({ currentValue }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '' });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const goalsFromDB = await DatabaseService.getAllGoals();
      setGoals(goalsFromDB);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const updateGoalProgress = async (goalId, currentAmount) => {
    try {
      await DatabaseService.updateGoalProgress(goalId, currentAmount);
      await loadGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const addGoal = async () => {
    if (newGoal.name && newGoal.target && newGoal.deadline) {
      try {
        const goal = {
          name: newGoal.name,
          target: parseFloat(newGoal.target),
          current: 0,
          deadline: newGoal.deadline
        };
        await DatabaseService.saveGoal(goal);
        setNewGoal({ name: '', target: '', deadline: '' });
        setModalVisible(false);
        await loadGoals();
      } catch (error) {
        console.error('Error adding goal:', error);
        Alert.alert('Error', 'Failed to add goal');
      }
    } else {
      Alert.alert('Error', 'Please fill all fields');
    }
  };

  const handleGoalPress = (goal) => {
    Alert.alert(
      `Update ${goal.name}`,
      `Current: $${goal.current.toLocaleString()}\nTarget: $${goal.target.toLocaleString()}`,
      [
        {
          text: 'Update Progress',
          onPress: () => {
            Alert.prompt(
              'Update Progress',
              `Enter current amount for ${goal.name}:`,
              (newAmount) => {
                if (newAmount && !isNaN(Number(newAmount))) {
                  updateGoalProgress(goal.id, Number(newAmount));
                }
              },
              'numeric',
              goal.current.toString()
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading Goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Goals (SQLite)</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {goals.map((goal) => {
        const progress = calculateProgress(goal.current, goal.target);
        
        return (
          <TouchableOpacity 
            key={goal.id} 
            style={styles.goalCard}
            onPress={() => handleGoalPress(goal)}
          >
            <Text style={styles.goalName}>{goal.name}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
            </View>
            
            <View style={styles.goalFooter}>
              <Text style={styles.currentAmount}>
                ${goal.current.toLocaleString()}
              </Text>
              <Text style={styles.targetAmount}>
                of ${goal.target.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Add Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Goal Name"
              value={newGoal.name}
              onChangeText={(text) => setNewGoal({...newGoal, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Target Amount"
              value={newGoal.target}
              onChangeText={(text) => setNewGoal({...newGoal, target: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Deadline (YYYY-MM-DD)"
              value={newGoal.deadline}
              onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addGoalButton]}
                onPress={addGoal}
              >
                <Text style={styles.addButtonText}>Add Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    margin: 16,
    padding: 16,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 40,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  targetAmount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.background,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  addGoalButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  addButtonText: {
    textAlign: 'center',
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GoalTracker;
