import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';

//Создаём экземпляр экспресса
const app = express();
const port = 3000;

const uri = 'mongodb://hrTest:hTy785JbnQ5@mongo0.maximum.expert:27423/?authSource=hrTest&replicaSet=ReplicaSet&readPreference=primary';
const dbName = 'hrTest';
const collectionName = 'stock';
//включаем поддержку CORS для всех маршрутов
app.use(cors());
//Определяем маршрут для получения данных о машинах
app.get('/api/fetchCars', async (req, res) => {
	//создаем новый клиент для подключения к mongoDB
  const client = new MongoClient(uri);

  try {
		//подключ к серверу бд
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
		//извлекаем все доки из коллекции и делаем массив.
    const cars = await collection.find().toArray();
		//отправляем клиенту данные
    res.status(200).json(cars);
  } catch (error) {
    console.error('Ошибка подключения к ДБ или получения данных', error);
    res.status(500).json({ error: 'Ошибка получения данных' });
  } finally {
    await client.close();
  }
});

//Запуск сервера и прослушивание порта
app.listen(port, () => {
  console.log(`Сервер запущен по адресу: http://localhost:${port}`);
});