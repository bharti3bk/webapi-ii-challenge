const server = require('./server.js');

const port = 1000;
server.listen(port, () => {
    console.log(`server is listening on ${port}`)
}) 
