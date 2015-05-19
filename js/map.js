var map;
var lastClickedLayer;
var tract_boundaries;
var marker;
var info;
var layerUrl = 'https://datamade.cartodb.com/api/v2/viz/9fa3a94c-fe5f-11e4-9ee6-0e9d821ea90d/viz.json';
var tableName = 'opp_index_tracts_w_data';

$(window).resize(function () {
  var h = $(window).height(),
  offsetTop = 150; // Calculate the top offset
  $('#map').css('height', (h - offsetTop));
}).resize();

(function(){
    map = L.map('map', {center: [41.85933357450051, -87.945556640625], zoom: 9});
    
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

    info = L.control({position: 'topright'});
    info.onAdd = function(map){
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    }
    
    info.update = function(props){
        var txt;
        if (typeof props !== 'undefined'){
          if (props['final'])
            txt = '<h4>'+ props['municipali'] + "<br />" + displayQuintile(props['final']) + '</h4>';
          else
            txt = '<h4>'+ props['municipali'] + "<br />No data</h4>";
          this._div.innerHTML = txt;
        }
    }

    info.clear = function(){
        this._div.innerHTML = '';
    }

    info.addTo(map);

    var cartocss = "\
    #opp_index_tracts_w_data{\
      [final = 1] {polygon-fill: " + getColor(1) + ";}\
      [final = 2] {polygon-fill: " + getColor(2) + ";}\
      [final = 3] {polygon-fill: " + getColor(3) + ";}\
      [final = 4] {polygon-fill: " + getColor(4) + ";}\
      [final = 5] {polygon-fill: " + getColor(5) + ";}\
      polygon-opacity: 0.5;\
      line-color: #FFF;\
      line-width: 0.5;\
      line-opacity: 1;\
    }"

    var subLayerOptions = {
      cartocss: cartocss,
      interactivity: 'geo_id2,final,municipali'
    }

    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        sublayer = layer.getSubLayer(0);
        sublayer.set(subLayerOptions);
        sublayer.setInteraction(true);
        sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex){
          $('#map div').css('cursor','pointer');
          info.update(data);
      })
      sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex){
          $('#map div').css('cursor','inherit');
          info.clear();
      })
      sublayer.on('featureClick', function(e, pos, latlng, data){
          getOneTract(data['geo_id2']);
      })

      window.setTimeout(function(){
        if($.address.parameter('tract_id')){
            getOneTract($.address.parameter('tract_id'))
        }
      }, 1000)

      }).on('error', function() {
        //log the error
      });

    function getOneTract(tract_id){
      if (lastClickedLayer){
        map.removeLayer(lastClickedLayer);
      }
      var sql = new cartodb.SQL({user: 'datamade', format: 'geojson'});
      sql.execute('select * from ' + tableName + ' where geo_id2 = {{tract_id}}', {tract_id:tract_id})
        .done(function(data){
            var shape = data.features[0];
            lastClickedLayer = L.geoJson(shape);
            lastClickedLayer.addTo(map);
            lastClickedLayer.setStyle({fillColor:'#f7fcb9', weight: 2, fillOpacity: 0.8, color: '#000'});
            
            map.setView(lastClickedLayer.getBounds().getCenter(), 12);
            selectParcel(shape.properties);
        }).error(function(e){console.log(e)});
    }

    function selectParcel(props){

      var info = "<div class='row'><div class='col-xs-6 col-md-12'>\
        <h2>" + props['municipali'] + " <small><br />Tract #" + props['geo_id2'] + "</small></h2>\
        <table class='table table-bordered table-condensed'><tbody>\
          <tr><td><span data-content='Composite score for access to education, employment, fiscal capacity, income, and transportation opportunities.'><h3>Opportunity Index</h3></span></td><td><h3>" + displayQuintile(props['final']) + "</h3></td></tr>\
          <tr><td><span data-content='Median market value of homes in 2010.'><i class='fa fa-home fa-fw'></i> Home value</span></td><td>" + displayQuintile(props['homeidx']) + "</td></tr>\
          <tr><td><span data-content='Percent of residents above the poverty line.'><i class='fa fa-dollar fa-fw'></i> Residents above poverty</span></td><td>" + displayQuintile(props['povertyidx']) + "</td></tr>\
          <tr><td><span data-content='Average time spent commuting to work. Includes time spent driving, walking or taking public transportation.'><i class='fa fa-subway fa-fw'></i> Job travel time</span></td><td>" + displayQuintile(props['trvlidx']) + "</td></tr>\
          <tr><td><span data-content='Percent of residents with educational degrees. Includes H.S. Diploma, Bachelors Degree and Graduate Degree.'><i class='fa fa-graduation-cap fa-fw'></i> Resident education level</span></td><td>" + displayQuintile(props['degreeidx']) + "</td></tr>\
          <tr><td><span data-content='Ease of access to job centers from this location.'><i class='fa fa-briefcase fa-fw'></i> Access to jobs</span></td><td>" + displayQuintile(props['jobidx']) + "</td></tr>\
          <tr><td><span data-content='Residents over 18 who are employed.'><i class='fa fa-pie-chart fa-fw'></i> Employment rate</span></td><td>" + displayQuintile(props['unempidx']) + "</td></tr>\
          ";
          
      info += "</tbody></table></div></div>";

      $.address.parameter('tract_id', props.geo_id2)
      $('#tract-info').html(info);
      $('#tract-info span').popover({trigger: "hover", placement: "left"})
    }

    function displayQuintile(val){
        if (val == 0)
            return "No data";

        else {
            var stars = Array( val + 1 ).join( "<i class='fa fa-star'></i> " );
            return stars;
        }
    }

    function getColor(val) {
        switch (val) {
            case 1: return "#edf8e9";
            case 2: return "#bae4b3";
            case 3: return "#74c476";
            case 4: return "#31a354";
            case 5: return "#006d2c";
            default: return "#cccccc";
        }
    }

    $('#search_address').geocomplete()
      .bind('geocode:result', function(event, result){
        if (typeof marker !== 'undefined'){
            map.removeLayer(marker);
        }

        var search_address = $('#search_address').val();
        var currentPinpoint = [result.geometry.location.lat(), result.geometry.location.lng()]
        marker = L.marker(currentPinpoint).addTo(map);

        var sql = new cartodb.SQL({user: 'datamade', format: 'geojson'});
        sql.execute('select geo_id2, the_geom from ' + tableName + ' where ST_Intersects( the_geom, ST_SetSRID(ST_POINT({{lng}}, {{lat}}) , 4326))', {lat:currentPinpoint[0], lng:currentPinpoint[1]})
        .done(function(data){
            // console.log(data);
            getOneTract(data.features[0].properties.geo_id2)
        }).error(function(e){console.log(e)});

        $.address.parameter('address', encodeURI(search_address));
      });

    $("#search").click(function(){
      $('#search_address').trigger("geocode");
    });

    var address = convertToPlainString($.address.parameter('address'));
    if(address){
        $("#search_address").val(address);
        $('#search_address').geocomplete('find', address)
    }

    function convertToPlainString(text) {
      if (text == undefined) return '';
      return decodeURIComponent(text);
    }
})()
