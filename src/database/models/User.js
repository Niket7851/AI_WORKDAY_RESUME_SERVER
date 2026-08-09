'use strict';

const { DataTypes } = require('sequelize');

const defineUser = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [1, 255],
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
        },
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
      indexes: [{ unique: true, fields: ['email'] }],
    }
  );

  return User;
};

module.exports = defineUser;