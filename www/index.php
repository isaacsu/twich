<?php $CLIENT = '' ?>
<?php 
    if (strstr($_SERVER['QUERY_STRING'], '&logout')) {
        header('Location: http://' . $_SERVER['SERVER_NAME'] . '/' . $_GET['room']);
    }
    include '_config.php' ?>
    <head>
        <?php include '_head.php' ?>
    </head>
    <body>
        <div id="app"> <?php include '_app.php' ?> </div> 

        <script type='text/javascript'>
            CONFIG.room = '<?php echo $_GET['room']?>';
            CONFIG.host = '<?php echo $_SERVER['SERVER_NAME']?>';
            CONFIG.port = '<?php echo $PORT ?>';
            CONFIG.protocol = '<?php echo 'http://' ;?>';
            CONFIG.node_url = '<?php echo 'http://' . $_SERVER['SERVER_NAME'] . ':' . $PORT; ?>';

            $(document).ready(function() {
                resizeLog();
                if (CONFIG.debug) {
                    scrollDown();
                }
            });
            $(window).bind('resize',function() {
                resizeLog();
            });
        </script>
        <?php include '_analytics.php' ?>
    </body>
</html>
