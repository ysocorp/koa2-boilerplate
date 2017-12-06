import config from 'config';
import { jsonwebtoken as jwt } from 'koa-smart/utils';

import { ENUM_TYPE } from '../models/TableTokens'

const configJWT = config.jsonwebtoken;

async function addUserToCtx(ctx) {
  const token = ctx.get('Authorization');
  if (token) {
    try {
      const user = jwt.verify(token, configJWT.privateKey);
      const isConsumable = await ctx.models.tokens.isConsumable({
        entity_id: user.id,
        token,
        type: ENUM_TYPE.LOGIN,
      });
      if (isConsumable && user.loginTokenVersion === config.loginTokenVersion) {
        ctx.state.user = user;
      }
    } catch (error) { } // eslint-disable-line no-empty
  }
}

function loginUser(ctx) {
  return async (user) => {
    const userToRegister = {
      id: user.id,
      usergroup_id: user.usergroup_id,
      loginTokenVersion: config.loginTokenVersion,
    };
    const token = jwt.sign(userToRegister, configJWT.privateKey, configJWT.options);
    await ctx.models.tokens.createLogin({ entity_id: user.id, token });
    ctx.state.user = userToRegister;
    ctx.body.token = token;
    ctx.body.expires = userToRegister.expires;
    return { token, expires: userToRegister.expires };
  };
}

function logoutUser(ctx) {
  return async () => {
    const token = ctx.get('Authorization');
    if (token) {
      await ctx.models.tokens.consumeOne({ token });
    }
    ctx.state.user = undefined;
  };
}


export default async (ctx, next) => {
  await addUserToCtx(ctx);
  ctx.loginUser = loginUser(ctx);
  ctx.logoutUser = logoutUser(ctx);
  await next();
};
