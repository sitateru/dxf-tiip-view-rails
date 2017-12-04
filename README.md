Gemfile
```
gem 'dxf_tiip_view', path: 'dxf_tiip_view'
```

routes.rb

```
#DXF Tiip View
#It must be mounted at /dxf_tiip_view, otherwise it will not work (want a fix)
mount DxfTiipView::Engine, at: '/dxf_tiip_view'
```

```
%div.tiip= dxf_tiip 'a[href*=".dxf"]', '/font/honoka_antique_kaku_regular.json'
```
