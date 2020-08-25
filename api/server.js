const Koa = require("koa");
const Router = require('@koa/router');
const BodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const config = require("config");

import {getMessage}     from "../helpers/messagesUpadate";
import {sendNessageBot, sendDocument} from "../index";
import {Request}        from '../api/requests';

const app = new Koa();
const router = Router();

app.use(BodyParser());
// app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

export let users = {
    '312417759': { id: 312417759, first_name: 'Egor', last_name: 'Didenko' },
    '332388515': { id: 332388515, first_name: 'Daniil', last_name: 'Gusev' },
    '128978712':{ id: 128978712, first_name: 'Pavel', last_name: 'Chobotov' },
    '251376433': { id: 251376433,first_name: '[ixapek]',last_name: 'Водяков Игорь'}
};

let queue = [];
let temporary= {};

function queueChange(que) {
    if(que.length) {
        const messageID = que[0].id;
        const usersList = que[0].usersList;
        const viewKeyboard = que[0].viewKeyboard;
        const message = que[0].message;
        let props = { parse_mode: "HTML" };

        // !!!! тут косяк нет данных полей , новость уже модифицированна!!!!
        //console.log(message, message.slug !== "АЛЕРТ" , !message.media)

        if(viewKeyboard) {
            props["reply_markup"] = JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Полный текст новости ', callback_data: `TEXT_${messageID}` }],
                    [{ text: 'PDF', callback_data: `PDF_${messageID}` }],
                ]
            });
        }

        for(let i = 0; i < usersList.length; i ++) {
            sendNessageBot(usersList[i], message, props)
        }
        que.shift();
        return que
    }
    return []
}

setInterval(()=> { queue = queueChange(queue)}, 10000);

router.get('/login/:id', async ctx =>{
    const login  = new Request("User.login", {password: "123qwe", username: "u4@u.ru"});
    const data = await login.requstTerminaApi();
    console.log('data',data);
    if(data) {
        ctx.status = 200;
        ctx.body = {
            data,
            success: true
        }
    }
});

router.post('/news',(ctx, next) =>{
    const data =  ctx.request.body;

    console.log("/news - data", data.user_id)
    ctx.status = 200;
    queue.push(getMessage(data, "queue"));
    // ctx.body = JSON.stringify(ctx.request.body);
    ctx.body = {
        message_send: "OK",
        data
    }

    // next()
});

// router.post('/users', koaBody(),
//     (ctx) => {
//         console.log(ctx.request.body);
//         // => POST body
//         ctx.body = JSON.stringify(ctx.request.body);
//     }
// );


async function telegramAuthTerminalBot() {
    const pass = config.get("TERMINAL_BOT_PASS");
    const name = config.get("TERMINAL_BOT_NAME");
    const login  = new Request("Telegram.auth", {name: name, password: pass});
    const data = await login.requstTerminaApi();
    if(data) {
        temporary.JWT = data.result.jwt;
        console.log('data',data.result);
    }
}
export async function telegramLinkTerminalUser(id, key) {
    const token = `${temporary.JWT}`;
    const login  = new Request("Telegram.link", {telegram_user_id: `${id}`, telegram_start_key: `${key}`}, token);
    const data = await login.requstTerminaApi();
    if(data) {
        console.log('data',data);
    }
}

export async function telegramTerminalGetMaterial(userId, materialId) {
    const token = `${temporary.JWT}`;
    const login  = new Request("Telegram.material", {material_id: +materialId, telegram_user_id: userId+""}, token);
    const data = await login.requstTerminaApi();
    if(data) {
        return getMessage(data.result.material)
    }
}

export async function telegramTerminalGetMaterialPDF(userId, materialId) {
    const token = `${temporary.JWT}`;
    const login  = new Request(
        "Telegram.materialExport",
        {
            telegram_user_id: userId+"",
            materials:[+materialId],
            format:"pdf_file",
            lang:"ru",
            name:null
        },
        token);
    const data = await login.requstTerminaApi();
    if(data) {
        sendDocument(userId, data.result.url, {contentType: 'application/pdf'});
    }
}

export function serverInit() {
    app.listen(3005, () => {
        console.log(`Listening on port - ${3005}`);
        telegramAuthTerminalBot()
    });
}

