'use strict';

const { DataTypes } = require('sequelize');

const defineResumeSkill = (sequelize) => {
  const ResumeSkill = sequelize.define(
    'ResumeSkill',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resumeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Resumes', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { len: [1, 255] },
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'ResumeSkills',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }],
    }
  );

  return ResumeSkill;
};

module.exports = defineResumeSkill;