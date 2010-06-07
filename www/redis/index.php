<?php
/*    function nulser($v) { return $v; }

    define('LB',"\n");
    require_once ('Rediska.php');
    require_once ('Rediska/Key.php');

    $op = array(
        'namespace' => '',
        'servers'   => array(
            array('host' => '127.0.0.1', 'port' => 6379)
        ),
        'serializer' => 'nulser',
        'unserializer' => 'nulser'
    );

    $rediska = new Rediska($op);
    $key = new Rediska_Key('abc');
    //echo $key->getValue() . LB;
    $key->setValue($_GET['a']);

    echo $rediska->get('abc') . ' [' . gettype($rediska->get('abc')) . ']';
 */?>
<html>
<body>

<h1>Log in</h1>

<form method='get' action='authenticate.php'>
<label>Username:</label>
<input type='text' name='username' />
<input type='submit' value='login' />
</form>
</body>
</html>
