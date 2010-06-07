<?php include '_config.php' ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="minimum-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no" name="viewport" />
        <?php include '_head.php' ?>
    </head>
    <body>
        <div id="app">
            <?php include '_app.php' ?>
        </div> 

        <script type='text/javascript'>
            CONFIG.room = '<?php echo $_GET['room']?>';
            CONFIG.host = '<?php echo $_SERVER['SERVER_NAME']?>';
            CONFIG.port = '<?php echo $PORT ?>';
            CONFIG.protocol = '<?php echo 'http://' ;?>';
            CONFIG.node_url = '<?php echo 'http://' . $_SERVER['SERVER_NAME'] . ':' . $PORT; ?>';
        </script>
        <?php include '_analytics.php' ?>
    </body>
</html>
