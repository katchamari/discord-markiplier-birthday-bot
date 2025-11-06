const _ = require("lodash");

module.exports = (doc, body = {}) => {
  if (!doc || typeof doc !== "object") return;

  // $pull
  if (body.$pull) {
    for (const [path, value] of Object.entries(body.$pull)) {
      const arr = _.get(doc, path);
      if (Array.isArray(arr)) {
        if (typeof arr.pull === "function") arr.pull(value);
        else {
          const idx = arr.indexOf(value);
          if (idx !== -1) arr.splice(idx, 1);
        }
      }
    }
  }

  // $push
  if (body.$push) {
    for (const [path, value] of Object.entries(body.$push)) {
      const arr = _.get(doc, path);
      if (Array.isArray(arr)) arr.push(value);
      else _.set(doc, path, [value]);
    }
  }

  // $set
  if (body.$set) {
    for (const [path, value] of Object.entries(body.$set)) {
      _.set(doc, path, value);
    }
  }

  // $inc
  if (body.$inc) {
    for (const [path, value] of Object.entries(body.$inc)) {
      const current = _.get(doc, path) ?? 0;
      _.set(doc, path, current + value);
    }
  }

  // plain assignments
  Object.keys(body)
    .filter((k) => !k.startsWith("$"))
    .forEach((key) => _.set(doc, key, body[key]));
};
