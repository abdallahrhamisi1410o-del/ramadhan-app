const { google } = require('googleapis');

const SPREADSHEET_ID = '1z1GZTLCVAenITW_5QVHcZGElor5mfrxn8AXmDw4ncqI';

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

async function getAllDaysData(email) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Submissions!A2:F',
  });
  
  const allDays = {};
  response.data.values?.forEach(row => {
    if (row[1] === email) {
      const day = parseInt(row[2]);
      const activityId = parseInt(row[3]);
      const checked = row[4] === 'TRUE';
      
      if (!allDays[day]) allDays[day] = [];
      allDays[day].push({ id: activityId, checked });
    }
  });
  
  return allDays;
}

async function getSubmissions(email, day) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Submissions!A2:F',
  });
  
  const submissions = [];
  response.data.values?.forEach(row => {
    if (row[1] === email && parseInt(row[2]) === day) {
      submissions.push({ id: parseInt(row[3]), checked: row[4] === 'TRUE' });
    }
  });
  
  return submissions;
}

async function saveSubmissions(email, day, activities) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const rows = activities.map(act => [
    new Date().toISOString(),
    email,
    day,
    act.id,
    'TRUE',
    act.points,
  ]);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Submissions!A:F',
    valueInputOption: 'RAW',
    resource: { values: rows },
  });
}

module.exports = { getAllDaysData, getSubmissions, saveSubmissions };
