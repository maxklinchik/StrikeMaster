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
