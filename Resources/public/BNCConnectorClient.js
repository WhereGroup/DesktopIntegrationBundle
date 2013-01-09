$(document).ready(function() {
    
    function bbgZoom(x, y) {
        var olmap = $('.mb-element-map').data('mbMap').map.olMap;
        olmap.moveTo(new OpenLayers.LonLat(x,y),7);
    }

    function bbgParseURL(url) {
        var rows = url.split("&");
        
        for(var i=0;i<rows.length;i++) {
            var tmp = rows[i].split("=");
            var key = tmp[0];
            var val = decodeURIComponent(tmp[1]).split(",");
            
            switch(key) {
                case "zoom" :
                    bbgZoom(val[0], val[1]);
                    break;
                case "find" :
                    bbgFind(val[0], val[1], val[2]);
                    break;
            }
        }
    }

    // First start    
    $(document).bind('mapbender.setupfinished', function() {
        var url = document.URL;
            if (url.indexOf("?") !== -1) {
                    url = url.substr(url.indexOf("?") + 1);

                    bbgParseURL(url);
            }
    });
    
    
    // BNCConnector
    connector = new BNCConnector("c1");
    connector.listen = function(who, url) {
        bbgParseURL(url);
    };
});