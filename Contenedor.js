class Contenedor {
  constructor(knexConf, tableName) {
    this.knex = require('knex')(knexConf);
    this.tableName = tableName;
    //yo ya no le asigno el id, lo asigna la DB
    this.listObjectsInTable = [];
  }

  async save(myArticles) {
    try {
      await this.knex(this.tableName).insert(myArticles);
    } catch (err) {
      console.log(err);
    }
  }

  async getById(id) {
    try {
      const articuloRaw = await this.knex.from(this.tableName).where({ id: id });
      const articuloJson = await JSON.parse(JSON.stringify(articuloRaw))[0];
      if (articuloJson) {
        return articuloJson;
      }
      return null;
    } catch (err) {
      console.log(err);
    }
  }

  async getAll() {
    try {
      const articulosRaw = await this.knex.from(this.tableName).select('*');
      const articulosJson = await JSON.parse(JSON.stringify(articulosRaw));
      if (articulosJson.length) {
        return articulosJson;
      }
      return null;
    } catch (err) {
      console.log(err);
    }
  }

  async updateById(id, updatedData) {
    const article = await this.getById(id);
    try {
      if (article) await this.knex.from(this.tableName).where({ id: id }).update(updatedData);
    } catch (err) {
      console.log(err);
    }
  }

  async deleteById(id) {
    const article = await this.getById(id);
    try {
      if (article) await this.knex.from(this.tableName).where({ id: id }).del();
    } catch (err) {
      console.log(err);
    }
  }

  async deleteAll() {
    try {
      await this.knex.from(this.tableName).del();
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = { Contenedor };
