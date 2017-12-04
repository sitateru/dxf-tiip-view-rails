DxfTiipView::Engine.routes.draw do
    
    get :sample,    to: 'sample#index'
    get :dxf_tiip_view,     to:'sample#dxf-tiip-view'
end
