const fetch = require('node:fetch');

(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/expenses');
    console.log('STATUS', response.status);
    const body = await response.text();
    console.log('BODY', body);
  } catch (error) {
    console.error('REQUEST ERROR', error);
    process.exit(1);
  }
})();
