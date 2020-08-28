import moment from "moment"

export function getMessage(data, where) {
    const maxLengthMaterial = 4000;
    const suffix = "...";
    let result = {};
    if (!where) {
        result = {...data}
    } else {
        result = {...data.message}
    }

    const {headline, lead="", source_name, news_date, slug, id, text="", media, priority} = result;
    const usersList = data.user_id;
    const viewKeyboard = priority !== 1 && slug !== "�~P�~[�~U�| Т" && !media;
    const headlineStr = headline.replace(/(\<(\/?[^>]+)>)/g, '');
    let leadStr = lead && `\n${lead.replace(/(\<(\/?[^>]+)>)/g, '')}`;
    let textMaterial = text && `\n${text.replace(/(\<(\/?[^>]+)>)/g, '')}`;
    const date = moment(news_date * 1000).locale("ru").format('D MMMM YYYY, HH:mm');

    const lengthHeadLine = headlineStr.length;
    const lengthLead = leadStr.length;
    const lengthDate = date.length;
    const lengthMaterial = textMaterial.length;
    const lengthSuffix = suffix.length;

    if(lengthLead > 1000) {
        leadStr = leadStr.slice(0, 300);
        leadStr = leadStr + suffix
    }

    if(lengthMaterial > maxLengthMaterial || maxLengthMaterial < lengthMaterial + lengthHeadLine - lengthLead - lengthDate - lengthSuffix) {
        textMaterial = textMaterial.slice(0,maxLengthMaterial - lengthHeadLine - lengthLead - lengthDate - suffix.length);
        textMaterial = textMaterial + suffix
    }

    if(where === "queue") {
        const text = textMaterial ? `\n${textMaterial}\n`: "\n";
        const structMessage = [
            `${date}\n<b>${headlineStr}</b>\n${slug}\n${leadStr}`,
            text,
            `<i><u>${source_name}</u></i>`
        ];

        return {
            viewKeyboard: viewKeyboard,
            usersList: usersList,
            id: id,
            message: structMessage.join("")
        }
    } else {
        return {
            viewKeyboard: viewKeyboard,
            usersList: usersList,
            id: id,
            message: `${date}\n<b>${headlineStr}</b>\n${slug}
                ${textMaterial}
                \n<i><u>${source_name}</u></i>`
        }
    }
}
