import { AppDataSource } from './data-source';
import { Product } from './entity/Product';
import * as express from 'express';
import * as cors from 'cors';
import { createConnection} from 'typeorm'
import { Request, Response } from 'express'
import * as amqp from 'amqplib/callback_api'


createConnection().then(db => {
	const productRepository = db.getMongoRepository(Product)


	amqp.connect('amqps://gfjabeit:QFaGClYPbSKQ4hh1vPXUJg2dXNTmdii5@moose.rmq.cloudamqp.com/gfjabeit', (err, connection) => {
			if(err) {
				throw err
			}
			connection.createChannel((error,channel) => {
				if(error) {
					throw error
				}

				channel.assertQueue('product-created', {durable: false})
				channel.assertQueue('product-updated', {durable: false})
				channel.assertQueue('product-deleted', {durable: false})

				console.log("Database successful connected ☁")
				const app = express();
				const PORT = 8001;

				app.use(cors({}));
				app.use(express.json());

				channel.consume('product-created', async (msg) =>{
					const eventProduct: Product = JSON.parse(msg.content.toString());
					console.log(msg.content.toString());
					const product = new Product();
					product.admin_id = parseInt(eventProduct.id);
					product.title = eventProduct.title
					product.image = eventProduct.image
					product.likes = eventProduct.likes
					await productRepository.save(product);
					console.log('product created')
				}, {noAck: true});
				channel.consume('product-updated', async (msg) => {
					const eventProduct: Product = JSON.parse(msg.content.toString());
					const product = await productRepository.findOne({where : {admin_id: parseInt(eventProduct.id)}})
					productRepository.merge(product, {
						title: eventProduct.title,
						image: eventProduct.image,
						likes: eventProduct.likes
					});
					await productRepository.save(product);
					console.log('product updated')
				}, {noAck: true})
				channel.consume('product-deleted', async (msg) => {
					const admin_id = parseInt(msg.content.toString())
					await productRepository.deleteOne({admin_id})

					console.log('product deleted')
				}, {noAck: true})

				app.listen(PORT, () => {
					console.log(`Listening on port ${PORT}`);
				});
				//stop RM server
				process.on('beforeExit', () => {
					console.log('closing')
					connection.close();
				})
			})
	})

}).catch(error => console.log(error));
