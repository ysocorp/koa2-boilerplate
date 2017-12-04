const PGUSER = process.env.PGUSER || 'postgres';
const PGHOST = process.env.PGHOST || '127.0.0.1';
const DATABASE_NAME = process.env.DATABASE_NAME || 'apibase';
const DATABASE_URL = 'postgres://postgres:@127.0.0.1/apibase';

module.exports = function gruntFile(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell: {
      create_db: {
        command: `createdb -p 5432 -U ${PGUSER} -h ${PGHOST} ${DATABASE_NAME}`,
      },
      create_db_test: {
        command: `createdb -p 5432 -U ${PGUSER} -h ${PGHOST} ${DATABASE_NAME}_test`,
      },
      db_create_migrate: {
        command: model => `
          echo ${model};
          ./node_modules/.bin/sequelize model:create \
          --name ${model} \
          --models-path ./src/models/ \
          --migrations-path ./src/db/migrations/ \
          --attributes foo:string
        `,
      },
      db_migrate: {
        command: `
          ./node_modules/.bin/sequelize db:migrate \
          --migrations-path ./src/db/migrations/ \
          --url ${DATABASE_URL}
        `,
      },
      pg_clean: {
        command: [
          "listdrop=\"select 'drop table if exists ' || tablename || ' cascade;' as tables_to_drop from pg_tables where schemaname = 'public';\"",
          'echo $listdrop',
          `output=$( psql -h localhost -p 5432 -U postgres -d ${DATABASE_NAME} -t -c "$listdrop") `,
          'echo "-------------DROP---------------"',
          'echo $output',
          'echo "-------------!DROP---------------"',
          `psql -h localhost -p 5432 -U postgres -d ${DATABASE_NAME} -c "$output"`,
        ].join(' && '),
      },
      pg_drop: {
          command: `dropdb -p 5432 -U ${PGUSER} -h ${PGHOST} ${DATABASE_NAME}`,
      },
      pg_drop_test: {
          command: `dropdb -p 5432 -U ${PGUSER} -h ${PGHOST} ${DATABASE_NAME}_test`,
      },
    },
  });

  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('db-create', ['shell:create_db']);
  grunt.registerTask('db-create-test', ['shell:create_db_test']);

  grunt.registerTask('pg-drop', ['shell:pg_drop']);
  grunt.registerTask('pg-drop-test', ['shell:pg_drop_test']);
  grunt.registerTask('pg-clean', ['shell:pg_clean']);


  grunt.registerTask('db-create-migrate', (model) => {
    grunt.task.run(`shell:db_create_migrate:${model}`);
  });
  grunt.registerTask('db-migrate', ['shell:db_migrate']);
};
