'use strict';

describe('Service: randomUsername', function () {

  // load the service's module
  beforeEach(module('firebaseApp'));

  // instantiate service
  var randomUsername;
  beforeEach(inject(function (_randomUsername_) {
    randomUsername = _randomUsername_;
  }));

  it('should do something', function () {
    expect(!!randomUsername).toBe(true);
  });

});
