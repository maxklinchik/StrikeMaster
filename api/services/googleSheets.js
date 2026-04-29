import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function authorize() {
  const credentialsPath = path.join(process.cwd(), '..', 'strikemaster-credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Google credentials file not found at ' + credentialsPath);
  }
  
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  
  return auth;
}

// Convert column letter to index (A=0, B=1, ..., Z=25, AA=26, etc.)
function columnLetterToIndex(letter) {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return index - 1;
}

export async function getRankingsFromSheet(spreadsheetId, range = 'Rankings!A:Z') {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    const values = result.data.values || [];
    
    if (values.length === 0) {
      console.log('No data found in sheet');
      return [];
    }
    
    // Convert rows to objects with headers
    const headers = values[0];
    const rankings = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return rankings;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    throw error;
  }
}

// Get specific columns from a sheet
export async function getRankingsByColumns(spreadsheetId, sheetName, columnLetters) {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const range = `${sheetName}!A:Z`;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    const values = result.data.values || [];
    
    if (values.length === 0) {
      return [];
    }
    
    // Convert column letters to indices
    const columnIndices = columnLetters.map(col => columnLetterToIndex(col));
    
    // Get headers
    const headers = values[0];
    const selectedHeaders = columnIndices.map(idx => headers[idx] || '');
    
    // Extract only selected columns and skip header row
    const rankings = values.slice(1).map((row, index) => {
      // Skip empty rows and summary rows (like "Best" row)
      if (!row[0] || row[0].toString().trim() === '' || row[0].toString().trim() === 'Best' || row[0].toString().trim() === '# at Best') {
        return null;
      }
      
      const obj = {};
      columnIndices.forEach((colIdx, headerIdx) => {
        obj[selectedHeaders[headerIdx]] = row[colIdx] || '';
      });
      
      return obj;
    }).filter(row => row !== null);
    
    return rankings;
  } catch (error) {
    console.error('Error fetching columns from Google Sheets:', error);
    throw error;
  }
}
