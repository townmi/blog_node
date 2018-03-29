{% if not (theme.duoshuo and theme.duoshuo.shortname)
  and not theme.duoshuo_shortname
  and not theme.disqus_shortname
  and not theme.hypercomments_id
  and not theme.gentie_productKey %}

  <!-- UY BEGIN
  {% if theme.youyan_uid %}
    {% set uid = theme.youyan_uid %}
  {% endif %}

  {% if (page.comments and theme.youyan_uid) %}
    <script type="text/javascript" src="//v2.uyan.cc/code/uyan.js?uid={{uid}}"></script>
    
  {% endif %}
  <script charset="utf-8" type="text/javascript" src="https://changyan.sohu.com/upload/changyan.js" ></script>
  <script type="text/javascript">
    window.changyan.api.config({
    appid: 'cytwssn1R',
    conf: 'prod_c131cc77cd155e9a4cdbf21dcccbcde6'
    });
  </script>
  -->
  <script type="text/javascript">
    var clientId = '03a91c17261c902d6173';
    var clientSecret = '03ca14a8e211364001023781c19667e84ce65d64';
    var paths = decodeURIComponent(window.location.pathname).split("/")
    try {
      var gitment = new Gitment({
        id:  paths.length - 2 > -1 ? paths[paths.length - 2] : paths[paths.length - 1],
        owner: 'townmi',
        repo: 'blog_node',
        oauth: {
          client_id: clientId,
          client_secret: clientSecret,
        },
      });
      gitment.render('comments');
    } catch(e) {
    }
  </script>
{% endif %}
