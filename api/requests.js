const RP = require('request-promise');

const favoriteBook = {
    url: process.env.NODE_ENV !== "development" ? 'https://dev.terminal.tass.ru/api/v2' : process.env.NODE_ENV,
};

class Request {
    constructor(method, data = {}, token = "") {
        this.url = favoriteBook.url;
        this.method = method;
        this.data = data;
        this.token = token;
        this.idRequest = Math.floor(Math.random() * 100) + 1;
    }

    async requstTerminaApi() {
        let bodyData =  this.encodePayload({
            method: this.method,
            jsonrpc: '2.0',
            params: this.data,
            id: this.idRequest
        });

        const props =  {
            method: 'POST',
            "rejectUnauthorized": false,
            url: this.url,
            headers: {
                'content-type': 'application/json'
            },
            body: bodyData
        };

        if(this.token) {
            props.headers['Authorization'] = this.token
        }

        return await RP(props)
            .then(function (response) {
                return JSON.parse(response)
            })
            .catch(function (err, msg) {
                console.log("ERROR", err, msg);
                return false
            });
    }

    encodePayload(payload) {
        return JSON.stringify(payload).
        replace(/[\u007F-\uFFFF]/g, function (c) {
            return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).substr(-4);
        });
    }

}

export { Request };