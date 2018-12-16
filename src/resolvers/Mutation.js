const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserId } = require('../utils');

const Mutations = {
  async createExpense(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    const userId = getUserId(ctx);
    console.log(userId);
    if (!userId) {
      throw new Error('You should be logged in!');
    }

    const expense = await ctx.db.mutation.createExpense(
      {
        data: {
          //add relationship
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args,
        },
      },
      info
    );

    return expense;
  },
  updateExpense(parent, args, ctx, info) {
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateExpense(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteExpense(parent, args, ctx, info) {
    const where = { id: args.id };

    return ctx.db.mutation.deleteExpense({ where }, info);
  },

  async createTodo(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You should be logged in!');
    }

    const item = await ctx.db.mutation.createTodo(
      {
        data: {
          //add relationship
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args,
        },
      },
      info
    );

    return item;
  },
  updateTodo(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateTodo(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteTodo(parent, args, ctx, info) {
    const where = { id: args.id };
    return ctx.db.mutation.deleteTodo({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
        },
      },
      `{ id name email password }`
    );
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // Finalllllly we return the user to the browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });

    if (!user) {
      return {
        error: {
          field: 'email',
          msg: 'No user found',
        }
      }
    }

    //check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return {
        error: {
          field: 'password',
          msg: 'Invalid password',
        }
      }
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    return {
      payload: {
        token,
        user,
      }
    }
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: "GoodBye!" };
  },
};

module.exports = Mutations;
