import axios from 'axios';

const serverApi = axios.create({
    baseURL:
        process.env.API_SERVER_URL ||
        'http://localhost:5000/api/v1',

    headers: {
        'Content-Type': 'application/json',
    },

    timeout: 10000,
});

export default serverApi;