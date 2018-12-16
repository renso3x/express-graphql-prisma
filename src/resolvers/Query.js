const { forwardTo } = require('prisma-binding');

const Query = {
  expenses: forwardTo('db'),
  expense: forwardTo('db'),
  todos: forwardTo('db'),
  todo: forwardTo('db'),
  me(parent, args, ctx, info) {
    //check if ther e is a current user Id
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info);
  },
};

module.exports = Query;
