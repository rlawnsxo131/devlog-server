import app from './app';
import Database from './database';

const { PORT } = process.env;

app.listen(PORT, async () => {
  const database = new Database();
  await database.getConnection();
  console.log(`Server listening to PORT ${PORT}`);
});
