var http = require('http');
var server = http.createServer(async (req, res) => {
    const decodedUrl = decodeURI(req.url);
    if(req.method == 'GET') {
        res.end(decodedUrl);
        return;
    }
    else if (req.method == 'POST') {
        var data = [];
        for await (const chunk of req){
            data.push(chunk);
        };
        var result = Buffer.concat(data).toString();
        res.end(result);
        return;
    }
})

if(process.argv.length > 2) {
    var port = process.argv[2]
} else {
    var port = 8080
}
server.listen(port)
console.log('Server running on port ' + port)