'use strict';

describe('Service: adapter', function () {

  // load the service's module
  beforeEach(module('firebaseApp'));

  // instantiate service
  var adapter;
  beforeEach(inject(function (_adapter_) {
    adapter = _adapter_;
  }));

  it('should do something', function () {
    expect(!!adapter).toBe(true);
  });

});
