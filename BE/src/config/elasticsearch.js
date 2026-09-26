/**
 * Elasticsearch Configuration & Client Manager
 * Seamless connection with Graceful Fallback for Local/VPS deployment
 */

let client = null;
let isElasticsearchConnected = false;

const initElasticsearch = async () => {
  const elasticUrl = process.env.ELASTICSEARCH_URL || process.env.ELASTIC_URL;
  
  if (!elasticUrl) {
    console.log('[Elasticsearch] ELASTICSEARCH_URL is not set. Operating in Native Smart Search Engine mode.');
    return null;
  }

  try {
    const { Client } = require('@elastic/elasticsearch');
    client = new Client({
      node: elasticUrl,
      auth: process.env.ELASTIC_API_KEY ? { apiKey: process.env.ELASTIC_API_KEY } : undefined,
    });

    const ping = await client.ping();
    if (ping) {
      isElasticsearchConnected = true;
      console.log(`[Elasticsearch] Connected successfully to Cluster at ${elasticUrl}`);
    }
  } catch (error) {
    isElasticsearchConnected = false;
    console.warn(`[Elasticsearch] Connection failed: ${error.message}. Falling back to Native Smart Search Engine.`);
  }

  return client;
};

const getElasticClient = () => client;
const isConnected = () => isElasticsearchConnected;

module.exports = {
  initElasticsearch,
  getElasticClient,
  isConnected,
};
