(function($) {

    $.widget("wheregroup.wgDesktopIntegration", {
        connector: null,
        
        _create: function() {
            // BNCConnector
            var self = this;
            this.connector = new BNCConnector("c1");
            this.connector.listen = function(who, data) {
                self._announce({
                    sender: who,
                    data: data
                });
            };
            
            $(document).one('mapbender.setupfinished', $.proxy(this._mapbenderSetupFinished, this));
        },

        _mapbenderSetupFinished: function() {
            var url = document.URL;
            
            if (url.indexOf("?") !== -1) {
                    url = url.substr(url.indexOf("?") + 1);
                    this._announce({
                        sender: undefined,
                        data: url
                    });
            }
        },
        
        _announce: function(data) {
            $(document).trigger('desktopintegrationin', data);
        },

        _destroy: $.noop
    });

})(jQuery);
