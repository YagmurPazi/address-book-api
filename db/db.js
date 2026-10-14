// In-memory database: every table keeps its rows in a Map keyed by id.
// Nothing is written to disk, so a restart (or redeploy) resets all data.
class InMemoryTable {
  constructor() {
    this.rows = new Map();
    this.nextId = 1;
  }

  all() {
    return [...this.rows.values()];
  }

  get(id) {
    return this.rows.get(id);
  }

  insert(values) {
    const id = this.nextId++;
    const row = { ...values, id };
    this.rows.set(id, row);
    return row;
  }

  update(id, values) {
    const existing = this.rows.get(id);
    if (!existing) return null;

    const row = { ...existing, ...values, id };
    this.rows.set(id, row);
    return row;
  }

  delete(id) {
    return this.rows.delete(id);
  }
}

const db = {
  contacts: new InMemoryTable(),
};

module.exports = db;
