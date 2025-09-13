// api/calendar.js
const { google } = require('googleapis');

module.exports = async (req, res) => {
  try {
    // 🔐 Autenticación con cuenta de servicio
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/calendar.readonly']
    );

    await auth.authorize();

    // 📅 Acceder al calendario
    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // 🧹 Formatear eventos para el frontend
    const events = response.data.items.map(event => ({
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error al acceder a Google Calendar:', error.message);
    res.status(500).json({ error: 'No se pudo cargar el calendario' });
  }
};
