const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.development') });

async function checkDb() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    const maxConnRes = await client.query("SHOW max_connections;");
    console.log('MAX_CONNECTIONS:', maxConnRes.rows[0].max_connections);

    const activeConnRes = await client.query("SELECT count(*), state FROM pg_stat_activity GROUP BY state;");
    console.log('ACTIVE_CONNECTIONS_SUMMARY:', JSON.stringify(activeConnRes.rows));

    const processesRes = await client.query("SELECT pid, usename, datname, client_addr, state, query FROM pg_stat_activity;");
    console.log('PROCESSES_START');
    console.log(JSON.stringify(processesRes.rows, null, 2));
    console.log('PROCESSES_END');

  } catch (err) {
    console.error('DB diagnostic error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDb();
