import app from './app';
import Database from './database';

const { PORT } = process.env;

(async () => {
  const database = new Database();
  await database.getConnection();
  app.listen(PORT, () => {
    console.log(`Server listening to PORT ${PORT}`);
  });
})();
