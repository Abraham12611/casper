import { GenericActionCtx, GenericQueryCtx, GenericMutationCtx } from "convex/server";
import { query } from "./_generated/server";

export const authComponent = {
  getAuthUser: async (ctx: GenericQueryCtx<any> | GenericMutationCtx<any> | GenericActionCtx<any>) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return {
      _id: identity.subject,
      id: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? "",
      image: identity.pictureUrl ?? "",
    };
  }
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});
