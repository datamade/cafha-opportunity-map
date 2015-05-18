var map;
var lastClicked;
var tract_boundaries;
var marker;

(function(){
    map = L.map('map', {center: [41.73237975329554, -87.857666015625], zoom: 9});
    
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        detectRetina: true
    }).addTo(map);

    // var googleLayer = new L.Google('ROADMAP', {animate: false});
    // map.addLayer(googleLayer);
    // map.on('zoomstart', function(e){
    //     map.removeLayer(tract_boundaries);
    //     if (typeof marker !== 'undefined'){
    //         map.removeLayer(marker);
    //     }
    // })
    // google.maps.event.addListener(googleLayer._google, 'idle', function(e){
    //     map.addLayer(tract_boundaries);
    //     if (typeof marker !== 'undefined'){
    //         map.addLayer(marker);
    //     }
    // })

    // var info = L.control({position: 'bottomleft'});
    // info.onAdd = function(map){
    //     this._div = L.DomUtil.create('div', 'info');
    //     return this._div;
    // }

    var cartocss = "\
    #opp_index_tracts_w_data{\
      [final = 1] {polygon-fill: #ffffcc;}\
      [final = 2] {polygon-fill: #a1dab4;}\
      [final = 3] {polygon-fill: #41b6c4;}\
      [final = 4] {polygon-fill: #2c7fb8;}\
      [final = 5] {polygon-fill: #253494;}\
      polygon-opacity: 0.5;\
      line-color: #FFF;\
      line-width: 0.5;\
      line-opacity: 1;\
    }"

    // cartodb stuff here
    var layerUrl = 'https://datamade.cartodb.com/api/v2/viz/fea272cc-fd7c-11e4-8975-0e853d047bba/viz.json';
    
    var subLayerOptions = {
      cartocss: cartocss
    }

    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        layer.getSubLayer(0).set(subLayerOptions);
      }).on('error', function() {
        //log the error
      });


    // $('#search_address').geocomplete()
    //   .bind('geocode:result', function(event, result){
    //     if (typeof marker !== 'undefined'){
    //         map.removeLayer(marker);
    //     }
    //     var lat = result.geometry.location.lat();
    //     var lng = result.geometry.location.lng();
    //     marker = L.marker([lat, lng]).addTo(map);
    //     map.setView([lat, lng], 17);
    //     var district;
    //     district = leafletPip.pointInLayer([lng, lat], tract_boundaries);

    //     $.address.parameter('address', encodeURI($('#search_address').val()));
    //     district[0].fire('click');
    //   });

    // $("#search").click(function(){
    //   $('#search_address').trigger("geocode");
    // });

    // var address = convertToPlainString($.address.parameter('address'));
    // if(address){
    //     $("#search_address").val(address);
    //     $('#search_address').geocomplete('find', address)
    // }

    // function convertToPlainString(text) {
    //   if (text == undefined) return '';
    //   return decodeURIComponent(text);
    // }

    // function addCommas(nStr) {
    //     nStr += '';
    //     x = nStr.split('.');
    //     x1 = x[0];
    //     x2 = x.length > 1 ? '.' + x[1] : '';
    //     var rgx = /(\d+)(\d{3})/;
    //     while (rgx.test(x1)) {
    //       x1 = x1.replace(rgx, '$1' + ',' + '$2');
    //     }
    //     return x1 + x2;
    //   }
})()
