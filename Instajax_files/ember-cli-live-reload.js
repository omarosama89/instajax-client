(function() {
  var srcUrl = null;
  var host= location.hostname || 'localhost';
  var liveReloadPort = 49152;
  var defaultPort = location.protocol === 'https:' ? 443 : 80;
  var port = liveReloadPort || location.port || defaultPort;
  var path = '';
  var prefixURL = (location.protocol || 'http:') + '//' + host + ':' + 49152;
  var src = srcUrl || prefixURL + '/livereload.js?port=' + port + '&host=' + host + path;
  var script    = document.createElement('script');
  script.type   = 'text/javascript';
  script.src    = src;
  document.getElementsByTagName('head')[0].appendChild(script);
}());