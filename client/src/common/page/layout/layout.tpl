<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <script>
            window._jHeadStart = ( new Date() ).getTime();
            window.tplConf = {
                user : {{ user | default(null) | dump | safe }}
            };

        </script>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        {# 360 浏览器就会在读取到这个标签后，立即切换对应的极速核 #}
        <meta name="renderer" content="webkit">

        {% block header_content %}
            <meta name="keywords" content="">
            <meta name="description" content="">
            <title>{{ title }}</title>
        {% endblock %}

        <link rel="shortcut icon" type="image/x-icon" href="/client/static/img/favicon.ico" />

        <!--  输出css 文件  -->

        <% for (var css in htmlWebpackPlugin.files.css) { %>
            <link href="<%= htmlWebpackPlugin.files.css[css] %>" rel="stylesheet">
        <% } %>


        {% block block_head_css %}

        {% endblock %}

        {# common js #}
        
        <!-- 放置输出的JS chunks -->
        <% for (var file in htmlWebpackPlugin.files.js) { %>
            <script src="<%= htmlWebpackPlugin.files.js[file] %>"></script>
        <% } %>
        <!-- 放置输出的JS chunks end -->


        {% block block_head_js %}
        {% endblock %}

    </head>

    <body>


        <div class="main-content">

            {% block block_body %}
            {% endblock %}

        </div>
        {# 增加调试相关方法 #}

        {# 页面的JS,放在body结束的入口 #}
        {% block block_body_js %}

        {% endblock %}

        {% block block_before_body_end %}

        {% endblock %}
    </body>

</html>
