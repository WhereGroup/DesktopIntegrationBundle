(function($) {

    $.widget("wheregroup.wgDesktopIntegration", {
        options: {
            url: ''
        },

        _create: function() {
            this.options.url = document.URL;        
            
            // BNCConnector
            connector = new BNCConnector("c1");
            connector.listen = function(who, url) {
                this._parseParams(url);
            };
            
            $(document).one('mapbender.setupfinished', $.proxy(this._mapbenderSetupFinished, this));
        },

        _mapbenderSetupFinished: function() {
            var url = this.options.url;
            
            if (url.indexOf("?") !== -1) {
                    url = url.substr(url.indexOf("?") + 1);
                    this._parseParams(url);
            }
        },
        
        _parseParams: function(url) {
            var rows = url.split("&");

            for(var i=0;i<rows.length;i++) {
                var tmp = rows[i].split("=");

                if(tmp[0] == "url") {
                    continue;
                }
                
                jQuery.trigger(tmp[0], tmp[1]);
                break;
            }
        },

        _destroy: $.noop
    });

})(jQuery);

