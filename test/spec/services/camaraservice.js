'use strict';

describe('Service: camaraService', function () {

  // load the service's module
  beforeEach(module('firebaseApp'));

  // instantiate service
  var camaraService;
  beforeEach(inject(function (_camaraService_) {
    camaraService = _camaraService_;
  }));

  it('should do something', function () {
    expect(!!camaraService).toBe(true);
  });

});
