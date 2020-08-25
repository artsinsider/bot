const TelegramBot = require('node-telegram-bot-api');
const config = require("config");
import * as API from "./api/server"

import {users} from './api/server';

const port = config.get("PORT");
const TOKEN = config.get("TOKEN");
const URL = config.get("URL");
const bot = new TelegramBot(TOKEN, {
    webHook: {
        port: port,
        autoOpen: false
    }
});

bot.openWebHook();
bot.setWebHook(`${URL}/bot${TOKEN}`);

API.serverInit();

export function sendNessageBot(userId, data, params) {
    bot.sendMessage(userId, data, params)
}
export function sendDocument(userId, data, params) {
    bot.sendDocument(userId, data, params)
}

function addNewUser(msg) {
    users[msg.from.id] = {
        id: msg.from.id,
        first_name: msg.chat.first_name,
        last_name: msg.chat.last_name
    };
    console.log("Add new user ", users)
}

bot.onText(/\/user_list (.+)/, function (msg, match) {
    var fromId = msg.from.id; // Получаем ID отправителя
    console.log('USER_LIST', msg, fromId);
    bot.sendMessage(fromId, JSON.stringify(users));
});

bot.onText(/\/start (.+)/, (msg, [src, match]) => {
    const {chat: {id}} = msg;
    console.log('START', id, match);
    API.telegramLinkTerminalUser(id, match);
    if(!users[id]) addNewUser(msg);
    bot.sendMessage(id,
        "<b><strong>Мы очень рады что вы выбрали Терминал ТАСС!</strong></b>\n" +
        "Свежие новости только для вас без СМС и регистрации."
    , { parse_mode: "HTML" })
});



bot.on('callback_query', async function (msg) {
    const data = msg.data.split("_");
    const userId = `${msg.from.id}` ;
    const messageId = +data[1];


    switch(data[0]) {
        case 'TEXT':
             const mess = await API.telegramTerminalGetMaterial(userId, messageId);
            bot.sendMessage(userId, mess.message, { parse_mode: "HTML" })
            return;

        case 'PDF':
            const pdf = await API.telegramTerminalGetMaterialPDF(userId, messageId);
            // bot.sendDocument()
            return

        default: return
    }

});


bot.onText(/\/exampless (.+)/, (msg) => {
    const {chat: {id}} = msg;
    const htmlExample = "" +
        "<b>bold</b>, <strong>bold</strong>\n" +
        "<i>italic</i>, <em>italic</em>\n" +
        "<u>underline</u>, <ins>underline</ins>\n" +
        "<s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del>\n" +
        "<b>bold <i>italic bold <s>italic bold strikethrough</s> <u>underline italic bold</u></i> bold</b>\n" +
        "<a href=\"http://www.example.com/\">inline URL</a>\n" +
        "<a href=\"tg://user?id=123456789\">inline mention of a user</a>\n" +
        "<code>inline fixed-width code</code>\n" +
        "<pre>pre-formatted fixed-width code block</pre>\n" +
        "<pre><code class=\"language-python\">pre-formatted fixed-width code block written in the Python programming language</code></pre>"

    bot.sendMessage(id, htmlExample, { parse_mode: "HTML" })
});