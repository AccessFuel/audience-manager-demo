define(function (require) {
    var $ = require('jquery');

    var Utils = require('utils/global');

    var ZipCache;
    var Defaults = {

    };

    var _getCache = function(key) {
        var cache = window.localStorage.getItem(key);
        return cache ? JSON.parse(cache) : {};
    };

    var _getLangLong = function(item, callback) {
        // Normalize ZIP-code
        var zip = parseInt(item.label).toString();

        // Use local storage as acache
        if (ZipCache[zip]) {
            callback(item, ZipCache[zip]);
            console.log('Loaded ZIP-code coordinates from local storage', zip, ZipCache[zip]);
        } else {
            var geocoder = new window.google.maps.Geocoder();

            geocoder.geocode( {'address': zip}, function(results, status) {
                if (status == window.google.maps.GeocoderStatus.OK) {
                    var position = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };

                    ZipCache[zip] = position;

                    window.localStorage.setItem('ZipCache', JSON.stringify(ZipCache));

                    console.log('Loaded ZIP-code coordinates from google API', zip, position);
                    callback(item, position);
                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }
    };

    var _drawCirle = function(map, item, position) {
        var zipCircle = new window.google.maps.Circle({
            strokeColor: '#81c684',
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: '#81c684',
            fillOpacity: 0.75,
            map: map,
            center: position,
            radius: Math.sqrt(item.pct) * 3000
        });
    };


    var _parseData = function(data) {
        return data.slice(0, 10);
    };


    var _create = function(data, param) {
        var $canvas = $('<div>', {
            class: 'af-google-map'
        });

        // Dalay. Canvas should be rendered to get its width and height correctly
        window.setTimeout(function() {
            requirejs(['google'], function() {

                var map = new window.google.maps.Map($canvas.get(0), {
                    center: data[0].position,
                    streetViewControl: false,
                    mapTypeId: window.google.maps.MapTypeId.TERRAIN,
                    zoom: 12,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.google.maps.ControlPosition.RIGHT_TOP
                    }
                });

                $.each(data, function(i, item) {
                    // Add the circle for this city to the map.
                    _getLangLong(item, function(item, position) {
                        _drawCirle(map, item, position);

                        // Center map
                        if (i === 0) {
                            var center = new window.google.maps.LatLng(position.lat, position.lng);
                            map.panTo(center);
                        }
                    });
                });
            });
        });

        return $canvas;
    };


    var init = function(data, options) {
        if (!data) {
            return false;
        }

        ZipCache = _getCache('zipCache');

        var param = $.extend({}, Defaults, options);
        var reportData = _parseData(data);

        return _create(reportData, param);
    };

    return init;
});