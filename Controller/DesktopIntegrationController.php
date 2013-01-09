<?php
namespace WhereGroup\DesktopIntegrationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;


class DesktopIntegrationController extends Controller {
    /**
     * 
     * @Route("/{slug}")
     * @Template()
     */
    public function diAction($slug) {
        $error = null;
        $url = $this->get('request')->get('url');
        if($url === null) {
            $error = 'Please prive a URL parameter';
        }
        
        $params = array();
        foreach($this->get('request')->query->keys() as $key) {
            if($key === 'url') {
                continue;
            }
            
            $params[$key] = $this->get('request')->get($key);
        }

        return array('data' => array(
            'bncc' => array(
                'url' => $url,
                'params' => $params,
                'error' => $error
            ),
            'slug' => $slug
        ));
    }

}

