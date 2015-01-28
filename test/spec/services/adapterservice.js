'use strict';

describe('Service: adapterService', function () {

  // load the service's module
  beforeEach(module('firebaseApp'));

  // instantiate service
  var adapterService;
  beforeEach(inject(function (_adapterService_) {
    adapterService = _adapterService_;
  }));

  it('should do something', function () {
    expect(!!adapterService).toBe(true);
  });

});
