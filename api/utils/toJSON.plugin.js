/**
 * Global Mongoose plugin that transforms all model JSON output to:
 *  - rename _id → id
 *  - remove __v
 *
 * Register once via mongoose.plugin(toJSONPlugin) and every model inherits it.
 */
const toJSONPlugin = (schema) => {
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshSessions;
      return ret;
    },
  });
};

export default toJSONPlugin;
