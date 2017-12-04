import ErrorApp from '../../utils/ErrorApp';

async function handleError(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.status = ctx.status !== 500 ? ctx.status : 400;
    ctx.body = { message: err.message };
    if (!(err instanceof ErrorApp)) {
      ctx.body = { message: ctx.state.__('Please contact the support') };
    }
    const arraySequelize = ['SequelizeValidationError', 'SequelizeUniqueConstraintError'];
    if (arraySequelize.includes(err.name) || err.toTranslate) {
      const message = err.message.split(':').pop();
      ctx.body.message = ctx.state.__(message);
    }
    throw err;
  }
}

export default handleError;
