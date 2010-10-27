<?php
class Configuration {

    var $port = 443;
    var $domain = 'twich.me';
    var $analyticsAccount = 'UA-46664-21';
    var $analyticsDomainName = '.twich.me';

}

$config = new Configuration();

function subtwich($_s) {
    $host_arr = explode(".",$_s);
    array_pop($host_arr);
    array_pop($host_arr);
    return implode('.',$host_arr);
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
