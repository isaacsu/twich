<?php $CLIENT = 'mobilesafari' ?>
<?php include '_config.php' ?>
    <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="minimum-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no" /> 
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <?php include '_head.php' ?>

        <style type='text/css'>
            html{-webkit-text-size-adjust:none;-webkit-touch-callout:none;height:100%}
            #connect {
                width:100%;
                font-size:12px;
            }
            #connect h1 {
                font-size:20px;
            }

            #connect p {
                font-size:12px;
                line-height:14px;
            }   

            #connect label {
                display:block;
                clear:both;
            }

            #connect #nickInput {
                padding:3px;
                font-size:12px;
            }

            #connect #connectButton {
                height:auto;
                font-size:12px;
                width:auto;
            }

            .footnote {
                display:none;
            }
            
            div.disclaimer {
                display:none;
            }

            #app #logwrap {
                position:relative;
                z-index:1;
                width:100%;
                height:200px;
                overflow:scroll;
            }

            #toolbar #entry {
                padding:3px;
                border-width:1px;
                outline-width:1px;
                background:#fff;
                margin-top:5px;
                margin-left:4px;
                font-size:16px;
                color:#000;
            }

            #entry-btn {
                font-size:14px;
                display:inline !important;
            }

            #toolbar {
                background:#777;
                height:57px;
            }
            #toolbar #status {
                /*display:none !important;*/
            }
        </style>
    </head>
    <body onload="">
        <div id="app"> <?php include '_app.php' ?> </div> 

        <script type='text/javascript'>
            CONFIG.room = '<?php echo $_GET['room']?>';
            CONFIG.host = '<?php echo $_SERVER['SERVER_NAME']?>';
            CONFIG.port = '<?php echo $PORT ?>';
            CONFIG.client = 'mobilesafari';
            CONFIG.protocol = '<?php echo 'http://' ;?>';
            CONFIG.node_url = '<?php echo 'http://' . $_SERVER['SERVER_NAME'] . ':' . $PORT; ?>';
        </script>

        <script type='text/javascript'>
                var myScroll;

                function loaded() {
                    myScroll = new iScroll('log');
                }
                $(document).ready(function() {
                    loaded();
                    window.addEventListener('orientationchange',updateSizes);
                    window.addEventListener('resize',updateSizes);
                    $('#entry').bind('focus', function() {
                        myScroll.scrollToMax('1000ms');
                    });
                    
                });

                function updateSizes() {
                    $('#logwrap').height(($(window).height() - 57 -3) + "px");
                    $('#entry').width(($(window).width() - 90) + "px");
                    setTimeout(function(){myScroll.scrollToMax('1000ms');},1000);
                }
        </script>
        <?php include '_analytics.php' ?>
    </body>
</html>
