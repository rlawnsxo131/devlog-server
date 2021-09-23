import { app, apollo } from './app';
import Database from './database';

const { PORT } = process.env;
const database = new Database();
database.getConnection().then(async () => {
  await apollo.start();
  apollo.applyMiddleware({ app, cors: false });
  app.listen(PORT, () => {
    console.log(`Server listening to PORT ${PORT}`);
  });
});
