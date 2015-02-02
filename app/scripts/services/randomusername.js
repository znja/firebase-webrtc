'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.randomUsername
 * @description
 * # randomUsername
 * Service in the firebaseApp.
 */
angular.module('firebaseApp')
  .service('randomUsernameService', function () {
    this.get = function () {
      return 'Del_Fuego_' + _.random(0, 666);
    };
  });
