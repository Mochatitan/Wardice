export default {
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://66.94.108.155:3000',
                ws: true,
            },
        },
    },
};
