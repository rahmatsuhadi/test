import { DataTypes, Sequelize, Model, ModelAttributes } from 'sequelize';
import { MysqlConnection } from "@/service/connection";

// Utility: Dynamically get or define a model for a table
const getModel = async (tableName: string, connection: MysqlConnection) => {
  let Model = connection.models[tableName];

  if (!Model) {
    const queryInterface = connection.getQueryInterface();
    const tableDescription = await queryInterface.describeTable(tableName);

    // Definisikan atribut untuk model
    const attributes: ModelAttributes = Object.keys(tableDescription).reduce((acc, columnName) => {
      const columnDetails = tableDescription[columnName];
      
      acc[columnName] = {
        type: DataTypes[columnDetails.type.toUpperCase() as keyof typeof DataTypes] || DataTypes.STRING,
        allowNull: columnDetails.allowNull,
        primaryKey: columnDetails.primaryKey || false,
        autoIncrement: columnDetails.autoIncrement || false,
      };
      return acc;
    }, {} as ModelAttributes); // Gunakan ModelAttributes untuk tipe yang benar

    Model = connection.define(tableName, attributes, {
      tableName,
      timestamps: false,
    });
  }

  return Model;
};

export default getModel;

