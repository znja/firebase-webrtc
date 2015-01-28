'use strict';

describe('Service: webrtcFactory', function () {

  // load the service's module
  beforeEach(module('firebaseApp'));

  // instantiate service
  var webrtcFactory;
  beforeEach(inject(function (_webrtcFactory_) {
    webrtcFactory = _webrtcFactory_;
  }));

  it('should do something', function () {
    expect(!!webrtcFactory).toBe(true);
  });

});
