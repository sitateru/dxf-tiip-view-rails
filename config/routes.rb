DxfTiipView::Engine.routes.draw do
    
    get :sample,        to: 'sample#index'
    post :view,         to: 'dxf#view'
    post :download,     to: 'dxf#download'
    
end
