import chalk from 'chalk';
import ErrorApp from '../../utils/ErrorApp';

async function logger(ctx, next) {
  const start = new Date();
  try {
    console.log(`${chalk.bgBlue(start)} -  ${chalk.bold(ctx.method)} ${ctx.url} START`);
    await next();
  } catch (err) {
    let msg = err;

    const arraySequelize = ['SequelizeValidationError', 'SequelizeUniqueConstraintError'];
    if (err instanceof ErrorApp || arraySequelize.includes(err.name)) {
      msg = `${err.name}: ${err.message}`;
    }
    console.error(chalk.red('[ERROR]'), `${chalk.bold(ctx.method)} ${ctx.url}`, msg);
  } finally {
    const ms = new Date() - start;
    console.log(`${chalk.inverse(start)} - ${chalk.black.bgBlue.bold(ctx.status)} ${chalk.bold(ctx.method)} ${ctx.url} - ${chalk.green(ms)} ms`);
  }
}

export default logger;
