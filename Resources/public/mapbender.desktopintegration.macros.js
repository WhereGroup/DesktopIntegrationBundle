$(document).bind('desktopintegrationin', function(event, data) {
        var cmd = unescape(data.data)
        if('mapbender:' === cmd.substr(0,10)) {
            var macro = cmd.substr(10).split('=');
            switch(macro[0]) {
                // Example zoomTo macro
                case 'zoomTo':
                    var x, y, s,
                        map = $('.mb-element.olMap'),
                        coords = macro[1].split(',');
                        
                    if(coords.length > 1) {
                        x = parseFloat(coords[0]);
                        y = parseFloat(coords[1]);
                    }
                    
                    map.data('mbMap').map.olMap.moveTo(new OpenLayers.LonLat(x, y));
                    
                    if(coords.length > 2) {
                        s = parseFloat(coords[2]);
                        map.data('mbMap').map.olMap.zoomToScale(s);
                    }                    
                    break;
            }
        }
});
