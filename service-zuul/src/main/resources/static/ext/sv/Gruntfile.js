module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
         options: {
             stripBanners: true
         },
         dist: {
             src: [
                 "sv_ajax_request.js",
                 "sv_ext.js",
                 "sv_component_loader.js",
                 "search_trigger.js",
                 "portlet.js",
                 "advancedVType.js",
                 "sv_form_combobox.js",
                 "sv_ext_query.js",
                 "sv_ext_month_field.js",
                 "sv_activiti_toolar.js",
                 "sv_file_upload.js"
             ],
             dest: "../sv_all-debug.js"
         }
     },
    uglify: {
      options: {
      },
      dist: {
             files: {
                 '../sv_all.js': '../sv_all-debug.js'
             }
         }
    },
    cssmin: {
         options: {
             keepSpecialComments: 0
         },
         compress: {
             files: {
                 '../sv_all.css': [
                     "portlet.css",
                     "sv_activiti_toolar.css",
                     "sv_file_upload.css"
                 ]
             }
         }
     }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');


  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
}