<?php
/**
 * Created by PhpStorm.
 * User: sansusan
 * Date: 12.03.2015
 * Time: 13:26
 */

namespace sansusan\easyui;

use Yii;
use yii\web\AssetBundle;

class EasyuiAsset extends AssetBundle
{

    public $sourcePath = '@sansusan/easyui/assets/jquery-easyui-1.4.2';
    public $css = [
        'themes/icon.css',
        'themes/color.css'
    ];
    public $js = [
        'jquery.easyui.min.js',
    ];
    public $depends = [
        'yii\web\YiiAsset'
    ];

    /**
     * @var string
     */
    public static $theme = 'default';

    /**
     * @var string
     */
    public static $locale = 'easyui-lang-ru';

    /**
     * @var array
     */
    public static $extensions = [];


    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->applyTheme();
        $this->applyLocale();
        $this->applyExtensions();
        parent::init();
    }


    protected function applyTheme()
    {
        if (!empty(self::$theme) && is_string(self::$theme))
            $theme = self::$theme;
        else
            $theme = 'default';
        array_push($this->css, strtr('themes/{theme}/easyui.css', ['{theme}' => $theme]));
    }


    protected function applyLocale()
    {
        if (!empty(self::$locale) && is_string(self::$locale))
            $locale = self::$locale;
        else
            $locale = 'easyui-lang-ru';
        array_push($this->js, strtr('locale/{locale}.js', ['{locale}' => $locale]));
    }


    protected function applyExtensions()
    {
        foreach (self::$extensions as $ex) {
            if (is_string($ex)) {
                $folder = '';
                switch (trim($ex)) {
                    case 'datagrid-bufferview':
                    case 'datagrid-defaultview':
                    case 'datagrid-detailview':
                    case 'datagrid-scrollview':
                    case 'datagrid-groupview':
                        $folder = 'jquery-easyui-datagridview';
                        break;
                    case 'datagrid-dnd':
                    case 'datagrid-filter':
                    case 'treegrid-dnd':
                        $folder = $ex;
                        break;
                    case 'dwrloader':
                        $folder = 'jquery-easyui-dwrloader';
                        break;
                    case 'jquery.edatagrid':
                        $folder = 'jquery-easyui-edatagrid';
                        break;
                    case 'jquery.etree':
                    case 'jquery.etree.lang':
                        $folder = 'jquery-easyui-etree';
                        break;
                    case 'jquery.pivotgrid':
                        $folder = 'jquery-easyui-pivotgrid';
                        break;
                    case 'jquery.portal':
                        $folder = 'jquery-easyui-portal';
                        break;
                    case 'jquery.ribbon':
                        $folder = 'jquery-easyui-ribbon';
                        break;
                    case 'easyui-rtl':
                        $folder = 'jquery-easyui-rtl';
                        break;
                }
                if (!empty($folder))
                    array_push($this->js, strtr('extensions/{folder}/{ex}.js', ['{folder}' => $folder, '{ex}' => $ex]));
            }
        }
    }

    /**
     * @param \yii\web\View $view
     * @param array $options
     * @param array $extensions
     * @return static
     */
    public static function register($view, $options = [], $extensions = [])
    {
        if (is_array($options)) {
            if (array_key_exists('theme', $options)) self::$theme = $options['theme'];
            if (array_key_exists('locale', $options)) self::$locale = $options['locale'];
        }

        if (is_array($extensions) && !empty($extensions)) self::$extensions = $extensions;
        return parent::register($view);
    }


}