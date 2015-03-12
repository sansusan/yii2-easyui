# yii2-easyui
Jquery Easyui plugin for Yii2 (http://www.jeasyui.com/)

## Installation
add
```
"sansusan/yii2-easyui": "dev-master"
```
to the require section of your composer.json file.

## Usage

Add asset bundle on layout/view

```
use sansusan\easyui\EasyuiAsset;
EasyuiAsset::register($this,
    ['theme' => 'metro-gray', 'locale' => 'easyui-lang-ru'],
    ['datagrid-groupview']
);
```
