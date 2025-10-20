const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.json');

class DatabaseManager {
  constructor() {
    this.data = { users: [], barcodes: [], nextUserId: 1, nextBarcodeId: 1 };
    this.loadDatabase();
    console.log('Connected to JSON database');
  }

  loadDatabase() {
    try {
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = { users: [], barcodes: [], nextUserId: 1, nextBarcodeId: 1 };
    }
  }

  saveDatabase() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // User methods
  async createUser(username, hashedPassword) {
    const user = {
      id: this.data.nextUserId++,
      username,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };
    
    this.data.users.push(user);
    this.saveDatabase();
    return user.id;
  }

  async getUserByUsername(username) {
    return this.data.users.find(user => user.username === username) || null;
  }

  async getUserById(id) {
    return this.data.users.find(user => user.id === parseInt(id)) || null;
  }

  // Barcode methods
  async createBarcode(filename, originalName, filePath, uploadedBy) {
    const barcode = {
      id: this.data.nextBarcodeId++,
      filename,
      original_name: originalName,
      file_path: filePath,
      is_used: 0,
      amount: 0,
      uploaded_by: uploadedBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data.barcodes.push(barcode);
    this.saveDatabase();
    return barcode.id;
  }

  async getAllBarcodes() {
    return this.data.barcodes.map(barcode => {
      const user = this.data.users.find(u => u.id === barcode.uploaded_by);
      return {
        ...barcode,
        uploaded_by_username: user ? user.username : 'Unknown'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getBarcodeById(id) {
    const barcode = this.data.barcodes.find(b => b.id === parseInt(id));
    if (!barcode) return null;
    
    const user = this.data.users.find(u => u.id === barcode.uploaded_by);
    return {
      ...barcode,
      uploaded_by_username: user ? user.username : 'Unknown'
    };
  }

  async updateBarcode(id, isUsed, amount) {
    const barcodeIndex = this.data.barcodes.findIndex(b => b.id === parseInt(id));
    if (barcodeIndex === -1) return false;
    
    this.data.barcodes[barcodeIndex].is_used = isUsed;
    this.data.barcodes[barcodeIndex].amount = amount;
    this.data.barcodes[barcodeIndex].updated_at = new Date().toISOString();
    
    this.saveDatabase();
    return true;
  }

  async deleteBarcode(id) {
    const barcodeIndex = this.data.barcodes.findIndex(b => b.id === parseInt(id));
    if (barcodeIndex === -1) return false;
    
    this.data.barcodes.splice(barcodeIndex, 1);
    this.saveDatabase();
    return true;
  }

  close() {
    this.saveDatabase();
  }
}

// Create and export a single instance
const database = new DatabaseManager();

module.exports = database;