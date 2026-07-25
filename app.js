const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from the Jenkins CI/CD demo app!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
