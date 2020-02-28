const Diary = require('../Models/diary')
const User = require('../Models/user')
const Wares = require('../Models/wares');
const Deals = require('../Models/deal');
const Comment = require('../Models/comment');


exports.add = async ctx => {
    if (ctx.token.error == 0) {
        // 商品id          ctx.request.body.ware
        let uid = ctx.token.decode_token.id;
        bodyData.from = uid;
        const data = await new Deals(bodyData)
            .save()
            .then(res => res);
        ctx.body = {
            error: 0,
            data,
        };
    } else {
        ctx.body = {
            error: 1,
            data: 0,
        };
    }
};

exports.list = async ctx => {
    if (ctx.token.error == 0) {
        const uid = ctx.token.decode_token.id;
        const data = await Deals
            .find({ author: uid })
            .populate({
                path: 'ware',
                select: '_id img_url title content type area money see recentlytime commentNum',
                populate: {
                    path: 'from',
                    select: '_id username avatar',
                },
            });
        ctx.body = {
            data,
            error: 0
        }
    } else {
        ctx.body = {
            data: 0,
            error: 1
        }
    }
};

// 取消收藏
exports.reduce = async ctx => {
    if (ctx.token.error == 0) {
        const id = ctx.params.id;
        const data = await Deals.deleteOne({ _id: id }).exec();
        ctx.body = {
            data,
            error: 0
        }
    } else {
        ctx.body = {
            data: 0,
            error: 1
        }
    }
};