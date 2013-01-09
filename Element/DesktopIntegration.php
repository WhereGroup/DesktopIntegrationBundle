<?php

namespace WhereGroup\DesktopIntegrationBundle\Element;

use Mapbender\CoreBundle\Component\Element;

class DesktopIntegration extends Element
{
    public static function getClassTitle()
    {
        return 'Desktop integration';
    }

    public static function getClassDescription()
    {
        return 'Desktop integration via BNCConnector.';
    }

    public static function getClassTags()
    {
        return array('desktop', 'integration');
    }

    public function getAssets()
    {
        return array(
            'js' => array(
                'BNCConnector.js',
                'mapbender.element.desktopintegration.js'
            ),
            'css' => array()
        );
    }

    public static function getDefaultConfiguration()
    {
        return array();
    }

    public function getWidgetName()
    {
        return 'wheregroup.wgDesktopIntegration';
    }

    public function render()
    {
        return $this->container->get('templating')
            ->render('WhereGroup:DesktopIntegrationBundle:Element:desktopintegration.html.twig', array(
                'id' => $this->getId()));
    }
}

