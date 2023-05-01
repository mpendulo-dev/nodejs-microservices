import { AppDataSource } from './data-source';
import { Product } from './entity/Product';
import * as express from 'express';
import * as cors from 'cors';
import { createConnection} from 'typeorm'
import { Request, Response } from 'express'
require('dotenv').config()
import * as amqp from 'amqplib/callback_api'

createConnection().then(db => {
	const productRepository = db.getRepository(Product)

	amqp.connect(process.env.RABBITMQ_URL, (err, connection) => {
			if(err) {
				throw err
			}
			connection.createChannel((error,channel) => {
				if(error) {
					throw error
				}
				console.log("Database successful connected ☁")
				const app = express();
				const PORT = 8000;

				app.use(cors({}));
				app.use(express.json());


				//endpoints
				app.get('/api/products', async (req: Request, res: Response) => {
					const products = await productRepository.find();
					res.json(products);
				})

				app.post('/api/product', async (req: Request, res: Response) => {
					const product = await productRepository.create(req.body)
					const results = await productRepository.save(product)
					channel.sendToQueue('product-created', Buffer.from(JSON.stringify(results)))
					return res.send(results);
				})
				app.get('/api/product/:id', async (req: Request, res: Response) => {
					const product = await productRepository.findOne({where: {id: req.params.id}});
					return res.send(product);
				})

				app.put('/api/product/:id', async (req: Request, res: Response) => {
					const product = await productRepository.findOne({where: {id: req.params.id}})
					productRepository.merge(product, req.body)
					const results = await productRepository.save(product)
					channel.sendToQueue('product-updated', Buffer.from(JSON.stringify(results)))
					return res.send(results);
				})
				app.delete('/api/product/:id', async (req: Request, res: Response) => {
					const results = await productRepository.delete(req.params.id)
					channel.sendToQueue('product-deleted', Buffer.from(req.params.id))
					return res.send(results);
				})
				app.post('/api/products/:id/like', async (req: Request, res: Response) => {
					const product = await productRepository.findOne({where: {id: req.params.id}})
					product.likes++
					const results = await productRepository.save(product)
					return res.send(results);
				})
				app.listen(PORT, () => {
					console.log(`Listening on port ${PORT}`);
				});
				process.on('beforeExit', () => {
					console.log('closing')
					connection.close();
				})
			})
	})

}).catch(error => console.log(error));

// AppDataSource.initialize()
// 	.then(async () => {
// 		console.log('Database successful connected');
// 		// const product = new Product();
// 		// product.title = 'Test';
// 		// product.image = 'testlink.com';
// 		// product.likes = 25;
// 		// await AppDataSource.manager.save(product);
// 		// console.log('Saved a new user with id: ' + product.id);
//
//
// 	})
// 	.catch(error => console.log(error));
