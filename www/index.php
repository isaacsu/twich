<?php $CLIENT = '' ?>

<?php

	include '_config.php';

	$room =  isset($_GET["room"]) ? $_GET["room"] : ""; 

	$host =  $_SERVER['SERVER_NAME'];

	$protocol = "http://";

	$node_url = 'http://' . $_SERVER['SERVER_NAME'] . ':' . $config->port;

    if (strstr($_SERVER['QUERY_STRING'], '&logout')) {

        header('Location: http://' . $_SERVER['SERVER_NAME'] . '/' . $_GET['room']);

    } 



?>

    <head>

        <?php include '_head.php' ?>

    </head>

    <body>

        <div id="app"> <?php include '_app.php' ?> </div> 



        <script type='text/javascript'>

			/*CONFIG = function() {

				this.subtwich = '';

				this.host = '';

				this.room = '';

				this.port = '';

				this.protocol = '';

				this.node_url = '';

				this.autouser = '';		

			};*/

            CONFIG.subtwich = '<?php echo subtwich($_SERVER['HTTP_HOST'])?>';

            CONFIG.room = '<?php echo $room ?>';

            CONFIG.host = '<?php echo $host ?>';

            CONFIG.port = '<?php echo $config->port ?>';

            CONFIG.protocol = '<?php echo $protocol ?>';

            CONFIG.node_url = '<?php echo $node_url ?>';

            <?php if (strstr($_SERVER['QUERY_STRING'], '&autouser')) { ?>

                CONFIG.autouser = '<?php echo str_replace(" ", "_", $_GET['autouser']) ?>';

            <?php } else { ?>

                CONFIG.autouser = '';

            <?php } ?>

                

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
