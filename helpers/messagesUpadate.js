import moment from "moment"

export function getMessage(data, where) {
    const maxLengthMaterial = 4000;
    const suffix = "...";

    const {headline, lead="", source_name, news_date, slug, id, text=""} = data.message;
    const usersList = data.user_id;
    const viewKeyboard = data.message.priority !== 1 && data.message.slug !== "АЛЕРТ" && !data.message.media;
    const headlineStr = headline.replace(/(\<(\/?[^>]+)>)/g, '').toUpperCase();
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
        return {
            viewKeyboard: viewKeyboard,
            usersList: usersList,
            id: id,
            message: `${date}
                \n<b>${headlineStr}</b>
                \n${slug}
                ${leadStr}
                ${textMaterial}
                \n<i><u>${source_name}</u></i>`
        }
    }

    return {
        viewKeyboard: viewKeyboard,
        usersList: usersList,
        id: id,
        message: `${date}
                \n<b>${headlineStr}</b>
                \n${slug}
                ${textMaterial}
                \n<i><u>${source_name}</u></i>`
    }
}
