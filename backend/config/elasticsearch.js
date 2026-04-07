const { Client } = require('@elastic/elasticsearch');

let esClient = null;
let isElasticsearchAvailable = false;

const connectElasticsearch = async () => {
    try {
        esClient = new Client({
            node: process.env.ELASTICSEARCH_URL || 'https://localhost:9200',
            auth: {
                username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
                password: process.env.ELASTICSEARCH_PASSWORD || ''
            },
            requestTimeout: 5000,
            maxRetries: 1,
            tls: {
                rejectUnauthorized: false
            }
        });


        const health = await esClient.cluster.health();
        isElasticsearchAvailable = true;
        console.log(`Elasticsearch Connected: ${health.cluster_name} (status: ${health.status})`);


        const indexExists = await esClient.indices.exists({ index: 'products' });
        if (!indexExists) {
            await esClient.indices.create({
                index: 'products',
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 0,
                        analysis: {
                            analyzer: {
                                product_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'trim']
                                }
                            }
                        }
                    },
                    mappings: {
                        properties: {
                            name: { type: 'text', analyzer: 'product_analyzer' },
                            brand: { type: 'text', analyzer: 'product_analyzer' },
                            description: { type: 'text', analyzer: 'product_analyzer' },
                            category: { type: 'keyword' },
                            categorySlug: { type: 'keyword' },
                            price: { type: 'float' },
                            highlights: { type: 'text' },
                            specifications: { type: 'object', enabled: true }
                        }
                    }
                }
            });
            console.log('Elasticsearch: "products" index created');
        }
    } catch (error) {
        isElasticsearchAvailable = false;
        console.warn('Elasticsearch not available - falling back to MongoDB search');
        console.warn(`Reason: ${error.message}`);
    }
};

const getESClient = () => esClient;
const isESAvailable = () => isElasticsearchAvailable;

module.exports = { connectElasticsearch, getESClient, isESAvailable };
