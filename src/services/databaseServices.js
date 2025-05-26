import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initPromise = this.initDatabase();
  }

  async initDatabase() {
    try {
      this.db = await SQLite.openDatabaseAsync('portfolio.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
  }

  async createTables() {
    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS stocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT UNIQUE NOT NULL,
          price REAL NOT NULL,
          change_amount REAL NOT NULL,
          change_percent TEXT NOT NULL,
          volume INTEGER NOT NULL,
          shares INTEGER NOT NULL,
          last_updated TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create portfolio_history table for charts
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS portfolio_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT UNIQUE NOT NULL,
          total_value REAL NOT NULL,
          total_change REAL NOT NULL,
          change_percent REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create financial_goals table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS financial_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          target_amount REAL NOT NULL,
          current_amount REAL DEFAULT 0,
          deadline TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.insertDefaultGoals();

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  async insertDefaultGoals() {
    try {
      const existingGoals = await this.db.getAllAsync('SELECT COUNT(*) as count FROM financial_goals');
      
      if (existingGoals[0].count === 0) {
        const defaultGoals = [
          { name: 'Emergency Fund', target: 50000, current: 35000, deadline: '2025-12-31' },
          { name: 'House Down Payment', target: 100000, current: 65000, deadline: '2026-06-30' },
          { name: 'Retirement', target: 1000000, current: 150000, deadline: '2045-01-01' },
        ];

        for (const goal of defaultGoals) {
          await this.db.runAsync(
            'INSERT INTO financial_goals (name, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?)',
            [goal.name, goal.target, goal.current, goal.deadline]
          );
        }
        console.log('Default goals inserted');
      }
    } catch (error) {
      console.error('Error inserting default goals:', error);
    }
  }

  async saveStock(stock) {
    try {
      await this.ensureInitialized();
      await this.db.runAsync(
        `INSERT OR REPLACE INTO stocks 
         (symbol, price, change_amount, change_percent, volume, shares, last_updated, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          stock.symbol,
          stock.price,
          stock.change,
          stock.changePercent,
          stock.volume,
          stock.shares,
          stock.lastUpdated
        ]
      );
      console.log(`Stock ${stock.symbol} saved successfully`);
    } catch (error) {
      console.error('Error saving stock:', error);
      throw error;
    }
  }

  async saveMultipleStocks(stocks) {
    try {
      await this.ensureInitialized();
      for (const stock of stocks) {
        await this.saveStock(stock);
      }
      console.log('All stocks saved successfully');
    } catch (error) {
      console.error('Error saving multiple stocks:', error);
      throw error;
    }
  }

  async updateStockShares(symbol, shares) {
    try {
      await this.db.runAsync(
        'UPDATE stocks SET shares = ?, updated_at = CURRENT_TIMESTAMP WHERE symbol = ?',
        [shares, symbol]
      );
      console.log(`Updated shares for ${symbol}: ${shares}`);
    } catch (error) {
      console.error('Error updating stock shares:', error);
      throw error;
    }
  }

  async saveGoal(goal) {
    try {
      await this.db.runAsync(
        'INSERT INTO financial_goals (name, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?)',
        [goal.name, goal.target, goal.current || 0, goal.deadline]
      );
      console.log('Goal saved successfully');
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  async getAllStocks() {
    try {
      await this.ensureInitialized();
      const result = await this.db.getAllAsync('SELECT * FROM stocks ORDER BY symbol');
      return result.map(row => ({
        symbol: row.symbol,
        price: row.price,
        change: row.change_amount,
        changePercent: row.change_percent,
        volume: row.volume,
        shares: row.shares,
        lastUpdated: row.last_updated
      }));
    } catch (error) {
      console.error('Error getting stocks:', error);
      return [];
    }
  }

  async getAllGoals() {
    try {
      await this.ensureInitialized();
      const result = await this.db.getAllAsync('SELECT * FROM financial_goals ORDER BY deadline');
      return result.map(row => ({
        id: row.id,
        name: row.name,
        target: row.target_amount,
        current: row.current_amount,
        deadline: row.deadline
      }));
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  async updateGoalProgress(goalId, currentAmount) {
    try {
      await this.ensureInitialized();
      await this.db.runAsync(
        'UPDATE financial_goals SET current_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [currentAmount, goalId]
      );
      console.log(`Goal ${goalId} progress updated to ${currentAmount}`);
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async savePortfolioSnapshot(totalValue, totalChange, changePercent) {
    try {
      await this.ensureInitialized();
      const today = new Date().toISOString().split('T')[0];
      
      await this.db.runAsync(
        'INSERT OR REPLACE INTO portfolio_history (date, total_value, total_change, change_percent) VALUES (?, ?, ?, ?)',
        [today, totalValue, totalChange, changePercent]
      );
      
      console.log('Portfolio snapshot saved for', today);
    } catch (error) {
      console.error('Error saving portfolio snapshot:', error);
      throw error;
    }
  }

  async getPortfolioHistory(days = 30) {
    try {
      await this.ensureInitialized();
      const result = await this.db.getAllAsync(
        'SELECT * FROM portfolio_history ORDER BY date DESC LIMIT ?',
        [days]
      );
      
      return result.reverse().map(row => ({
        date: row.date,
        value: row.total_value,
        change: row.total_change,
        changePercent: row.change_percent
      }));
    } catch (error) {
      console.error('Error getting portfolio history:', error);
      return [];
    }
  }

  async getPortfolioSummary() {
    try {
      await this.ensureInitialized();
      const stocks = await this.getAllStocks();
      
      let totalValue = 0;
      let totalChange = 0;
      
      stocks.forEach(stock => {
        const positionValue = stock.shares * stock.price;
        const positionChange = stock.shares * stock.change;
        totalValue += positionValue;
        totalChange += positionChange;
      });
      
      const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
      
      return {
        totalValue,
        totalChange,
        changePercent,
        stockCount: stocks.length
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      return { totalValue: 0, totalChange: 0, changePercent: 0, stockCount: 0 };
    }
  }
}

export default new DatabaseService();
