MapbenderDesktopIntegrationBundle documentation
===============================================

* :doc:`installation`

Usage
-----

After you followed the installation and added the DesktopIntegration element to
your application, you can then use the element by calling the "di" route:

http://example.com/mapbender/di/mapbender_user?a=3

This will open the application called "mapbender_user" and pass the string after
the question mark to the element. This will trigger an event named
"desktopintegrationin" on the document and pass an data object with two
attributes "sender" and "data".

"sender" will contain the sender id which is undefined if Mapbender needed to
start up and the two-digit sender id if Mapbender was already running. "data"
contains the string from after the question mark ("a=3" for example). Using this
data is up to your application.

One default macro is defined:

http://example.com/mapbender/di/mapbender_user?mapbender:zoomTo=12,52,5000000

will zoom to the coordinate and scale provided.
