module DxfTiipView
  class Engine < ::Rails::Engine
    isolate_namespace DxfTiipView
    initializer 'dxf_tiip_view.action_view_helpers' do
      ActiveSupport.on_load :action_view do
        include DxfTiipView::ViewHelper
      end
    end
  end
end
