import app from './app';
import Database from './database';

const { PORT } = process.env;
const database = new Database();
database.getConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening to PORT ${PORT}`);
  });
});
