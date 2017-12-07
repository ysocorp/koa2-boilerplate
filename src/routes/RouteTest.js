import Route from './Route';

export default class RouteTest extends Route {
  constructor(params) {
    super({ ...params });
  }

  @Route.Get({ accesses: [Route.accesses.public] })
  async groups(ctx) {
    const data = await this.models.usergroups.list();
    const groups = data.filter(elemt => elemt.id !== this.GROUPS.ADMIN_ID);
    this.sendOk(ctx, groups);
  }

  @Route.Get({ accesses: [Route.accesses.admin] })
  async admin(ctx) {
    const data = await this.models.usergroups.list();
    const groups = data.filter(elemt => elemt.id !== this.GROUPS.ADMIN_ID);
    this.sendOk(ctx, groups);
  }

  @Route.Get({ accesses: [Route.accesses.client] })
  async client(ctx) {
    const data = await this.models.usergroups.list();
    const groups = data.filter(elemt => elemt.id !== this.GROUPS.ADMIN_ID);
    this.sendOk(ctx, groups);
  }

  @Route.Get({ accesses: [Route.accesses.connected] })
  async connected(ctx) {
    const data = await this.models.usergroups.list();
    const groups = data.filter(elemt => elemt.id !== this.GROUPS.ADMIN_ID);
    this.sendOk(ctx, groups);
  }
}
