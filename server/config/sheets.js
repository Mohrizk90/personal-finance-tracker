const { google } = require('googleapis');

class SheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = process.env.SHEET_ID;
  }

  async readSheet(sheetName, range = 'A:Z') {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
      });
      return response.data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }

  async appendRow(sheetName, values) {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error appending row:', error);
      throw error;
    }
  }

  async updateRow(sheetName, rowIndex, values) {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating row:', error);
      throw error;
    }
  }

  async deleteRow(sheetName, rowIndex) {
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: await this.getSheetId(sheetName),
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex,
                },
              },
            },
          ],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting row:', error);
      throw error;
    }
  }

  async getSheetId(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
      return sheet ? sheet.properties.sheetId : null;
    } catch (error) {
      console.error('Error getting sheet ID:', error);
      throw error;
    }
  }

  // Helper method to convert array data to objects
  arrayToObjects(data, headers) {
    if (!data || data.length === 0) return [];
    return data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  // Helper method to convert object to array
  objectToArray(obj, headers) {
    return headers.map(header => obj[header] || '');
  }
}

module.exports = new SheetsService();
