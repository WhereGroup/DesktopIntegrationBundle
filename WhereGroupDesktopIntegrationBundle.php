<?php

namespace WhereGroup\DesktopIntegrationBundle;

use Mapbender\CoreBundle\Component\MapbenderBundle;

class WhereGroupDesktopIntegrationBundle extends MapbenderBundle 
{
    public function getElements() 
    {
        return array(
            'WhereGroup\DesktopIntegrationBundle\Element\DesktopIntegration'
        );
    }
}
